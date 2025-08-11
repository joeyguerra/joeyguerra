import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import EventEmitter from 'node:events'
import { writeFile } from 'node:fs/promises'
import { main, logger, FetchRequest, FetchResponse } from 'juphjacs'
import notfoundurls from './notfoundurls.mjs'
import { parseStringPromise } from 'xml2js'

const database = new DatabaseSync('bitcoin.db', { allowExtension: true })
const { sqliteVersion } = database.prepare('select sqlite_version() as sqliteVersion;').get()
console.log(`SQLite version ${sqliteVersion}`)
class FeedSubscriber {
    #interval = null
    #feedUrls = []
    constructor() {
        this.#feedUrls = ['https://404.feed.press/private?key=7ca1cc7f1f73d02381c2593638515df2']
    }
    async fetch(url) {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.text()
            return data
        } catch (error) {
            logger.warn(`Error fetching feed: ${error.message}`)
            return null
        }
    }
    async fetchAll() {
        const feedPromises = this.#feedUrls.map(url => this.fetch(url))
        const feeds = await Promise.all(feedPromises)
        return feeds.filter(feed => feed !== null)
    }
    async saveToFile(feed) {
        const fileName = '_site/404media.html'
        try {
            // Parse XML to JS object
            const parsed = await parseStringPromise(feed)
            const channel = parsed.rss?.channel?.[0] ?? {}
            const items = channel.item || []
            // Build HTML
            let html = `<html><head><meta charset='utf-8'><title>${channel.title?.[0] ?? 'Feed'}</title><link rel="stylesheet" href="css/404media.css"></head><body>`
            html += `<h1>${channel.title?.[0] ?? ''}</h1>`
            html += `<p>${channel.description?.[0] ?? ''}</p>`
            html += '<ul>'
            for (const item of items) {
                html += '<li style="margin-bottom:2em">'
                html += `<h2><a href='${item.link?.[0] ?? '#'}' target='_blank'>${item.title?.[0] ?? ''}</a></h2>`
                if (item['media:content'] && item['media:content'][0]?.$?.url) {
                    html += `<img src='${item['media:content'][0].$.url}' alt='' style='max-width:300px;display:block;margin-bottom:1em'>`
                }
                html += `<div>${item.description?.[0] ?? ''}</div>`
                if (item['content:encoded'] && item['content:encoded'][0]) {
                    html += `<details><summary>Full Article</summary><div style='margin-top:1em'>${item['content:encoded'][0]}</div></details>`
                }
                if (item.pubDate) {
                    html += `<div style='color:#888;font-size:0.9em'>${item.pubDate[0]}</div>`
                }
                html += '</li>'
            }
            html += '</ul>'
            html += '</body></html>'
            await writeFile(fileName, html, 'utf-8')
            logger.info(`Feed saved to ${fileName}`)
        } catch (error) {
            logger.warn(`Error saving feed: ${error.message}`)
        }
    }
    start() {
        this.#interval = setInterval(() => {
            this.fetchAll().then(feeds => {
                feeds.forEach(feed => {
                    this.saveToFile(feed)
                })
            }).catch(error => {
                logger.warn(`Error fetching feeds: ${error.message}`)
            })
        }, 1000*60*60*24)
    }
}
class BitcoinTracker extends EventEmitter {
    constructor(database){
        super()
        this.database = database
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                base TEXT,
                amount REAL,
                currency TEXT DEFAULT 'USD',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)
        this.randomInterval = Math.floor(Math.random() * 30) + 1
        this.interval = null// setInterval(this.fetchPriceData.bind(this), this.randomInterval * 1000)
        this.spotPrices = []
    }
    
    get(limit = 50) {
        return this.database.prepare(`SELECT * FROM prices ORDER BY timestamp DESC LIMIT ?`).all(limit)
    }
    update() {
        this.emit('update', this.spotPrices)
    }
    async fetchPriceData() {
        try {
            const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
            const doc = await response.json()
            const spot = { timestamp: new Date(), ...doc.data }
            this.spotPrices.unshift(spot)
            this.spotPrices = this.spotPrices.slice(0, 300)
            this.save(spot)
            this.update()    
        } catch (e) {
            logger.warn(e.cause)
            logger.warn(e.message)
        }
    }
    save(spotPrice) {
        const existing = this.database.prepare(`SELECT * FROM prices WHERE timestamp = ?`).get(spotPrice.timestamp)
        if (!existing) {
            this.database.prepare(`INSERT INTO prices (amount, base, currency) VALUES (?, ?, ?)`).run(spotPrice.amount, spotPrice.base, spotPrice.currency)
        }
    }
    calculateEMA(data, period) {
        const k = 2 / (period + 1)
        return data.reduce((acc, price, index) => {
            acc.push(index === 0 ? price : price * k + acc[index - 1] * (1 - k))
            return acc
        }, [])
    }
}

const tracker = new BitcoinTracker(database)
const subscriber = new FeedSubscriber()
subscriber.start()
subscriber.fetchAll().then(feeds => {
    feeds.forEach(feed => {
        subscriber.saveToFile(feed)
    })
}).catch(error => {
    logger.warn(`Error fetching feeds: ${error.message}`)
})


const server = createServer({
    IncomingMessage: FetchRequest,
    ServerResponse: FetchResponse
})

await main(server, { tracker })

server.listen(process.env.PORT ?? 3000, () => {
    logger.info(`Server running at http://localhost:${server.address().port}/`)
})
