// Description:
//   Bookmanagement script.
//
// Commands:
//  hubot bookmarks|bm add [<name>](<link>) - Add a bookmark
//  hubot bookmarks|bm delete <id> - Delete a bookmark
//  hubot bookmarks|bm - List all bookmarks
//  hubot bookmarks|bm q <query> - Search bookmarks
//
// Notes:
//   A bookmark management script.
//

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
class Command {
    constructor (id) {
        this.id = id
    }
    handle() {
        throw new Error('Not implemented')
    }
}
class AddItemCommand extends Command {
    constructor(id, name, link, tags) {
        super(id)
        this.name = name
        this.link = link
        this.tags = tags
    }
    handle() {
        return [new ItemAddedEvent(this.id, this.name, this.link, this.tags)]
    }
}
class DeleteItemCommand extends Command {
    constructor(id) {
        super(id)
    }
    handle() {
        return [new ItemDeletedEvent(this.id)]
    }

}

class Event {
    constructor() {
        this.timestamp = new Date()
        this.kind = this.constructor.name
    }

}
class ItemAddedEvent extends Event{
    constructor(id, name, link, tags) {
        super()
        this.id = id
        this.name = name
        this.link = link
        this.tags = tags
    }
}
class ItemDeletedEvent extends Event {
    constructor(id) {
        super()
        this.id = id
    }
}

class Item {
    constructor(id, name, link, tags) {
        this.id = id
        this.name = name
        this.link = link
        this.tags = tags
    }
}

class EventStore {
    constructor(folder, index) {
        this.folder = folder
        this.index = index
    }

    async saveEvent(event) {
        if (!this.index.has(event.id)) {
            this.index.add(event.id)
            await fs.promises.appendFile(path.join(this.folder, 'index.txt'), `${event.id}\n`)
        }
       return await fs.promises.appendFile(path.join(this.folder, `${event.id}.ndjson`), `${JSON.stringify(event)}\n`)
    }

    async *getEvents () {
        let files = await fs.promises.readdir(this.folder)
        for await (let file of files) {
            if (!file.endsWith('.ndjson')) {
                continue
            }
            let events = (await fs.promises.readFile(path.join(this.folder, file))).toString().split('\n').filter(Boolean)
            if (events.length === 0) {
                continue
            }
            for await (let e of events) {
                let event = JSON.parse(e)
                switch(event.kind) {
                    case 'ItemAddedEvent':
                        yield new ItemAddedEvent(event.id, event.name, event.link, event.tags)
                        break
                    case 'ItemDeletedEvent':
                        yield new ItemDeletedEvent(event.id)
                        break
                    default:
                        break
                }
            }
        }
    }
}

class BookmarkService {
    constructor(eventStore, view) {
        this.eventStore = eventStore
        this.view = view
    }
    async handle(command) {
        const events = command.handle()
        for await (const event of events) {
            await this.eventStore.saveEvent(event)
        }
    }
    async addItem(id, name, link, tags) {
        const event = new ItemAddedEvent(id, name, link, tags)
        await this.eventStore.saveEvent(event)
    }
    async deleteItem(id) {
        const event = new ItemDeletedEvent(id)
        await this.eventStore.saveEvent(event)
    }

    async getCurrentState() {
        const items = new Map()
        for await (const event of this.eventStore.getEvents()) {
            this.applyEvent(items, event)
        }
        this.view = Array.from(items.values())
        return this.view
    }
    
    applyEvent(items, event) {
        switch(event.kind) {
            case 'ItemAddedEvent':
                items.set(event.id, new Item(event.id, event.name, event.link, event.tags))
                break
            case 'ItemDeletedEvent':
                items.delete(event.id)
                break
            default:
                break
        }
        return items
    }
}

class BookmarkView {
    constructor(eventStore) {
        this.eventStore = eventStore
    }
    async get () {
        let view = new Map()
        for await (const event of this.eventStore.getEvents()) {
            if (!view.has(event.id)) {
                view.set(event.id, new Item(event.id, '', '', []))
            }
            try {
                view = this[event.kind](view, event)
            } catch (e) {
                console.log(e, event.kind)
            }
        }
        return Array.from(view.values())
    }
    ItemAddedEvent(view, event) {
        let item = view.get(event.id)
        item.name = event.name
        item.link = event.link
        item.tags = event.tags
        return view
    }
    ItemDeletedEvent(view, event) {
        let item = view.get(event.id)
        delete view[event.id]
        return view
    }
}

const FOLDER_PATH = path.resolve(__dirname, '../../.data/bookmarks')
const INDEX_FILE_PATH = path.join(FOLDER_PATH, 'index.txt')

try {
    await fs.promises.stat(FOLDER_PATH)
} catch (e) {
    await fs.promises.mkdir(FOLDER_PATH, { recursive: true })
}
try {
    await fs.promises.stat(INDEX_FILE_PATH)
} catch (e) {
    await fs.promises.writeFile(INDEX_FILE_PATH, '')
}

let indexStream = fs.createReadStream(INDEX_FILE_PATH)
let leftover = ''
let index = new Set()

await (new Promise((resolve, reject) => {
    indexStream.on('data', async chunk => {
        let lines = (leftover + chunk).split(/\r?\n/)
        leftover = lines.pop()
        for (let line of lines) {
            index.add(line)
        }
    })
    indexStream.on('end', () => {
        if (leftover) {
            index.add(leftover)
        }
        resolve(index)
    })
    indexStream.on('error', reject)
}))

let eventStore = new EventStore(FOLDER_PATH, index)
let service = new BookmarkService(eventStore)
let view = new BookmarkView(eventStore)

export default async robot => {
    robot.router.post('/bookmarks', async (req, res) => {
        let { id, name, link, tags } = req.body
        let command = new AddItemCommand(id, name, link, tags)
        service.addItem(command.id, command.name, command.link, command.tags)
        res.status(201).send('Item added')
    })
    robot.router.get('/bookmarks', async (req, res) => {
        res.status(200).json(await view.get())
    })

    robot.respond(/(bookmarks|bm) add[\n\s]?(?<body>.*)/is, async res => {
        const matches = [...res.match.groups.body.matchAll(/\[(?<name>.+?)\]\((?<link>.+?)\)\s?(?<tags>\#.*)?/g)]
        console.log(matches)
        for (const match of matches) {
            let id = uuid()
            let {name, link, tags} = match.groups
            tags = tags.split(' ').map(t => t.replace('#', ''))
            let command = new AddItemCommand(id, name, link, tags)
            service.handle(command)
        }
        await res.send('Item(s) added')
    })
    robot.respond(/(bookmarks|bm) delete (?<id>.*)$/is, async res => {
        let { id } = res.match.groups
        if (!index.has(id)) {
            await res.reply('Item not found')
            return
        }
        let command = new DeleteItemCommand(id)
        service.handle(command)
        await res.send('Item deleted')
    })
    robot.respond(/(bookmarks|bm) q (?<query>.*)$/is, async res => {
        let bookmarks = await view.get()
        let { query } = res.match.groups
        let output = `# Bookmarks
${bookmarks.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.tags?.includes(query.toLowerCase())).map(b => `* ${b.name} - \`${b.link}\` (id: \`${b.id}\`)`).join('\n')}
`
        await res.send(output)
    })
    robot.respond(/(bookmarks|bm)$/is, async res => {
        let bookmarks = await view.get()
        let output = `# Bookmarks
${bookmarks.map(b => `* ${b.name} - \`${b.link}\` (id: \`${b.id}\`) ${b.tags?.map(t => '#' + t).join(' ') ?? ''}`).join('\n')}
`
        await res.send(output)
    })
}