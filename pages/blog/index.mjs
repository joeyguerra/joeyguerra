
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class BlogIndexPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = "Blog"
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/blog/'
        this.excerpt = 'My Blog.'
        this.published = new Date('1998-10-01')
        this.uri = '/blog/'
        this.tags = ['system', 'field ops', 'idempotent flows', 'feedback loops', 'interfaces', 'hubot data plane', 'juphjacs', 'mission', 'kaizen ops']
        this.posts = new Set()
    }
    async get (req, res) {
        const blogPlugin = this.context.getPluginByName('BlogPlugin')
        if (blogPlugin) {
            this.posts = blogPlugin.posts
        }
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        res.end(this.content)
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new BlogIndexPage(pagesFolder, filePath, template, delegate)
}
