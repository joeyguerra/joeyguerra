// Description:
//  Buid a static website from the contents of the www folder and have a chat system to communicate between Discord and the site.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra


import File from 'node:fs/promises'
import path from 'node:path'
import fs, { createReadStream, createWriteStream } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'
import BodyParser from 'body-parser'
import MethodOverride from 'method-override'
import session from 'express-session'
import { readFiles } from '../../lib/ReadFiles.mjs'
import { ObservableArray } from '../../lib/Observable.mjs'
import MemoryStore from '../../lib/MemoryStore.mjs'
import { Server } from 'socket.io'
import { TextMessage, User } from 'hubot'
import MarkdownIt from 'markdown-it'
import Meta from 'markdown-it-meta'
import {load as cheerio} from 'cheerio'
import { Template } from '../../lib/Template.mjs'

const DIR_NAME = fileURLToPath(new URL('.', import.meta.url)).replace('/src/scripts/', '')

const SESSIONS_DIR = `${DIR_NAME}/.data/sessions`
const VISITS_DIR = `${DIR_NAME}/.data`
const TEMPLATES_FOLDER = `${path.resolve(DIR_NAME, './templates')}/`
const WWW_FOLDER = `${path.resolve(DIR_NAME, './www')}/`
const CHANNEL_ID = '1239325514133667931'
const SESSION_RELOAD_INTERVAL = 1000 * 5 * 60
const FROM_NAME = 'the web site'

let visitStream = new ObservableArray()
class Event {
    constructor(id, occurred, recorded, who, originatingSystemId){
        this.envelope = {
            kind: this.constructor.name, id, occurred, recorded, who, originatingSystemId
        }
    }
}
class AddVisitEvent extends Event {
    constructor(sessionId, id, occurred, recorded, who, what, originatingSystemId){
        super(id, occurred, recorded, who, originatingSystemId)
        this.sessionId = sessionId
        this.what = what
    }
}

class VisitViewBuilder {
    constructor (view) {
        this.view = view ?? {}
    }
    apply(view, line) {
        let event = JSON.parse(line)
        this.view = this[event.envelope.kind](view, event)
    }
    AddVisitEvent(view, event) {
        if (!view[event.sessionId]) view[event.sessionId] = {}
        view[event.sessionId] = event
        return view
    }
}

let visitQueue = []
let visitQueueTimer = setInterval(async ()=>{
    let visit = visitQueue.shift()
    if(!visit) return
    await File.appendFile(`${VISITS_DIR}/visits.ndjson`, `${JSON.stringify(visit)}\n`, 'utf-8')
}, 500)


let store = new MemoryStore()
try{
    fs.statSync(SESSIONS_DIR)
}catch(e){
    fs.mkdirSync(SESSIONS_DIR, {recursive: true})
}

async function parse(file) {
    let data = await File.readFile(`${SESSIONS_DIR}/${file}`, 'utf-8')
    let lastLine = data.split('\n').filter(t => t.trim().length > 0).pop()
    let lastVersion = JSON.parse(lastLine)
    let expires = new Date(lastVersion.cookie.expires)
    return { expires, lastVersion }
}

async function syncInMemorySessionsToDisk (store) {
    let sessions = null
    store.all(async (err, s) => {
        sessions = s
    })
    for await (let session of sessions){
        await File.writeFile(`${SESSIONS_DIR}/${session.sessionID}.ndjson`, `${JSON.stringify(session)}\n`, 'utf-8')
    }
    let toExpire = new Set()
    for await (let file of await File.readdir(SESSIONS_DIR)){
        let { expires, lastVersion } = await parse(file)
        if(expires && expires < Date.now()) {
            store.destroy(lastVersion.sessionID)
            await File.unlink(`${SESSIONS_DIR}/${lastVersion.sessionID}.ndjson`)
        }
    }
}
setInterval(syncInMemorySessionsToDisk.bind(this, store), 10000)

async function loadSessionsFromDisk(store){
    let files = await File.readdir(SESSIONS_DIR)
    for await (let file of files){
        let { expires, lastVersion } = await parse(file)
        if(expires && expires > Date.now()) {
            store.set(lastVersion.sessionID, lastVersion)
        }
    }
}
await loadSessionsFromDisk(store)

