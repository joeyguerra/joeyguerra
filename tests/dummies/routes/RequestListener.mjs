class RequestListener {
    constructor(server, regex) {
        this.server = server
        this.regex = regex
    }

    async onRequest(req, res) {
        if (this.regex.test(req.url)) {
            res.handled = true
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end('Dummy route')
        }
    }
}
export default async server => new RequestListener(server, /^\/dummy\/route\/\d+$/)