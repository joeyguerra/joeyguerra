import { Page } from 'juphjacs/src/domain/pages/Page.mjs'
import AuthService from './AuthService.mjs'

class DailyTimeLogPage extends Page {
    constructor(rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Daily Time Log'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/daily-time-log/'
        this.excerpt = 'Team-based time logging with event sourcing and NDJSON storage'
        this.uri = '/daily-time-log/'
        this.image = '/images/clock.png'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
        this.published = new Date('2025-12-14')
        this.auth = new AuthService(process.env.JWT_SECRET || 'dev-secret-key')
    }
    async get(req, res) {
        const user = this.getCurrentUser(req)
        if (!user || !this.hasPermission('view_daily_time_log', user)) {
            res.statusCode = 403
            res.setHeader('Content-Type', 'text/plain')
            res.setHeader('Location', '/login')
            res.end('Forbidden')
            return
        }
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        res.end(this.content)
    }

    getCurrentUser(req) {
        const authHeader = req.headers.authorization || ''
        const token = authHeader.split(' ')[1]
        if (!token) return null
        return this.auth.verifyToken(token)
    }

    hasPermission(permission, user) {
        if (!user) return false
        return user.permissions?.includes(permission) || false
    }
}

export default async (rootFolder, filePath, template) => new DailyTimeLogPage(rootFolder, filePath, template)
