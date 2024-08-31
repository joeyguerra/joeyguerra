// Description:
//  Buid a static website from the contents of the www folder.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra


import File from 'node:fs/promises'
import path from 'node:path'
import fs, {createReadStream, createWriteStream} from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import BodyParser from 'body-parser'
import MethodOverride from 'method-override'
import express from 'express'
import session from 'express-session'
import { readFiles } from '../../lib/ReadFiles.mjs'
import MemoryStore from '../../lib/MemoryStore.mjs'
import MarkdownIt from "markdown-it"
import Meta from "markdown-it-meta"
import {load as cheerio} from 'cheerio'
import { Template } from '../../lib/Template.mjs'

const DIR_NAME = fileURLToPath(new URL('.', import.meta.url)).replace('/src/scripts/', '')
const THIS_FILE_NAME = fileURLToPath(import.meta.url)
const TEMPLATES_FOLDER = `${path.resolve(DIR_NAME, './templates')}/`
const WWW_FOLDER = `${path.resolve(DIR_NAME, './www')}/`
const PUBLIC_FOLDER = (process.env.PUBLIC_FOLDER ?? `${path.resolve(DIR_NAME, './_site')}`).replace(/\/$/, '') + '/'
const BASE_HREF = (process.env.BASE_HREF ?? '').replace(/\/$/, '')

let posts = []

const topLevelMeta = {
    baseHref () {
        if (!this.uri) return `/${BASE_HREF}/`
        const parts = this.uri.split('/')
        parts.pop()
        return parts.reduce((a, b) => a + '../', `/${BASE_HREF}/`)
    }
}

let touch = async (filePath, logger = () => {}) => {
    try {
        await File.utimes(filePath, new Date(), new Date())
    } catch (e) {
        logger(e)
    }
}

let startWatchingStaticFiles = async (robot)=>{
    robot.logger.info(`Watching ${WWW_FOLDER}`)
    robot.logger.info(`Watching ${TEMPLATES_FOLDER}`)
    let wwwWatcher = await File.watch(WWW_FOLDER, {recursive: true, encoding: 'utf8'})
    let templatesWatcher = await File.watch(TEMPLATES_FOLDER, {recursive: true, encoding: 'utf8'})
    for await (let event of wwwWatcher) {
        robot.logger.info(JSON.stringify(event))
        await touch(THIS_FILE_NAME, robot.logger.debug)
        break
    }
    for await (let event of templatesWatcher) {
        robot.logger.info(JSON.stringify(event))
        await touch(THIS_FILE_NAME, robot.logger.warn)
        break
    }
}

