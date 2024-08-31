// Description:
//   Inventory management
//
// Commands:
//   hubot iventory|i add <productId> <quantity> - Add an item to the inventory
//   hubot iventory|i delete <id> - Delete an item from the inventory
//   hubot iventory|i adjust <id> <quantity> - Adjust the quantity of an item in the inventory
//   hubot iventory|i - List all items in the inventory
//
// Notes:
//   Inventory management script.
//


// Intoduce Warehouse concept.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'

const DIRNAME = path.dirname(fileURLToPath(import.meta.url))
const FOLDER_PATH = path.resolve(DIRNAME, '../../.data/inventory')
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
    constructor(id, quantity) {
        super(id)
        this.quantity = quantity
    }
    handle() {
        return [new ItemAddedEvent(this.id, this.quantity)]
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

class AdjustItemQuantityCommand extends Command {
    constructor(id, quantity) {
        super(id)
        this.quantity = quantity
    }
    handle() {
        return [new ItemQuantityAdjustedEvent(this.id, this.quantity)]
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
    constructor(id, quantity) {
        super(id)
        this.quantity = quantity
    }
}

class ItemDeletedEvent extends Event {
    constructor(id) {
        super(id)
    }
}

class ItemQuantityAdjustedEvent extends Event {
    constructor(id, quantity) {
        super(id)
        this.quantity = quantity
    }
}

class Item {
    constructor(id, quantity, product) {
        this.id = id
        this.quantity = quantity
        this.product = product
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
                        yield new ItemAddedEvent(event.id, event.quantity)
                        break
                    case 'ItemQuantityAdjustedEvent':
                        yield new ItemQuantityAdjustedEvent(event.id, event.quantity)
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

class InventoryService {
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
    async add(id, name, quantity) {
        const event = new ItemAddedEvent(id, quantity)
        await this.eventStore.save(event)
    }
    async delete(id) {
        const event = new ItemDeletedEvent(id)
        await this.eventStore.save(event)
    }

    async adjust(id, quantity) {
        const event = new ItemQuantityAdjustedEvent(id, quantity)
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
                items.set(event.id, new Item(event.id, event.quantity, this.view.productsView.get(event.id)))
                break
            case 'ItemDeletedEvent':
                items.delete(event.id)
                break
            case 'ItemQuantityAdjustedEvent':
                item.quantity += event.quantity
                break
            default:
                break
        }
        return items
    }
}

class Product {
    constructor(id, name, sku, description) {
        this.id = id
        this.name = name
        this.sku = sku
        this.description = description
    }
}

class ProductsView {
    constructor() {
        this.products = new Map()
    }
    add(id, name, sku, description) {
        this.products.set(id, new Product(id, name, sku, description))
    }
    get(id) {
        return this.products.get(id)
    }
}
class InventoryView {
    constructor(eventStore, productView) {
        this.eventStore = eventStore
        this.productView = productView
    }
    async get() {
        let view = new Map()
        for await (const event of this.eventStore.getEvents()) {
            if (!view.has(event.id)) {
                view.set(event.id, new Item(event.id, '', null))
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
        item.quantity = event.quantity
        item.product = this.productView.find(p => p.id === event.id)
        return view
    }
    ItemQuantityAdjustedEvent(view, event) {
        let item = view.get(event.id)
        item.quantity += event.quantity
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
    let service = new InventoryService(eventStore)
    let view = new InventoryView(eventStore, robot.productView)
    
    robot.router.post('/inventory', async (req, res) => {
        let { id, quantity } = req.body
        let command = new AddItemCommand(id, quantity)
        service.add(command.id, command.quantity)
        res.status(201).send('Item added')
    })
    robot.router.post('/inventory/quantity', async (req, res) => {
        let { id, quantity } = req.body
        let command = new AdjustItemQuantityCommand(id, quantity)
        service.adjust(command.id, command.quantity)
        res.status(200).send('Item quantity updated')
    })
    robot.router.get('/inventory', async (req, res) => {
        res.status(200).json(await view.get())
    })

    robot.respond(/(inventory|i) add (?<id>.+) (?<quantity>\d+)$/is, async res => {
        let id = res.match.groups.id
        let quantity = parseInt(res.match.groups.quantity, 10)
        let command = new AddItemCommand(id, quantity)
        service.handle(command)
        await res.send('Item added')
    })
    robot.respond(/(inventory|i) delete (?<id>.*)$/is, async res => {
        let id = res.match.groups.id
        let command = new DeleteItemCommand(id)
        service.handle(command)
        await res.send('Item deleted')
    })
    robot.respond(/(inventory|i) adjust (?<id>.*) (?<quantity>\-?\d+)$/is, async res => {
        let id = res.match.groups.id
        let quantity = parseInt(res.match.groups.quantity, 10)
        let command = new AdjustItemQuantityCommand(id, quantity)
        service.handle(command)
        await res.send('Item quantity updated')
    })
    robot.respond(/(inventory|i)$/is, async res => {
        let inventory = await view.get()
        let output = `# Inventory
${inventory.map(i => `- ${i.name} (${i.id}) - ${i.quantity}`).join('\n') }
`
        await res.send(output)
    })
}