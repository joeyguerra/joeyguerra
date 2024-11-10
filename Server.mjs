import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, extname, join, relative, resolve } from 'node:path'
import fs from 'node:fs'
import { opendir, mkdir, readFile, writeFile, cp } from 'node:fs/promises'
import EventEmitter from 'node:events'
import { Server as SocketServer } from 'socket.io'
import createDebug from 'debug'
import pkg from './package.json' with {type: 'json'}
import { Template, EVENTS } from './src/Template.mjs'
import { TemplateMarkdown } from './src/TemplateMarkdown.mjs'
import { RequestParams } from './src/RequestParams.mjs'
import { ChokidarWannabee } from './src/ChokidarWannabee.mjs'
import { UriToStaticFileRoute } from './src/UriToStaticFileRoute.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PAGES = join(__dirname, 'pages')
const RESOURCES = 'resources'
const SITE_FOLDER = '_site'
const CONTENT_TYPE = {
    css: 'text/css',
    html: 'text/html',
    txt: 'text/plain',
    js: 'text/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpg',
    svg: 'image/svg+xml',
    mjs: 'text/javascript',
    webp: 'image/webp',
    xml: 'application/xml'
}

class IncomingMessageOnSocket extends IncomingMessage {
    constructor(socket, urlParsed) {
        super(socket)
        this.urlParsed = urlParsed
    }
}

class IncomingMessageOnRequest extends IncomingMessage {
    constructor(req) {
        super(req)
    }
}

const PACKAGE_NAME = `${pkg.name}:server`
const debug = createDebug(PACKAGE_NAME)

async function* readAllFiles(folder) {
    const dir = await opendir(folder)
    for await (const dirent of dir) {
        const entryPath = join(folder, dirent.name)
        if (dirent.isDirectory()) {
            yield* readAllFiles(entryPath)
        } else {
            yield entryPath
        }
    }
}

function ifSlashAddIndex(pathname) {
    let modifiedPathname = pathname
    if (/\/$/.test(modifiedPathname)) {
        modifiedPathname = `${modifiedPathname}index.html`
    }
    return modifiedPathname
}

async function * loadPlugins() {
    for await (const file of await opendir(join(__dirname, 'plugins'))) {
        if (file.isDirectory()) continue
        if (extname(file.name) !== '.mjs') continue
        yield await import(join(file.parentPath, file.name))
    }
}

async function * loadMiddlewares() {
    for await (const file of await opendir(join(__dirname, 'middlewares'))) {
        if (file.isDirectory()) continue
        if (extname(file.name) !== '.mjs') continue
        yield await import(join(file.parentPath, file.name))
    }
}

function getTemplate(ext) {
    switch (ext) {
        case '.md':
            return new TemplateMarkdown(readFile, PAGES)
        case '.html':
            return new Template(readFile, PAGES)
        default:
            return null
    }
}

async function renderTemplate(filePath, routes, layouts, initialContext = {}) {
    let ext = extname(filePath)
    let content = await readFile(filePath, 'utf-8')
    let template = getTemplate(ext)
    process.emit(EVENTS.PRE_TEMPLATE_RENDER, filePath, initialContext, content)
    let output = ''
    try {
        output = await template.render(content, initialContext)
    } catch(e){
        console.log('error rendering', filePath)
        throw e
    }
    if (template.context.route) {
        routes.add(new UriToStaticFileRoute(template.context.route, resolve(__dirname, filePath), renderTemplate))
    }
    if (template.context.layout) {
        let keyName = resolve(__dirname, template.context.layout)
        let key = layouts.get(keyName)
        if (!key) {
            layouts.set(keyName, new Set())
            key = layouts.get(keyName)
        }
        key.add(resolve(__dirname, filePath))
    }
    if (template.context.init ) {
        template.context.init()
    }
    process.emit(EVENTS.TEMPLATE_RENDERED, filePath, template.context, output)
    return { output, template, routes, layouts }
}

async function copyFoldersFrom(root, destination) {
    const dir = await opendir(root)
    for await (let folder of dir) {
        try {
            await copyFileFrom(join(folder.parentPath, folder.name), join(destination, folder.name))
        } catch (e) {
            debug('error copying', e)
        }
    }
}

async function copyFileFrom(file, destination) {
    try {
        await cp(file, destination, { recursive: true })
    } catch (e) {
        debug('error copying', e)
    }
}
async function generateStaticSite(renderTemplate) {
    let routes = new Set()
    let layouts = new Map()
    let localImports = new Map()
    try{await mkdir(SITE_FOLDER)}catch(e){}
    for await (const file of readAllFiles(PAGES)) {
        await genFile(file, renderTemplate, routes, layouts, localImports)
    }
    process.emit(EVENTS.STATIC_SITE_GENERATED, routes, layouts)
    return { routes, layouts, localImports }
}

