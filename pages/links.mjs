
import { Page } from 'juphjacs/src/Page.mjs'

class LinksPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Links to Topics of Interest'
        this.layout = './pages/layouts/index.html'
        this.canonical = 'https://joeyguerra.com/links.html'
        this.excerpt = 'Links to Topics of Interest.'
        this.shouldPublish = true
        this.published = new Date('2022-09-01')
    }
}

export default async (rootFolder, filePath, template) => {
    return new LinksPage(rootFolder, filePath, template)
}