export default async robot => {
    let app = robot.router
    app.disable('x-powered-by')
    express.static.mime.define({'text/javascript': ['js', 'mjs']})
    app.use(express.static(PUBLIC_FOLDER))
    app.use('/lib', express.static('./lib'))
    app.engine('html', async (filename, options, cb) => {
        let html = await File.readFile(filename, 'utf-8')
        let $ = cheerio(html)
        let props = {}
        $('[itemprop]').each((i, el)=>{
            let $el = $(el)
            let prop = $el.attr('itemprop')
            let content = $el.attr('content')
            if(prop == 'headline') {
                content = $el.text()
            }
            if(prop == 'published') {
                content = new Date($el.attr('datetime'))
            }

            if(!content) content = $el.text()
            props[prop] = content
            props.title = props.title ?? props.headline
        })
        props.uri = filename.replace(WWW_FOLDER, '')
        props.relativeLink = props.uri.replace(/^\//, '')
        props.tags = props?.tags ?? []
        if(props.published) props.displayDate = props.published.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        if(filename.includes('blog/') && props.should_publish == 'yes' && props.title) {
            posts.push(props)
        }
        props = {...props, ...topLevelMeta}
        let template = new Template(html, {meta: props, ...options, posts}, partials, functions)
        cb(null, await template.render())
    })
    app.engine('md', async (filePath, options, callback)=>{
        try{
            let data = await File.readFile(filePath, 'utf-8')
            let markdown = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true
            }).use(Meta)
            
            let output = markdown.render(data)
            if(markdown.meta.layout){
                output = `\${hasLayout('${markdown.meta.layout}')}\n${output}`
            }
            markdown.meta.uri = filePath.replace(WWW_FOLDER, '').replace('.md', '.html')
            markdown.meta.relativeLink = markdown.meta.uri.replace(/^\//, '')
            markdown.meta.tags = markdown.meta?.tags ?? []
            try{
                let stat = fs.statSync(filePath)
                markdown.meta.birthtime = stat.birthtime
            }catch(e){
                console.error(e)
            }
            if(markdown.meta.published) markdown.meta.displayDate = markdown.meta.published.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            if(filePath.includes('blog/') && markdown.meta.should_publish == 'yes') {
                posts.push(markdown.meta)
            }
            output = output.replace(/`/g, '<replaced-backtick>')
            markdown.meta = {...markdown.meta, ...topLevelMeta}

            let template = new Template(output, {meta: markdown.meta, ...options}, partials, functions)
            callback(null, (await template.render()).replace(/<replaced-backtick>/g, '`'))
        }catch(e){
            callback(e, null)
        }
    })
    
    app.set('views', [WWW_FOLDER, TEMPLATES_FOLDER])
    app.set('view engine', 'html')
    let files = []
    
    try{await File.mkdir(PUBLIC_FOLDER)}catch(e){}
    let folders = await File.readdir(WWW_FOLDER, {withFileTypes: true})
    
    await readFiles(folders, WWW_FOLDER, {
        async directoryWasFound(info){
            if(!['/layouts', '/pages'].some(folder => info.fileName.includes(folder))) {
                try{await File.mkdir(info.fileName.replace(WWW_FOLDER, PUBLIC_FOLDER))}catch(e){
                    robot.logger.warn(e.message)
                }
            }
            await readFiles(await File.readdir(info.fileName, {withFileTypes: true}), info.fileName, this)
        },
        async fileWasFound(info){
            if (info.fileName.includes('.DS_Store')) return
            if(!info.fileName.includes('/layouts')
                && !info.fileName.includes('/pages')
                && !info.fileName.endsWith('.md')) {
                createReadStream(info.fileName).pipe(createWriteStream(info.fileName.replace(WWW_FOLDER, PUBLIC_FOLDER)))
            }
            files.push(info.fileName)
        }
    })
    await readFiles(await File.readdir(`${DIR_NAME}/resources/`, {withFileTypes: true}), `${DIR_NAME}/resources/`, {
        async directoryWasFound(info){
            try{await File.mkdir(info.fileName.replace(`${DIR_NAME}/resources/`, PUBLIC_FOLDER))}catch(e){robot.logger.warn(e.message)}
            await readFiles(await File.readdir(info.fileName, {withFileTypes: true}), info.fileName, this)
        },
        async fileWasFound(info){
            createReadStream(info.fileName).pipe(createWriteStream(info.fileName.replace(`${DIR_NAME}/resources/`, PUBLIC_FOLDER)))
        }
    })

    const functions = {
        compare: (a, b)=> a == b,
        current: (a, b)=> a.endsWith(b) ? ' current' : '',
        difference: (posts, index)=> posts.length - index - 1,
        format: (date, format)=> date.toLocaleDateString(undefined, format),
        formatTime: (date, format)=> date.toLocaleTimeString(undefined, format),
        formatDate: (date, format)=> date.toLocaleDateString(undefined, format),
    }
    const partials = new Map()
    for await (let file of files){
        let data = await File.readFile(file, 'utf-8')
        let key = file.replace(WWW_FOLDER, '').replace(/[\s|\-]/g, '_')
        if(key.indexOf('.html') > -1) {
            partials.set(key, data)
        }
    }

    let urls = []
    
    for await (let file of files){
        if(file.includes('/layouts')) continue
        if(!(file.endsWith('.html') || file.endsWith('.md'))) continue
        let key = file.replace(WWW_FOLDER, '')
            .replace('.html', '')
            .replace('.md', '')

        let defaultEngine = file.split('.').pop()
        app.set('view engine', defaultEngine)
        let model = {}
        await (new Promise((resolve, reject)=>{
            app.render(key, model, async (err, html)=>{
                if(err) {
                    robot.logger.warn('error rendering', err, file)
                    reject(err)
                    return
                }
                let name = file.replace(WWW_FOLDER, PUBLIC_FOLDER).replace('.md', '.html')
                name = name.replace('/pages', '')
                try{await File.mkdir(name.split('/').slice(0, -1).join('/'))}catch(e){}
                await File.writeFile(name, html, 'utf-8')
                urls.push(name.replace(PUBLIC_FOLDER, ''))
                resolve(html)
            })    
        }))
    }
    posts.sort((a, b) => {
        if(a.published == b.published ) return 0
        return a.published > b.published ? -1 : 1
    })
    let blogIndex = await File.readFile(`${WWW_FOLDER}blog/index.html`, 'utf-8')

    let template = new Template(blogIndex, {meta: topLevelMeta, posts}, partials, functions)
    let blogIndexHtml = await template.render()
    await File.writeFile(`${PUBLIC_FOLDER}blog/index.html`, blogIndexHtml, 'utf-8')

    let sitemap = await File.readFile(`${WWW_FOLDER}sitemap.xml`, 'utf-8')
    let siteMapTemplate = new Template(sitemap, {urls}, partials, functions)
    await File.writeFile(`${PUBLIC_FOLDER}sitemap.xml`, await siteMapTemplate.render())
    app.set('view engine', 'html')
    if(process.env.NODE_ENV == 'development') {
        startWatchingStaticFiles(robot).then(()=>{}).catch(robot.logger.error)
    }
    robot.respond(/pages/, async (res)=>{
        await res.reply('done')
        process.exit(0)
    })
    robot.logger.info(`\x1b[1m\x1b[32mSite built and running on http://localhost:${robot.server.address().port}\x1b[0m`)
}