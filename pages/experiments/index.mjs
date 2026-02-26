
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class ExperiementsIndexPage extends Page {
    constructor (pagesFolder, filePath, template, context) {
        super(pagesFolder, filePath, template, context)
        this.title = 'Experiments'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/experiments/index.html'
        this.excerpt = 'Just experimenting.'
        this.published = new Date('2026-02-25T23:04:00Z')
        this.uri = '/experiments/index.html'
        this.tags = ['experiements', 'ux', 'software']
    }
}

export default async (pagesFolder, filePath, template, context) => {
    return new ExperiementsIndexPage(pagesFolder, filePath, template, context)
}
