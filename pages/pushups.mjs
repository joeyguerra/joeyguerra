
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class PushupsPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Pushups'
        this.uri = '/pushups.html'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/pushups.html'
        this.excerpt = 'An app to record your daily pushups.'
        this.published = new Date('2024-02-03')
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new PushupsPage(pagesFolder, filePath, template, delegate)
}
