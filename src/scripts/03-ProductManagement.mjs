// Description:
//   Product management
//
// Commands:
//   hubot product|p add <sku> <name> <description> - Add a product
//   hubot product|p delete <id> - Delete a product (it just markse it as deleted)
//   hubot product|p - List all products
//
// Notes:
//   Product management script.
//

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'

const DIRNAME = path.dirname(fileURLToPath(import.meta.url))
const FOLDER_PATH = path.resolve(DIRNAME, '../../.data/products')
const INDEX_FILE_PATH = path.join(FOLDER_PATH, 'index.txt')

class Command {
    constructor (id) {
        this.id = id
    }
    handle() {
        throw new Error('Not implemented')
    }
}

class AddItemCommand extends Command {
    constructor(name, sku, description) {
        super(uuid())
        this.name = name
        this.sku = sku
        this.description = description
    }
    handle() {
        return [new ItemAddedEvent(this.name, this.sku, this.description)]
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
    constructor(id) {
        this.id = id
        this.timestamp = new Date()
        this.kind = this.constructor.name
    }
}

class ItemAddedEvent extends Event{
    constructor(name, sku, description) {
        super(uuid())
        this.name = name
        this.sku = sku
        this.description = description
    }
}

class ItemDeletedEvent extends Event {
    constructor(id) {
        super(id)
    }
}

class Item {
    constructor(id, name, sku, description) {
        this.id = id
        this.name = name
        this.sku = sku
        this.description = description
    }
}

class EventStore {
    constructor(folder, index) {
        this.folder = folder
        this.index = index
    }

    async save(event) {
        if (!this.index.has(event.id)) {
            this.index.add(event.id)
            await fs.promises.appendFile(path.join(this.folder, 'index.txt'), `${event.id}\n`)
        }
        return await fs.promises.appendFile(path.join(this.folder, `${event.id}.ndjson`), `${JSON.stringify(event)}\n`)
    }

    async *getEvents() {
        let files = await fs.promises.readdir(this.folder)
        for await (let file of files) {
            if (!file.endsWith('.ndjson')) continue
            let events = (await fs.promises.readFile(path.join(this.folder, file))).toString().split('\n').filter(Boolean)
            if (events.length === 0) continue
            for await (let e of events) {
                let event = JSON.parse(e)
                switch (event.kind) {
                    case 'ItemAddedEvent':
                        yield new ItemAddedEvent(event.name, event.sku, event.description)
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

class ProductService {
    constructor(eventStore, view) {
        this.eventStore = eventStore
        this.view = view
    }
    async handle(command) {
        const events = command.handle()
        for await (const event of events) {
            await this.eventStore.save(event)
        }
    }
    async add(name, sku, description) {
        const event = new ItemAddedEvent(name, sku, description)
        await this.eventStore.save(event)
    }
    async delete(id) {
        const event = new ItemDeletedEvent(id)
        await this.eventStore.save(event)
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
        let item = items.get(event.id)
        switch(event.kind) {
            case 'ItemAddedEvent':
                items.set(event.id, new Item(event.id, event.name, event.sku, event.description))
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

class ProductView {
    constructor(eventStore) {
        this.eventStore = eventStore
    }
    async get() {
        let view = new Map()
        for await (const event of this.eventStore.getEvents()) {
            if (!view.has(event.id)) {
                view.set(event.id, new Item(event.id, '', '', ''))
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
        item.sku = event.sku
        item.description = event.description
        return view
    }
    ItemDeletedEvent(view, event) {
        let item = view.get(event.id)
        delete view[event.id]
        return view
    }
}

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

export default async robot => {
    let eventStore = new EventStore(FOLDER_PATH, index)
    let service = new ProductService(eventStore)
    let view = new ProductView(eventStore)

    robot.productView = await view.get()
    robot.router.post('/products', async (req, res) => {
        let { name, sku, description } = req.body
        let command = new AddItemCommand(name, sku, description)
        service.add(command.name, command.sku, command.description)
        res.status(201).send('Item added')
    })
    robot.router.get('/products', async (req, res) => {
        res.status(200).json(await view.get())
    })

    robot.respond(/(product|p) add name: ?(?<name>.+) sku: ?(?<sku>.+) description: ?(?<description>.+)$/is, async res => {
        let { name, sku, description } = res.match.groups
        let command = new AddItemCommand(name, sku, description)
        service.handle(command)
        await res.send('Item added')
    })
    robot.respond(/(product|p) delete (?<id>.*)$/is, async res => {
        let id = res.match.groups.id
        let command = new DeleteItemCommand(id)
        service.handle(command)
        await res.send('Item deleted')
    })
    robot.respond(/(product|p)$/is, async res => {
        let products = await view.get()
        let output = `# Products
${products.map(i => `- ${i.id} ${i.name} (${i.sku}) - ${i.description}`).join('\n') }
`
        await res.send(output)
    })
}