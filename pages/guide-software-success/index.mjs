
import { Page } from 'juphjacs'
import crypto from 'node:crypto'

let CSRF_SECRET = process.env.CSRF_SECRET

function generateCsrfToken() {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(16).toString('hex')
    const data = `${timestamp}:${randomBytes}`
    const signature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex')
    return `${data}:${signature}`
}

function verifyCsrfToken(token, maxAge = 3600000) { // 1 hour default
    if (!token) return false
    
    const parts = token.split(':')
    if (parts.length !== 3) return false
    
    const [timestamp, randomBytes, signature] = parts
    const data = `${timestamp}:${randomBytes}`
    const expectedSignature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex')
    
    // Verify signature
    if (signature !== expectedSignature) return false
    
    // Check if token is expired
    const tokenTime = parseInt(timestamp, 10)
    if (Date.now() - tokenTime > maxAge) return false
    
    return true
}

class IndexPage extends Page {
    constructor (pagesFolder, filePath, template, context) {
        super(pagesFolder, filePath, template, context)
        this.layout = './pages/guide-software-success/layout.html'
        this.title = 'Get Your Free Guide to Software Success'
        this.canonical = 'https://joeyguerra.com/guide-software-success/index.html'
        this.uri = '/guide-software-success/index.html'
        this.excerpt = 'Get Your Free Guide to Software Success'
        this.published = new Date('2025-11-08T08:00:00Z')
        this.image = ''
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon16 = ''
        this.csrfToken = ''
        if (!CSRF_SECRET) {
            this.context.logger.warn('Warning: CSRF_SECRET environment variable is not set. Using a default insecure secret.')
            CSRF_SECRET = 'change-this-secret-in-production'
        }
    }

    async get(req, res) {
        this.csrfToken = generateCsrfToken()
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        await res.end(this.content)
    }

    async post(req, res) {
        const { name, email, csrf } = await req.json()
        if (!verifyCsrfToken(csrf)) {
            res.statusCode = 403
            res.setHeader('Content-Type', 'application/json')
            await res.end(JSON.stringify({ error: 'Invalid or expired CSRF token' }))
            return
        }        
        let headers = Object.keys(req.headers).reduce((acc, key) => {
            acc[key] = req.headers[key]
            return acc
        }, {})
        this.context.db.addEvent('guide-software-success-signup', { name, email, headers, timestamp: new Date().toISOString() })
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        await res.end(JSON.stringify({ success: true, redirectUrl: 'guide.html' }))
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new IndexPage(pagesFolder, filePath, template, delegate)
}
