import { Page } from 'juphjacs/src/Page.mjs'

class BitcoinTrackerPage extends Page {
    constructor(rootFolder, filePath, template, delegate) {
        super(rootFolder, filePath, template, delegate)
        this.layout = './pages/layouts/app.html'
        this.title = 'Bitcoin Tracker'
        this.canonical = 'https://joeyguerra.com/bitcoin.html'
        this.uri = '/bitcoin.html'
        this.excerpt = 'Tracks Bitcoin price.'
        this.shouldPublish = true
        this.published = new Date('2025-02-23')
        this.image = ''
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
        this.spotPrices = []
        this.delegate.tracker.on('update', this.update.bind(this))
    }

    async update() {
        this.spotPrices = this.delegate.tracker.get()
        await this.render()
        await this.delegate.broadcast(this.content, this.filePath)
    }

    async disconnect(id) {
        clearInterval(this.interval)
        this.spotPrices = []
    }

    async get(req, res) {
        this.spotPrices = this.delegate.tracker.get()
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        res.end(this.content)
    }

    formatMoneyWithCommas(amount) {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp)
        const dateString = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Chicago',
        })
        const timeString = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/Chicago',
        })
        return `${dateString} ${timeString}`
    }
}


export default async (rootFolder, filePath, template, delegate) => {
    return new BitcoinTrackerPage(rootFolder, filePath, template, delegate)
}