import createDebug from 'debug'
const debug = createDebug('body-parser')

const parsers = {
    'application/x-www-form-urlencoded': (body) => {
        const params = new URLSearchParams(body)
        const obj = {}
        for (const [key, value] of params.entries()) {
            obj[key] = value
        }
        return obj
    },
    'application/json': (body) => {
        return JSON.parse(body)
    },
    'text/plain': (body) => {
        return body
    },
    'text/html': (body) => {
        return body
    },
    'multipart/form-data': (body) => {
        return body
    }
}

async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            debug('content type', req.headers['content-type'])
            const parser = parsers[req.headers['content-type']]
            if (parser) {
                body = parser(body)
            }
            resolve(body)
        })
        req.on('error', reject)
    })
}

export default async () => {
    return async (req, res) => {
        if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return
        }
        req.body = await parseBody(req)
    }
}