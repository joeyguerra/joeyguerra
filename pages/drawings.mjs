
import { Page } from 'juphjacs/src/Page.mjs'

class DrawingsPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Drawings"
        this.canonical = 'https://joeyguerra.com/drawings.html'
        this.excerpt = 'Just my website.'
        this.shouldPublish = true
        this.published = new Date('2025-03-03 11:50 AM CST')
        this.uri = '/drawings.html'
        this.image = ''
        this.tags = []
    }
}

export default async (rootFolder, filePath, template) => {
    return new DrawingsPage(rootFolder, filePath, template)
}
