import { CookieHeader } from '../../../src/Cookie.mjs'
export default {
    layout: '../layouts/layout.html',
    title: 'Something that is set',
    obj: {},
    async get(req, res) {
        res.cookies.push(new CookieHeader('name', 'John'))
        res.cookies.push(new CookieHeader('age', 30))
    },
    async post(req, res) {
        this.obj = req.body
    },
    match(req) {
        const url = new URL(req.url, `http://localhost`)
        return url.pathname === '/components/partial.html'
    }
}