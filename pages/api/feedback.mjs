import { Page } from 'juphjacs'

class FeedbackAPI extends Page {
    constructor(pagesFolder, filePath, template, context) {
        super(pagesFolder, filePath, template, context)
        this.title = 'Feedback API'
        this.excerpt = 'Feedback API Endpoint.'
        this.layout = './pages/layouts/component.html'
        this.canonical = 'https://joeyguerra.com/fapi/eedback.html'
        this.image = ''
        this.published = new Date('2026-01-15 12:21:00')
        this.uri = '/feedback.html'
        this.tags = ['feedback', 'api']
        this.urls = []
        this.results = []

    }
    async get(req, res) {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        await res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    }

    async post(req, res) {
        try {
            const body = await req.json()
            const { type, message, url, timestamp, name, email } = body

            if (!message || !type) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                await res.end(JSON.stringify({ error: 'Missing required fields' }))
                return
            }

            // Add event to context.db - Hubot will handle Discord posting
            let headers = Object.keys(req.headers).reduce((acc, key) => {
                acc[key] = req.headers[key]
                return acc
            }, {})

            const eventData = {
                type,
                message,
                url,
                headers,
                timestamp: new Date().toISOString()
            }

            if (name) eventData.name = name
            if (email) eventData.email = email

            this.context.db.addEvent('yesterday-today-feedback', eventData)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            await res.end(JSON.stringify({ success: true }))
        } catch (error) {
            this.context.logger.error('Feedback API error:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            await res.end(JSON.stringify({ error: 'Internal server error' }))
        }
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new FeedbackAPI(pagesFolder, filePath, template, delegate)
}
