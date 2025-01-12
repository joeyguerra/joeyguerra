import { Cookie } from '../src/Cookie.mjs'

export default () => {
    return async (req, res) => {
        if (!req.headers.cookie) return
        const cookies = Cookie.deserialize(req.headers.cookie)
        res.setHeader('Set-Cookie', req.headers.cookie)
    }
}