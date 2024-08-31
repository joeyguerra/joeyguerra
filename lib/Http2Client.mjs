class Http2Client {
    constructor(url, http2) {
        this.session = http2.connect(url)
        ;['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'].forEach(method => {
            this[method.toLowerCase()] = async (path, headers, body) => await this.request(method, path, headers, body)
        })
    }
    close() {
        this.session.close()
    }
    async request(method, path, requestHeaders, body) {
        return new Promise((resolve, reject) => {
            const req = this.session.request({':method': method, ':path': path, ...requestHeaders})
            let data = ''
            let headers = null
            let flags = null
            req.on('response', (responseHeaders, responseFlags) => {
                headers = responseHeaders
                flags = responseFlags
                // resolve({data, headers, flags})
            })
            req.on('data', chunk => {
                data += chunk.toString()
            })
            req.on('end', () => {
                resolve({data, headers, flags})
            })
            req.on('error', err => {
                reject({err, data, headers, flags})
            })
            req.on('close', () => {
                req.close()
            })
            if (body) {
                req.write(body)
            }
            req.end()
        })
    }
}

export { Http2Client }