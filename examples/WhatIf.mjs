import test from 'node:test'
import assert from 'node:assert/strict'
import { Server } from 'node:http'
import fs, { promises as File } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const DIR_NAME = new URL('.', import.meta.url).pathname.replace('/examples', '')

class Web extends Server {
    constructor() {
        super()
    }
    async genFiles(files, from, to) {
        const modules = new Set()
        for await (const file of files) {
            if (!file.name.includes('.html')) {
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
            if (module.layout) {
                const layoutPath = resolve(file.parentPath, relative(filePath, `${file.parentPath}/${module.layout}`))
                const layout = await File.readFile(layoutPath, 'utf-8')
                content = new Function(...Object.keys({body: content}), `return \`${layout}\`;`)(...Object.values({body: content}))
            }
            await File.mkdir(destination, { recursive: true })
            await File.writeFile(join(destination, file.name), content)
        }
        return Array.from(modules)
    }
}

await test('What if', async t => {
    const server = new Web()
    t.before(async () => {
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
        const listener = (req, res) => {
            fs.createReadStream(`${DIR_NAME}examples/html/index.html`).pipe(res)
        }
        server.on('request', listener)
        const response = await fetch(`http://localhost:${server.address().port}/`)
        const text = await response.text()
        server.removeListener('request', listener)
        assert.match(text, /This is an example/)
    })

    await t.test('static files are generated', async t => {
        await server.genFiles(await File.opendir(`${DIR_NAME}examples/html/components`, { recursive: true }),
            join(DIR_NAME, 'examples/html/components'),
            join(DIR_NAME, 'examples/temp/site'))
        const listener = async (req, res) => {
            const url = new URL(req.url, `http://localhost:${server.address().port}`)
            fs.createReadStream(`${DIR_NAME}examples/temp/site${url.pathname}`).pipe(res)
        }
        server.on('request', listener)
        const response = await fetch(`http://localhost:${server.address().port}/partial.html`)
        const text = await response.text()
        server.removeListener('request', listener)
        assert.match(text, /Partial/)
    })

    await t.test('web pages can define a layout and be rendered with in it', async t => {
        await server.genFiles(await File.opendir(`${DIR_NAME}examples/html/components`, { recursive: true }),
            join(DIR_NAME, 'examples/html/components'),
            join(DIR_NAME, 'examples/temp/site'))
        const listener = async (req, res) => {
            const url = new URL(req.url, `http://localhost:${server.address().port}`)
            fs.createReadStream(`${DIR_NAME}examples/temp/site${url.pathname}`).pipe(res)
        }
        server.on('request', listener)
        const response = await fetch(`http://localhost:${server.address().port}/partial.html`)
        const text = await response.text()
        server.removeListener('request', listener)
        assert.match(text, /DOCTYPE/)
        assert.match(text, /Partial/)
    })

    await t.test('after generating the static files, there is a list of modules that will be mapped to a request', async t => {
        const modules = await server.genFiles(await File.opendir(`${DIR_NAME}examples/html/components`, { recursive: true }),
            join(DIR_NAME, 'examples/html/components'),
            join(DIR_NAME, 'examples/temp/site'))
        for await (let m of modules) {
            const { module, file } = m
            if (!module.match) {
                continue
            }
            server.on('request', async (req, res) => {
                if (!module[req.method.toLowerCase()]) {
                    return
                }
                if (module.match(new URL(req.url, `http://localhost:${server.address().port}`).pathname)) {
                    return await module[req.method.toLowerCase()](req, res)
                }
            })
        }
        assert.equal(server.listeners('request').length, 1)

    })
    
})