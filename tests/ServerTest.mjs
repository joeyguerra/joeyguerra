import assert from 'node:assert/strict'
import { test } from 'node:test'
import http from 'node:http'
import EventEmitter from 'node:events'
import fs, { promises as File } from 'node:fs'
import { dirname, join } from 'node:path'
import { FileRequestListener } from '../src/FileRequestListener.mjs'
import { EmptyRequestListener } from '../src/EmptyRequestListener.mjs'
import CookieManager from '../src/CookieManager.mjs'


const __dirname = new URL('.', import.meta.url).pathname

const HTML_FOLDER = join(__dirname, 'html')

class Server extends EventEmitter {
    #queue = []
    constructor(http) {
        super()
        this.http = http
        this.server = null
        this.requestListeners = []
    }
    get address () {
        return this.server.address()
    }
    on (...args) {
        if (!this.server) {
            return this.#queue.push(args)
        }
        this.server.on(...args)
    }
    off (...args) {
        this.server.off(...args)
    }
    async listen(port, ) {
        this.port = port
        this.server = this.http.createServer()
        let args = null
        while((args = this.#queue.shift())){
            this.on(...args)
        }
        this.server.on('request', async (req, res) => {
            for (const listener of this.requestListeners) {
                if (res.handled) {
                    break
                }
                await listener.onRequest(req, res)
            }
        })
        await new Promise((resolve) => {
            this.server.listen(port, resolve)
        })
    }
    close () {
        this.server.removeAllListeners()
        this.server.close()
    }
}

class CookieRequestListener {
    constructor(server) {
        this.server = server
        this.cookieManager = new CookieManager('super secret secrets')
    }
    async onRequest(req, res) {
        const cookies = this.cookieManager.parseCookies(req.headers.cookie)
        console.log(cookies)
        res.setHeader('Set-Cookie', req.headers.cookie)
    }
}

await test('ServerTeset', async (t) => {
    const server = new Server(http)
    
    await t.before(async () => {
        await server.listen(0)
    })

    t.after(() => {
        server.close()
    })

    await t.afterEach(async (t) => {
        server.removeAllListeners()
    })
    
    await t.test('should serve static pages', async () => {
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        const response = await fetch(`http://localhost:${server.address.port}/index.html`)
        const actual = await response.text()
        assert.deepEqual(response.status, 200)
        assert.deepEqual(actual, `<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Test</hhtml>
    <p>Test</p>
</body>
</html>`)
    })
    
    await t.test('should return 404 if file does not exist', async () => {
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        let numberoftimes = 0
        const response = await fetch(`http://localhost:${server.address.port}/does-not-exist.html?${numberoftimes++}`)
        assert.deepEqual(response.status, 404)
    })
    
    await t.test('should include the correct content-type header', async () => {
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        const response = await fetch(`http://localhost:${server.address.port}/index.html`)
        assert.deepEqual(response.headers.get('content-type'), 'text/html')
    })
    
    await t.test('should handle a request if the url matches the provided regex', async () => {
        server.requestListeners.push(new EmptyRequestListener(server, /^\/socket\.io$/))
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        const response = await fetch(`http://localhost:${server.address.port}/socket.io`)
        assert.deepEqual(response.status, 200)
    })
    
    await t.test('should load request listeners from a folder add them to the server request pipeline', async () => {
        for await (const file of await File.opendir(`${__dirname}/dummies/routes`, { recursive: true })) {
            if (file.isDirectory()) {
                continue
            }
            const route = (await import(`${file.parentPath}/${file.name}`)).default
            await route(server)
        }
        const response = await fetch(`http://localhost:${server.address.port}/route-test.html`)
        assert.deepEqual(response.status, 200)
    })

    await t.test('should retrun cookies that sent', async () => {
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        server.requestListeners.push(new CookieRequestListener(server))
        const response = await fetch(`http://localhost:${server.address.port}/index.html`, {
            headers: {
                'Cookie': 'test=123'
            }
        })
        assert.deepEqual(response.headers.get('set-cookie'), 'test=123')
    })

})
