import assert from 'node:assert/strict'
import { test } from 'node:test'
import http from 'node:http'
import EventEmitter from 'node:events'
import fs, { promises as File } from 'node:fs'
import { dirname, join } from 'node:path'
import { FileRequestListener } from '../src/FileRequestListener.mjs'
import { EmptyRequestListener } from '../src/EmptyRequestListener.mjs'
import { Cookie, CookieHeader } from '../src/Cookie.mjs'


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
    async listen(port) {
        this.port = port
        this.server = this.http.createServer()
        let args = null
        while((args = this.#queue.shift())){
            this.on(...args)
        }
        this.server.on('request', async (req, res) => {
            for await (const listener of this.requestListeners) {
                if (res.handled) {
                    break
                }
                await listener.onRequest(req, res)
            }
        })
        return new Promise((resolve) => {
            this.server.listen(port, resolve)
        })
    }
    async close () {
        this.server.removeAllListeners()
        await new Promise((resolve) => {
            this.server.close(resolve)
        })
    }
}

class CookieRequestListener {
    constructor(server) {
        this.server = server
    }
    async onRequest(req, res) {
        if (!req.headers.cookie) return
        const cookies = Cookie.deserialize(req.headers.cookie)
        res.setHeader('Set-Cookie', req.headers.cookie)
    }
}

class CookieSetterListener {
    constructor(server) {
        this.server = server
    }
    async onRequest(req, res) {
        const cookie = new CookieHeader('test', 123)
        res.setHeader('Set-Cookie', cookie.serialize())
    }
}

await test('ServerTeset', async (t) => {
    let server = null
    
    t.beforeEach(async () => {
        server = new Server(http)
        await server.listen(0)
    })

    t.afterEach(async () => {
        await server.close()
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
        const folder = await File.opendir(`${__dirname}/dummies/routes`, { recursive: true })
        for await (const file of folder) {
            if (file.isDirectory()) {
                continue
            }
            const route = (await import(`${file.parentPath}/${file.name}`)).default
            server.requestListeners.push(await route(server))
        }
        const response = await fetch(`http://localhost:${server.address.port}/dummy/route/123`)
        assert.deepEqual(response.status, 200)
    })

    await t.test('should set request cookies on the response', async () => {
        server.requestListeners.push(new CookieRequestListener(server))
        server.requestListeners.push(new FileRequestListener(server, HTML_FOLDER))
        const response = await fetch(`http://localhost:${server.address.port}/index.html`, {
            headers: {
                'Cookie': 'test=123'
            }
        })
        assert.deepEqual(response.headers.get('set-cookie'), 'test=123')
    })

    await t.test('can set a cookie from the server', async () => {
        server.requestListeners.push(new CookieRequestListener(server))
        server.requestListeners.push(new CookieSetterListener(server))
        server.requestListeners.push(new EmptyRequestListener(server, /^\/index\.html/))
        const response = await fetch(`http://localhost:${server.address.port}/index.html?cookie=test`)
        assert.deepEqual(response.headers.get('set-cookie'), 'test=123')
    })

})