export default async (robot) => {
    let validationDuringOauthSequence = new Map()
    robot.router.use((req, res, next) => {
        let origin = robot.config.NODE_ENV == 'production' ? 'www.joeyguerra.com' : '*'
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })

    let sessionParser = session({
        secret: robot.config.COOKIE_SECRET,
        cookie: {
            secure: robot.config.NODE_ENV == 'production',
            maxAge: 60*60*1000,
            sameSite: 'lax',
        },
        resave: false,
        saveUninitialized: false,
        name: 'jbot',
        rolling: true,
        store: store
    })

    if(!robot.protectedUrls) robot.protectedUrls = []
    robot.authorize = (req, res, next) => {
        if(req.session.user) {
            return next()
        }
        validationDuringOauthSequence.set(req.sessionID, {
            sessionId: req.sessionId,
            redirectUrl: req.url
        })
        res.redirect(`/login?redirectUrl=${encodeURIComponent(req.url)}`)
    }

    let app = robot.router
    let socketIo = new Server(robot.server, { connectionStateRecovery: {} })
    let botName = robot.alias || robot.name
    socketIo.engine.use(sessionParser)
    socketIo.on('connection', socket => {
        let { request } = socket
        let sessionTimer = setInterval(() => {
            request.session.touch()
        }, SESSION_RELOAD_INTERVAL)
        let session = request.session
        let context = request.url.split('/').reduce((acc, current, i)=>{
            if(i == 2) acc.guild_id = current
            if(i == 3) acc.channel_id = current
            return acc
        }, {
            guild_id: null,
            channel_id: null,
            system: false,
            type: 0,
            content: '',
            author: {...request.session?.user, bot: false, system: false}
        })
        socket.on('disconnect', (type, data) => {
            console.log('disconnect', type, data)
            clearInterval(sessionTimer)
        })
        socket.on('message', async (data, isBinary) => {
            let user = new User('website', { name: FROM_NAME, room: CHANNEL_ID })
            if (request.session?.user) {
                user = new User(request.session.user.id, { name: request.session.user.username, room: CHANNEL_ID, guildId: context.guild_id })
            }

            let message = new TextMessage(user, `from: ${user.name} - ${data.toString().replace(/^"/, '').replace(/"$/, '')}`, randomUUID())
            await robot.send(message, message.text)
            // await robot.adapter.receive(message)
            // socket.broadcast.emit('chat message', message.text, new Date())
        })
        robot.respond(/site (?<message>.*)/, async (res)=>{
            let { message } = res.match.groups
            // let message = new TextMessage(new User('website', {name: FROM_NAME, room: CHANNEL_ID}), `${data.toString().replace(/^"/, '').replace(/"$/, '')}`, randomUUID())

            socket.emit('message', message, new Date())
        })
    })

    app.use(BodyParser.urlencoded({ extended: true }))
    app.use(BodyParser.json())
    app.use(MethodOverride((req, res, next)=>{
        if(req.body && typeof req.body === 'object' && '_method' in req.body){
            let method = req.body._method
            delete req.body._method
            return method
        }
    }))
    app.set('trust proxy', 1)
    app.use(sessionParser)
    app.use((req, res, next)=>{
        if(!Array.isArray(req.session.flash)) req.session.flash = []
        res.locals.flash = req.session.flash
        req.session.flash = []
        req.flash = res.flash = (type, message)=>{
            req.session.flash.push({type, message})
        }
        next()
    })
    app.use(async (req, res, next) => {
        if (req.url !== '/') return next()
        let user = new User('website', { name: FROM_NAME, room: CHANNEL_ID })
        if (req.session?.user) {
            user = new User(req.session.user.id, { name: req.session.user.username, room: CHANNEL_ID, guildId: context.guild_id })
        }
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

        let data = JSON.stringify(req.headers)
        let message = new TextMessage(user, `
            from: ${user.name}
            ip: ${ip}
            data: ${data}`, randomUUID())

        visitQueue.push(new AddVisitEvent(req.sessionID, randomUUID(), new Date(), new Date(), req.sessionID, { headers: req.headers, url: req.url }, 0))
        // await robot.send(message, message.text)
        next()
    })

    app.get('/access-token', async (req, res, next)=>{
        if(!req.query.code) {
            return res.status(400).send('Bad Request')
        }
        let userFromDiscord = Buffer.from(req.query.state, 'base64').toString('ascii').split(';').reduce((acc, current, i)=>{
            if(i == 0) acc.redirectUrl = current
            if(i == 1) acc.state = current
            if(i == 2) acc.entrySessionId = current
            return acc
        }, {})
        let user = validationDuringOauthSequence.get(userFromDiscord.entrySessionId)
        if(!user || user.state != userFromDiscord.state) return res.status(401).send('Unauthorized')
        validationDuringOauthSequence.delete(user.sessionID)
        let data = {
            client_id: robot.config.DISCORD_CLIENT_ID,
            client_secret: robot.config.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: robot.config.DISCORD_REDIRECT_URL,
            code: req.query.code
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        let response = await fetch(`${robot.config.DISCORD_API_HOST}/oauth2/token`, {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams(data)
        })

        let token = await response.json()
        if(token.error) {
            return next(new Error(token.error))
        }
        let info = await fetch(`${robot.config.DISCORD_API_HOST}/users/@me`, {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
                Accept: 'application/json',
                'User-Agent': `Jbot (https://jbot.joeyguerra.com, 1.0.0)`
            },
            method: 'GET'
        })
        if(info.status == 401) return res.status(401).send('Unauthorized: Access token')
        req.session.access_token = token.access_token
        req.session.user = await info.json()
        res.redirect(userFromDiscord.redirectUrl)
    })
    app.get('/login', async (req, res)=>{
        req.session.cookie.sameSite = 'lax'
        let redirectUrl = req.query.redirectUrl ?? '/'
        let randNumber = Math.random()
        let state = Buffer.from(`${decodeURIComponent(redirectUrl)};${randNumber};${req.sessionID}`).toString('base64')
        let user = {
            state: randNumber,
            redirectUrl,
            entrySessionId: req.sessionID
        }
        validationDuringOauthSequence.set(req.sessionID, user)
        res.render('login', {
            discordUrl: `${robot.config.DISCORD_API_HOST}/oauth2/authorize?client_id=${robot.config.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(robot.config.DISCORD_REDIRECT_URL)}&response_type=code&scope=identify&state=${state}`
        })
    })
    app.get('/logout', (req, res, next)=>{
        req.session.user = null
        req.session.access_token = null
        req.session.save(err => {
            if(err) next(err)
            req.session.regenerate(err => {
                if(err) next(err)
                res.redirect('/')
            })
        })
    })

    robot.respond(/visits/, async (res)=>{
        let input = fs.createReadStream(`${VISITS_DIR}/visits.ndjson`, 'utf-8')
        let rl = readline.createInterface({input, crlfDelay: Infinity})
        let view = {}
        let builder = new VisitViewBuilder(view)
        rl.on('line', line => {
            builder.apply(view, line)
        })
        rl.on('close', ()=>{
            res.reply(JSON.stringify(builder.view, null, 2))
        })
        rl.on('error', err => {
            robot.logger.error(err)
            res.reply(err)
        })

    })
}