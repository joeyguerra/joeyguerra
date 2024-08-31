import { DiscordAdapter } from '@hubot-friends/hubot-discord/src/DiscordAdapter.mjs'
import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { Server } from 'socket.io'

class WebSiteConnector extends DiscordAdapter {
    #io
    constructor (robot, client) {
        super(robot, client)
        if (!robot.config) {
            robot.config = {}
        }
        robot.config = Object.assign(robot.config, process.env)
        robot.config.TIME_ZONE = 'CST'
        robot.config.LANG = 'en-US'
        robot.logger.info('Mapped environment to config.')
    }
    async run () {
        await super.run()
        this.robot.router.use((req, res, next) => {
            let origin = this.robot.config.NODE_ENV == 'production' ? 'www.joeyguerra.com' : '*'
            res.header('Access-Control-Allow-Origin', origin)
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            next()
        })
    }
    #connection (socket) {
        let { request } = socket
        let referrer = new URL(request.headers.referer)
        let room = referrer.pathname
        socket.on('error', console.error)
        socket.on('message', async (message) => {
            console.log('message', message)
            await this.incoming(message)
        })
    }
    async incoming (message) {
        console.log('incoming', message)
    }
    async outgoing (envelope, strings) {
        console.log('outgoing', envelope, strings)
    }
}

export default {
    async use (robot) {
        let client = new Client({intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions
        ], partials: [Partials.Channel, Partials.Message, Partials.User, Partials.Reaction]})
        return new WebSiteConnector(robot, client)
    }
}