import { parse } from 'url'
import { StringDecoder } from 'string_decoder'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { stat } from 'node:fs/promises'
import { Template } from './lib/Template.mjs'
import { readFile } from 'node:fs/promises'

class Http2Handler {
  #handlers = new Set()
  constructor(server, middlewares = [], config = {
    partials: new Map(),
  }) {
    this.server = server
    this.middlewares = middlewares
    this.config = config
    ;['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'].forEach(method => {
        this[method.toLowerCase()] = (path, handler) => {
          if(typeof path == 'function') {
            handler = path
            path = null
          }
          this.route(method, path, handler)
        }
    })
    this.middlewares.forEach(middleware => middleware.setApp(this))
    this.server.on('stream', async (stream, headers, flags, rawHeaders) => {
      const { pathname } = parse(headers[':path'])
      try {
        for await (const {method, path, handler} of this.#handlers) {
          if (pathname === path && headers[':method'] === method) {
            await this.#handle(handler, stream, headers, flags, rawHeaders)
          }
  
          if (path instanceof RegExp && path.test(pathname) && headers[':method'] === method) {
            await this.#handle(handler, stream, headers, flags, rawHeaders)
          }
  
          if (path === null && headers[':method'] === method) {
            await this.#handle(handler, stream, headers, flags, rawHeaders)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        stream.respond({':status': 500})
        stream.end('Internal Server Error')
      }
  
      if (!stream.headersSent) {
        stream.respond({':status': 404})
        stream.end('Not found')
      }
      // if(!stream.destroyed || !stream.closed) {
      //   stream.end()
      // }
    })
  }
  async #handle(handler, stream, headers, flags, rawHeaders) {
    const decoder = new StringDecoder('utf-8')
    let body = ''
    try {
      for await (const chunk of stream) {
        body += decoder.write(chunk)
      }
    } catch (e) {
      console.error('error reading stream', e)
    }
    body += decoder.end()
    const req = { method: headers[':method'], url: headers[':path'], body }
    await handler.call(this, req, stream, headers, flags, rawHeaders)
  }
  async render (fullFilePath, model, partials) {
    partials = partials ?? this.config.partials
    const html = await readFile(fullFilePath, 'utf-8')
    const template = new Template(html, model, partials)  
    return template
  }
  serveStatic(regex, path, roots) {
    this.get(regex, async (req, stream, headers, flags, rawHeaders) => {
      const { pathname } = parse(headers[':path'])
      if (!regex.test(pathname)) return
      const file = pathname.slice(path.length)
      let rootPath = ''
      for await (const root of roots) {
        try {
          await stat(`${root}${file}`)
          rootPath = root
          break
        } catch (err) {
        }
      }
      try {
        const fileStream = createReadStream(`${rootPath}${file}`)
        fileStream.on('error', err => {
          console.error('error from reading file', err)
          stream.respond({':status': 404, 'content-type': 'text/html'})
            .end('Not Found')
        })
        fileStream.pipe(stream)
      } catch (e) {
        console.error(e)
      }
      // get file extension from pathname
      const fileExtension = extname(pathname)
      let contentType = 'application/octet-stream'
      switch (fileExtension) {
          case '.html':
              contentType = 'text/html; charset=utf-8'
              break
          case '.css':
              contentType = 'text/css; charset=utf-8'
              break
          case '.js', '.mjs':
              contentType = 'application/javascript; charset=utf-8'
              break
          case '.json':
              contentType = 'application/json; charset=utf-8'
              break
          case '.png':
              contentType = 'image/png'
              break
          case '.jpg':
          case '.jpeg':
              contentType = 'image/jpeg'
              break
          case '.gif':
              contentType = 'image/gif'
              break
          case '.pdf':
              contentType = 'application/pdf'
              break
          // Add more file extensions and their corresponding content types here
      }
      stream.respond({ ':status': 200, 'content-type': contentType }).end('Ok')
    })
  }
  remove(method, path, handler) {
    let toDelete = {method, path, handler}
    if (!method && !path && handler) {
      for (const {method, path, handler} of this.#handlers) {
        if (handler === handler) {
          toDelete = {method, path, handler}
        }
      }
    }
    this.#handlers.delete(toDelete)
  }
  route(method, path, handler) {
    this.#handlers.add({method: method.toUpperCase(), path, handler})
    this.middlewares.forEach(middleware => {
      if(middleware.routeHasBeenAdded) {
        middleware.routeHasBeenAdded(method, path, handler)
      }
    })
  }
  #onFrameError(type, code, id) {
    console.error(err)
  }
  #onGoaway(code, lastStreamId, opaqueData) {
    console.log('GOAWAY received')
  }
  #onLocalSettings(settings) {
    console.log('Local settings updated')
  }
  #onPing(payload) {
    console.log('Ping received')
  }
  #onRemoteSettings(settings) {
    console.log('Remote settings updated')
  }
  #onTimeouot() {
    console.log('Timeout')
  }
  async listen(port, host) {
    return new Promise((resolve, reject) => {
        this.server.on('error', reject)
        this.server.on('frameError', this.#onFrameError.bind(this))
        this.server.on('goaway', this.#onGoaway.bind(this))
        this.server.on('localSettings', this.#onLocalSettings.bind(this))
        this.server.on('ping', this.#onPing.bind(this))
        this.server.on('remoteSettings', this.#onRemoteSettings.bind(this))
        this.server.on('timeout', this.#onTimeouot.bind(this))
        this.server.listen(port ?? 0, host, () => {
            this.server.off('error', reject)
            resolve(this.server)
        })
    })
  }
}

export default (server, middlewares, options) => new Http2Handler(server, middlewares, options)
export { Http2Handler }
