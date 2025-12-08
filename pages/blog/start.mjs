
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class StartPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Start Here – Kaizen Ops Weblog'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/blog/start.html'
        this.excerpt = 'Start Here to orient yourself with the Kaizen Ops Weblog.'
        this.published = new Date('2025-11-20 T03:24:00Z')
        this.uri = '/blog/start.html'
        this.tags = ['system', 'field ops', 'idempotent flows', 'feedback loops', 'interfaces', 'hubot data plane', 'juphjacs', 'mission', 'kaizen ops']
        this.posts = new Set()
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new StartPage(pagesFolder, filePath, template, delegate)
}
