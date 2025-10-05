
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class iPhonePage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'iPhone CSS Layout'
        this.layout = './pages/layouts/index.html'
        this.canonical = 'https://joeyguerra.com/iphone.html'
        this.excerpt = 'iPhone CSS Layout.'
        this.published = new Date('2024-08-15')
        this.uri = '/iphone.html'
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
    }
}
    
export default async (pagesFolder, filePath, template, delegate) => {
    return new iPhonePage(pagesFolder, filePath, template, delegate)
}
