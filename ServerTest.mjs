import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import createHandler from './RequestHandler.mjs'
import http2 from 'node:http2'
import fs, { readFile } from 'node:fs/promises'
import { Http2Client } from './lib/Http2Client.mjs'
import { parse } from 'url'

class OptionsHandler {
    #allow = new Set()
    constructor() {
        this.app = null
    }
    setApp(app) {
        this.app = app
        this.app.options(this.#handleOptionsRequest.bind(this))
    }
    async #handleOptionsRequest(req, stream, headers, flags, rawHeaders) {
        if (headers[':method'] !== 'OPTIONS') return
        const pathname = parse(headers[':path']).pathname
        const allThatMatch = this.#findAllowByPath(pathname)
        if (allThatMatch?.length === 0) {
            stream.respond({':status': 404})
            stream.end()
            return
        }
        const allow = allThatMatch.map(({method, path}) => `${method.toUpperCase()}`).join(', ')
        stream.respond({':status': 204, 'allow': `OPTIONS, ${allow}`})
        stream.end()
    }
    #findAllowByPath(requestPathName) {
        return Array.from(this.#allow).filter(entry => entry.path === requestPathName || (entry.path instanceof RegExp && entry.path.test(requestPathName)))
    }
    #addToAllow(method, path) {
        this.#allow.add({method, path})
    }
    #removeFromAllow(method, path) {
        this.#allow.delete({method, path})
    }
    routeHasBeenAdded(method, path, handler) {
        if (method === 'OPTIONS') return
        this.#addToAllow(method, path)
    }
}
describe.skip('Test Basic Server', () => {
    let server
    let app
    let client

    before(async () => {
        server = http2.createServer()
        app = createHandler(server, [new OptionsHandler()])
        await app.serveStatic(/^\/static\//, '/static', ['./www', './resources'])
        await app.listen(null, 'localhost')
        client = new Http2Client(`http://localhost:${server.address().port}`, http2)
    })

    after(() => {
        client.close()
        server.close()
    })

    it('Throw error if port is already in use', async () => {
        const app2 = createHandler(http2.createServer())
        try {
            await app2.listen(server.address().port, 'localhost')
        } catch (err) {
            assert.equal(err.code, 'EADDRINUSE')
        }
    })
    
    it('Respond to incoming requests', async () => {
        const handler = async (req, stream) => {
            stream.respond({'content-type': 'plain/text; charset=utf-8', ':status': 200})
            stream.end('Hello, World!')
        }
        app.get('/', handler)
        let actual = ''
        const {data, headers, flags} = await client.get('/')
        assert.equal(headers[':status'], 200)
        assert.equal(headers['content-type'], 'plain/text; charset=utf-8')
        assert.equal(data, 'Hello, World!')
        app.remove(handler)
    })

    it('Respond to OPTIONS request when handlers have been added', async () => {
        const getHandler = async (req, stream) => {
            stream.respond({':status': 200})
            stream.end()
        }
        const postHandler = async (req, stream) => {
            stream.respond({':status': 200})
            stream.end()
        }
        app.get('/options/test', getHandler)
        app.post('/options/test', postHandler)
        const {headers, flags} = await client.options('/options/test')
        assert.equal(headers[':status'], 204)
        assert.equal(headers['allow'], 'OPTIONS, GET, POST')
        app.remove(getHandler)
        app.remove(postHandler)
    })

    it('Respond to OPTIONS request when handlers have been added with RegEx paths', async () => {
        const getHandler = async (req, stream) => {
            stream.respond({':status': 200})
            stream.end()
        }
        const postHandler = async (req, stream) => {
            stream.respond({':status': 200})
            stream.end()
        }
        app.get(/\/test\/(\d)/, getHandler)
        app.post(/\/test\/(\d)/, postHandler)
        const {headers, flags} = await client.options('/test/1')
        assert.equal(headers[':status'], 204)
        assert.equal(headers['allow'], 'OPTIONS, GET, POST')
        app.remove(getHandler)
        app.remove(postHandler)
    })

    it('Serve a static file from a specified directory', async () => {
        for await (const file of [{
            name: 'todos.html',
            contentType: 'text/html; charset=utf-8',
            fullPath: './www/todos.html'
        }, {
            name: 'css/todos.css',
            contentType: 'text/css; charset=utf-8',
            fullPath: './resources/css/todos.css'
        }, {
            name: 'webapp/todos.mjs',
            contentType: 'application/javascript; charset=utf-8',
            fullPath: './www/webapp/todos.mjs'
        }]){
            const {data, headers, flags} = await client.get(`/static/${file.name}`)
            assert.equal(headers[':status'], 200)
            assert.equal(headers['content-type'], file.contentType)
            const fileData = await readFile(file.fullPath, 'utf-8')
            assert.equal(data, fileData)
        }
    })
})

describe('Test Template Rendering', () => {
    let server
    let app
    let client

    before(async () => {
        const partials = new Map()
        partials.set('layouts/index.html', await readFile('./www/layouts/index.html', 'utf-8'))
        server = http2.createServer()
        app = createHandler(server, [], {partials})
        await app.listen(null, 'localhost')
        client = new Http2Client(`http://localhost:${server.address().port}`, http2)
    })

    after(() => {
        client.close()
        server.close()
    })

    it('Render a template with data', async () => {
        app.get('/', async (req, stream) => {
            const template = await app.render('./www/index.html', {title: 'Hello, World!', meta: {uri: 'index.html', baseHref() { return './' }}})
            const html = await template.render()
            stream.respond({'content-type': 'text/html; charset=utf-8', ':status': 200})
            stream.end(html)
        })
        const {data, headers, flags} = await client.get('/')
        assert.equal(headers[':status'], 200)
        assert.equal(headers['content-type'], 'text/html; charset=utf-8')
        assert.match(data, /<title>Joey Guerra<\/title>/)
        app.remove('/', app.get)
    })
})