async function genFile(file, renderTemplate, routes, layouts, localImports) {
    // TODO: This strategy is not robust. It should be improved.
    if (file.includes('layout')) return
    let ext = extname(file)
    if (!['.md', '.html'].includes(ext)) return
    let newFileName = file.replace('.md', '.html').replace(PAGES, SITE_FOLDER)
    await mkdir(dirname(newFileName), { recursive: true })
    const req = new IncomingMessage()
    const res = new ServerResponse(req)
    req.url = `http://localhost/${relative(SITE_FOLDER, newFileName)}`
    req.urlParsed = new URL(req.url)
    req.params = new RequestParams(new URL(req.url), null)

    const { output, template } = await renderTemplate(file, routes, layouts, { req, res })

    const importRegex = /import\s+{[^}]+}\s+from\s+['"]([^'"]+\.mjs)['"]/g
    if (output.includes('import') || output.includes('require')) {
        let match = null
        while ((match = importRegex.exec(output)) !== null) {
            let keyName = resolve(PAGES, match[1].replace(/^\//, ''))
            let key = localImports.get(keyName)
            if (!key) {
                localImports.set(keyName, new Set())
                key = localImports.get(keyName)
            }
            key.add(resolve(__dirname, file))
        }
    }

    const cssRegex = /<link[^>]+href="(?!http|https)([^"]+\.css)"[^>]*>/g
    if (output.includes('<link')) {
        let match = null
        while ((match = cssRegex.exec(output)) !== null) {
            let keyName = resolve(PAGES, match[1].replace(/^\//, ''))
            let key = localImports.get(keyName)
            if (!key) {
                localImports.set(keyName, new Set())
                key = localImports.get(keyName)
            }
            key.add(resolve(__dirname, file))
        }
    }

    const scriptRegex = /<script[^>]+src="(?!http|https)([^"]+)"[^>]*><\/script>/g
    if (output.includes('<script')) {    
        let match = null
        while ((match = scriptRegex.exec(output)) !== null) {    
            let keyName = resolve(PAGES, match[1].replace(/^\//, ''))
            let key = localImports.get(keyName)
            if (!key) {
                localImports.set(keyName, new Set())
                key = localImports.get(keyName)
            }
            key.add(resolve(__dirname, file))
        }
    }
    await writeFile(newFileName, output)
    return {routes, layouts, localImports}
}

async function broadcast(filePath, relativePath, hotReloadNamespace, routes, layouts, localImports, clients) {
    const ext = extname(filePath)
    await genFile(filePath, renderTemplate, routes, layouts, localImports)
    if (filePath.includes(join(PAGES, RESOURCES))) {
        await copyFileFrom(filePath, join(SITE_FOLDER, relativePath.replace(`${RESOURCES}/`, '')))
    }
    for (const [socketId, context] of clients.entries()) {
        debug('filepath', filePath)
        const route = routes.values().find(route => route.match(context.url.pathname))
        debug('broadcasting', context.url.pathname, filePath, relativePath)
        if (context.url.pathname.replace(ext, '').includes(relativePath.replace(ext, '')) || route) {
            filePath = route ? route.filePath : filePath
            const { output, template } = await renderTemplate(filePath, routes, layouts, {req: context.req, res: context.res})
            hotReloadNamespace.to(socketId).emit('file changed', {fileThatTriggeredIt: relativePath, fileName: relativePath, data: output })
        }
        if (localImports.get(filePath)) {
            for (const file of localImports.get(filePath)) {
                const relativeFileIncludes = relative(PAGES, file)
                const route = routes.values().find(route => route.match(context.url.pathname))
                if (context.url.pathname.replace(ext, '').includes(relativeFileIncludes.replace(ext, '')) || route) {
                    const { output, template } = await renderTemplate(file, routes, layouts, {req: context.req, res: context.res})
                    hotReloadNamespace.to(socketId).emit('file changed', { fileThatTriggeredIt: relativePath, fileName: file, data: output })
                }
            }
        }
    }
}

const middlewares = new Set()
async function main (server) {
    for await (const plugin of loadPlugins()) {
        await plugin.default()
    }

    for await (const middleware of loadMiddlewares()) {
        middlewares.add(await middleware.default())
    }

    const { routes, layouts, localImports } = await generateStaticSite(renderTemplate)
    const resources = await opendir(join(PAGES, RESOURCES))
    for await (const file of resources) {
        await copyFileFrom(join(file.parentPath, file.name), join(SITE_FOLDER, file.name))
    }

    const io = new SocketServer(server)
    const clients = new Map()
    const hotReloadNamespace = io.of('/hot-reload')
    const chokidar = new ChokidarWannabee(PAGES, async (folder, event, filePath, absolutePath) => {
        let key = layouts.get(absolutePath)
        if (!key) return false
        for await (const file of key) {
            await chokidar.fire(dirname(file), event, file)
        }
        return true
    })

    hotReloadNamespace.on('connection', socket => {
        debug('connected to hot reloading %s', socket.id)
        const url = new URL(socket.handshake.headers.referer)
        url.pathname = ifSlashAddIndex(url.pathname)
        const req = new IncomingMessageOnSocket(socket, url)
        req.method = 'GET'
        req.url = url.pathname
        req.headers = socket.handshake.headers
        debug('connecting to the hot-reload namespace', url.pathname)
        clients.set(socket.id, {url, req, res: null})
        socket.on('disconnect', () => {
            clients.delete(socket.id)
            debug('/hot-reload user disconnected %s', socket.id)
        })
    })

    io.on('connection', socket => {
        debug('connected %s', socket.id)
        debug('referer', socket.handshake.headers.referer)
        const url = new URL(socket.handshake.headers.referer)
        url.pathname = ifSlashAddIndex(url.pathname)
        const req = new IncomingMessageOnSocket(socket, url)
        req.url = url.pathname
        req.urlParsed = url
        req.headers = socket.handshake.headers
        const route = routes.values().find(route => route.match(url.pathname))
        if (route) {
            req.params = new RequestParams(req.urlParsed, route.regex)
        }
        const res = req.res
        socket.on('chat message', async msg => {
            debug('message is %s', msg)
            if (msg.method) {
                req.method = msg.method
            }
            if (msg.headers) {
                req.headers = msg.headers
            }
            for await (const middleware of middlewares.values()) {
                await middleware(req, res)
            }
            const ext = extname(url.pathname).substring(1)
            const { output, template } = await renderTemplate(route.filePath, routes, layouts, {req, res })
            socket.emit('chat message:response', output)
        })
    })
    
    server.on('request', async (req, res) => {        
        const url = new URL(req.url, `http://${req.headers.host}`)
        if (url.pathname.indexOf('socket.io') > -1) return
        if (url.pathname.indexOf('morphdom-esm.js') > -1) {
            res.setHeader('Content-Type', 'text/javascript')
            fs.createReadStream(join(__dirname, 'node_modules/morphdom/dist/morphdom-esm.js')).pipe(res)
            return
        }

        for await (const middleware of middlewares.values()) {
            await middleware(req, res)
            if (res.headersSent) return
        }

        req.urlParsed = new URL(req.url ?? '/', `http://${req.headers?.host ?? 'localhost'}`)
        url.pathname = ifSlashAddIndex(url.pathname)
        const route = routes.values().find(route => route.match(url.pathname))
        if (route) {
            const ext = extname(req.url).substring(1)
            req.params = new RequestParams(req.urlParsed, route.regex)
            debug('handling route', req.url, req.params)
            const { output, template } = await renderTemplate(route.filePath, routes, layouts, {req, res })
            if (res.headersSent) return
            res.setHeader('Content-Type', CONTENT_TYPE[ext] ?? 'text/html')
            return res.end(output)
        }

        req.params = new RequestParams(req.urlParsed, null)
        try {
            const ext = extname(url.pathname).substring(1)
            if (ext) {
                await fs.promises.access(join(SITE_FOLDER, url.pathname), fs.constants.F_OK)
                res.setHeader('Content-Type', CONTENT_TYPE[ext] ?? 'application/octet-stream')
                return fs.createReadStream(join(SITE_FOLDER, url.pathname)).pipe(res)
            }
        } catch (e) {
            debug('File not found', e)
        }
    
        res.statusCode = 404
        res.end()
    })

    Array('add', 'change').forEach(event => {
        chokidar.watch(PAGES).on(event, async (filePath, stats) => {
            const relativePath = relative(PAGES, filePath)
            await broadcast(filePath, relativePath, hotReloadNamespace, routes, layouts, localImports, clients)
        })
    })

    server.listen(process.env.PORT ?? 3000, () => {
        createDebug.log(`Server running at http://localhost:${server.address().port}/`)
    })
}

const server = createServer({ IncomingMessage: IncomingMessageOnRequest })
const args = process.argv.reduce((acc, current, i, items) => {
    if (current === '--execute') {
        acc.execute = items[i + 1]
    }
    return acc
}, {execute: null})

if (args.execute === 'build') {
    for await (const plugin of loadPlugins()) {
        await plugin.default()
    }

    for await (const middleware of loadMiddlewares()) {
        middlewares.add(await middleware.default())
    }

    const { routes, layouts, localImports } = await generateStaticSite(renderTemplate)
    const resources = await opendir(join(PAGES, RESOURCES))
    for await (const file of resources) {
        await copyFileFrom(join(file.parentPath, file.name), join(SITE_FOLDER, file.name))
    }
} else {
    main(server)
}
