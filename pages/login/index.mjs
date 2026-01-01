
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'
import { Buffer } from 'node:buffer'

class LoginPage extends Page {
    constructor (rootFolder, filePath, template, context) {
        super(rootFolder, filePath, template, context)
        this.layout = './pages/layouts/index.html'
        this.title = 'Login'
        this.canonical = 'https://joeyguerra.com/login/'
        this.route = new RegExp('^/login/?$')
        this.discordUrl = null
    }

    async get(req, res) {
        const redirectUrl = req.query?.redirectUrl ?? '/'
        const randNumber = Math.random()
        const state = Buffer.from(`${decodeURIComponent(redirectUrl)};${randNumber};${req.sessionID}`).toString('base64')
        this.discordUrl = `${process.env.DISCORD_API_HOST}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URL)}&response_type=code&scope=identify&state=${state}`
        await this.render()
        await res.end(this.content)
    }
}

export default async (rootFolder, filePath, template, context) => {
    return new LoginPage(rootFolder, filePath, template, context)
}
