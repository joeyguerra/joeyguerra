
import { Page } from 'juphjacs/src/Page.mjs'

class PushupsPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Daily Pushups'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/pushups.html'
        this.excerpt = 'An app to record your daily pushups.'
        this.shouldPublish = false
        this.published = new Date('2024-02-03')
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new PushupsPage(rootFolder, filePath, template)
}
