import fs from 'node:fs'
import path from 'node:path'

class FileRequestListener {
    constructor(server, folder = 'html') {
        this.server = server
        this.folder = folder.replace(/\/$/, '')
    }
    static getContentType (ext) {
        return {
            '.html': 'text/html',
            '.ico': 'image/x-icon',
            '.txt': 'text/plain',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.mjs': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
        }[ext] ?? 'application/octet-stream'
    }
    async onRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${this.server.address.port}`)
        const ext = url.pathname.match(/\.\w+$/)
        if (!ext) {
            res.writeHead(404)
            res.end()
            res.handled = true
            return
        }
        
        const filePath = `${this.folder}${url.pathname}`
        const readStream = fs.createReadStream(filePath)
        readStream.on('open', () => {
            // This gets called twice.
            if (res.handled) {
                return
            }

            res.setHeader('Content-Type', FileRequestListener.getContentType(ext[0]))
            res.writeHead(200)
            res.handled = true
            readStream.pipe(res)
        })
        
        readStream.on('error', () => {
            // This gets called twice.
            if(res.handled){
                return
            }

            res.writeHead(404)
            res.end()
            res.handled = true
        })
    }
}

export {
    FileRequestListener
}