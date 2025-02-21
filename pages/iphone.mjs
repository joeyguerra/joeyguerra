
import { Page } from 'juphjacs/src/Page.mjs'

class iPhonePage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'iPhone CSS Layout'
        this.layout = './pages/layouts/index.html'
        this.canonical = 'https://www.joeyguerra.com/iphone.html'
        this.excerpt = 'iPhone CSS Layout.'
        this.shouldPublish = true
        this.published = new Date('2024-08-15')
        this.uri = '/iphone.html'
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
    }
}

export default async (rootFolder, filePath, template) => {
    return new iPhonePage(rootFolder, filePath, template)
}
