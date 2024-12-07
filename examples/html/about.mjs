import { CookieHeader } from '../../src/Cookie.mjs'

export default {
    layout: 'layouts/layout.html',
    title: 'About Us Page',
    posts: [],
    match(req) {
        const url = new URL(req.url, `http://localhost`)
        return url.pathname === '/about'
    },
    async get(req, res) {
        this.posts = [
            {
                title: 'Post 1',
                content: 'This is the about page content',
                date: new Date()
            },
            {
                title: 'Another post',
                content: 'This is the second post',
                date: new Date()
            }
        ]
        res.cookies.push(new CookieHeader('message', 'Hi from the about page'))
    }
}