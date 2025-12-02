
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class AboutPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'About Joey – Kaizen Ops'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/about/'
        this.excerpt = 'Who I am, how I work, and what this weblog is for.'
        this.published = new Date('2025-12-01T00:00:00Z')
        this.uri = '/about/index.html'
        this.tags = ['about', 'systems design', 'interfaces', 'idempotency', 'observability']
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new AboutPage(pagesFolder, filePath, template, delegate)
}
