
import { Page } from 'juphjacs/src/Page.mjs'

class SitemapPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Site Map'
        this.excerpt = 'Site Map.'
        this.canonical = 'https://www.joeyguerra.com/sitemap.xml'
        this.shouldPublish = true
        this.image = ''
        this.published = new Date('2025-02-19')
        this.uri = '/sitemap.xml'
        this.tags = ['sitemap']
        this.urls = []
    }
}

export default async (rootFolder, filePath, template) => {
    return new SitemapPage(rootFolder, filePath, template)
}
