
import { Page } from 'juphjacs/src/Page.mjs'

class AboutMePage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Joey Guerra's Personal Web Site"
        this.layout = './pages/layouts/index.html'
        this.canonical = 'https://www.joeyguerra.com/'
        this.excerpt = 'Just my website.'
        this.shouldPublish = true
        this.published = new Date('2024-11-24')
        this.uri = '/'
        this.image = ''
        this.tags = []
    }
}

export default async (rootFolder, filePath, template) => {
    return new AboutMePage(rootFolder, filePath, template)
}
