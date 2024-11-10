class EmptyRequestListener {
    constructor(server, regex) {
        this.server = server
        this.regex = regex
    }
    async onRequest(req, res) {
        if (!this.regex.test(req.url)) return
        res.handled = true
        res.writeHead(200)
        res.end()
    }
}

export { EmptyRequestListener }