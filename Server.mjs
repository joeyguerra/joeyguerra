import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import EventEmitter from 'node:events'
import { main, logger, FetchRequest, FetchResponse } from 'juphjacs'
import notfoundurls from './notfoundurls.mjs'

const database = new DatabaseSync('bitcoin.db', { allowExtension: true })
const { sqliteVersion } = database.prepare('select sqlite_version() as sqliteVersion;').get()
console.log(`SQLite version ${sqliteVersion}`)

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
        this.interval = setInterval(this.fetchPriceData.bind(this), this.randomInterval * 1000)
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

const server = createServer({
    IncomingMessage: FetchRequest,
    ServerResponse: FetchResponse
})

await main(server, { tracker })

server.listen(process.env.PORT ?? 3000, () => {
    logger.info(`Server running at http://localhost:${server.address().port}/`)
})
