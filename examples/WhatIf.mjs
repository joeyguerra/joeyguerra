import test from 'node:test'
import assert from 'node:assert/strict'
import http, { Server, IncomingMessage, ServerResponse } from 'node:http'
import fs, { promises as File } from 'node:fs'
import { dirname, join, relative, resolve, extname } from 'node:path'
import bodyParser from '../middlewares/03-BodyParser.mjs'

const DIR_NAME = new URL('.', import.meta.url).pathname.replace('/examples', '')
const SITE_FOLDER = join(DIR_NAME, 'examples/temp/site')
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

class WebServerResponse extends ServerResponse {
    constructor(req) {
        super(req)
        this.cookies = []
    }
}

class WebRequest extends IncomingMessage {
    constructor(req) {
        super(req)
        this.urlObject = new URL(this.url, `http://localhost:${this.socket.localPort}`)
    }
}

class Context {
    constructor(file) {
        this.file = file
    }
    async include(relativeFilePath, context) {
        const filePath = join(this.file.parentPath, relativeFilePath)
        const modulePath = resolve(this.file.parentPath, `${relativeFilePath.replace('.html', '.mjs')}`)
        const module = (await import(modulePath)).default
        let content =  await File.readFile(filePath, 'utf-8')
        content = await (new AsyncFunction(...Object.keys(module), 'context', 'body', `
            return \`${content}\`
        `)(...Object.values(module), context, content))
        return content
    }
}

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor

async function genFiles(files, from, to) {
    const modules = new Set()
    for await (const file of files) {
        if (!file.name.includes('.html')) {
            continue
        }
        if (file.name.includes('layout')) {
            continue
        }
        const filePath = `${file.parentPath}/${file.name}`
        const modulePath = `${file.parentPath}/${file.name.replace('.html', '.mjs')}`
        const destination = file.parentPath.replace(from, to)
        let content = await File.readFile(filePath, 'utf-8')
        const module = (await import(modulePath)).default
        if (module) {
            modules.add({module, file})
        }
        const context = new Context(file)
        content = await (new AsyncFunction(...Object.keys(module), 'context', 'content', `
            return \`${content}\`
        `)(...Object.values(module), context, content))
        if (module.layout) {
            const layoutPath = resolve(file.parentPath, module.layout)
            const layout = await File.readFile(layoutPath, 'utf-8')
            content = await (new AsyncFunction(...Object.keys(module), 'context', 'body', `
                return \`${layout}\`
            `)(...Object.values(module), context, content))
        }
        await File.mkdir(destination, { recursive: true })
        await File.writeFile(join(destination, file.name), content)
    }
    return Array.from(modules)
}

async function regenFile(pkg, url) {
    const { module, file } = pkg
    const filePath = join(file.parentPath, file.name)
    let content = await File.readFile(filePath, 'utf-8')
    const context = new Context(file)
    content = await (new AsyncFunction(...Object.keys(module), 'context', 'content', `
        return \`${content}\`
    `)(...Object.values(module), context, content))

    if (module.layout) {
        const layoutPath = resolve(file.parentPath, module.layout)
        const layout = await File.readFile(layoutPath, 'utf-8')
        content = await (new AsyncFunction(...Object.keys(module), 'context', 'body', `
            return \`${layout}\`
        `)(...Object.values(module), context, content))
    }
    return content
}

async function bootstrap(server) {
    const modules = await genFiles(await File.opendir(`${DIR_NAME}examples/html`, { recursive: true }),
        join(DIR_NAME, 'examples/html'),
        join(DIR_NAME, 'examples/temp/site')
    )

    File.appendFile(join(SITE_FOLDER, 'log.txt'), `started: ${new Date().toISOString()}\n`)

    server.on('close', () => {
        File.appendFile(join(SITE_FOLDER, 'log.txt'), `closed: ${new Date().toISOString()}\n`)
    })

    server.on('request', async (req, res) => {

        await ((await bodyParser())(req, res))

        if (req.url === '/') {
            req.url = '/index.html'
        }

        if (req.headers.cookie) {
            req.cookies = Object.fromEntries(req.headers.cookie.split(/;\s?/).map(c => c.split('=')))
        }

        res.cookies = []
        let wasHandled = false
        const lowerCaseMethod = req.method.toLowerCase()
        const responsibleModule = modules.find(m => m.module.match && m.module.match(req) && m.module[lowerCaseMethod])

        if (responsibleModule) {
            await responsibleModule.module[lowerCaseMethod](req, res)
            wasHandled = true
        }
        
        if (res.cookies.length > 0) {
            res.setHeader('Set-Cookie', res.cookies.map(c => c.serialize()).join('; ').replace(/;\s?$/, ''))
        }

        const url = new URL(req.url, `http://localhost:${server.address().port}`)

        if (wasHandled) {
            const output = await regenFile(responsibleModule, url)
            res.write(output)
            return res.end()
        }

        try {
            let ext = extname(url.pathname).substring(1)
            let filePath = join(SITE_FOLDER, url.pathname)
            if (ext.length === 0) {
                filePath = `${filePath}.html`
                ext = 'html'
            }
            await File.access(filePath, fs.constants.F_OK)
            res.setHeader('Content-Type', CONTENT_TYPE[ext] ?? 'application/octet-stream')
            wasHandled = true
            return fs.createReadStream(filePath).pipe(res)
        } catch (e) {
            console.info(`${join(SITE_FOLDER, url.pathname)} not found`)
        }

        if (!wasHandled) {
            res.statusCode = 404
        }

        if (!res.writableEnded) {
            res.end()
        }

    })
}

await test('What if', async t => {
    const server = http.createServer({ IncomingMessage: WebRequest, ServerResponse: WebServerResponse })
    
    t.before(async () => {
        await bootstrap(server)
        return new Promise((resolve, reject) => {
            server.listen(0, () => {
                resolve()
            })
        })    
    })
    t.after(() => {
        server.close()
    })
    await t.test('i could serve a static file', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/`)
        const text = await response.text()
        assert.match(text, /This is an example/)
    })

    await t.test('static files are generated', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`)
        const text = await response.text()
        assert.match(text, /Partial/)
    })

    await t.test('respond with 404 if the file does not exist', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/does-not-exist.html`)
        assert.equal(response.status, 404)
    })

    await t.test('web pages can define a layout and be rendered with in it', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`)
        const text = await response.text()
        assert.match(text, /DOCTYPE/)
        assert.match(text, /Partial/)
    })

    await t.test('i can set the page title', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`)
        const text = await response.text()
        assert.match(text, /Something that is set/)
    })

    await t.test('i can include other components into components', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`)
        const text = await response.text()
        assert.match(text, /Another partial/)
        assert.match(text, /Component 1/)
    })
    
    await t.test('set multiple cookies and read them back in the response', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`, {
            headers: {
                cookie: 'name=John; age=30'
            }
        })
        const text = response.headers.get('set-cookie')
        assert.match(text, /name=John; age=30/)
    })

    await t.test('can post form data and read it back', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/components/partial.html`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                name: 'John',
                age: 30
            })
        })
        const text = await response.text()
        assert.match(text, /John/)
        assert.match(text, /30/)
    })

    await t.test('can use pretty urls', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/about`)
        const text = await response.text()
        assert.match(text, /About Us/)
    })

    await t.test('can dynamically populate the page with module variables', async t => {
        const response = await fetch(`http://localhost:${server.address().port}/about`)
        const text = await response.text()
        assert.match(text, /\<h2\>Another post\<\/h2\>/)
    })
})

await test('Cookies', async t => {

})
