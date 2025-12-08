
import { Page } from 'juphjacs'

class SearchPage extends Page {
    constructor (rootFolder, filePath, template, context) {
        super(rootFolder, filePath, template, context)
        this.title = 'Search'
        this.excerpt = 'Search.'
        this.canonical = 'https://joeyguerra.com/search.html'
        this.image = ''
        this.published = new Date('2025-12-01')
        this.uri = '/search.html'
        this.tags = ['search']
        this.urls = []
        this.results = []
    }

    async get (req, res) {
        const url = new URL(req.url, 'http://localhost')
        const q = url.searchParams.get('q') || ''
        const blogPlugin = this.context.getPluginByName('BlogPlugin')
        if (blogPlugin) {
            this.posts = blogPlugin.posts
        }
        this.results = Array.from(this.posts).filter(post => {
            const title = post.title.toLowerCase()
            const desc = post.excerpt.toLowerCase()
            const query = q.trim().toLowerCase()
            return title.includes(query) || desc.includes(query)
        }).slice(0, 10)
        this.results.sort((a, b) => {
            return b.title.length - a.title.length
        })
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        res.end(this.content)
    }
}

export default async (rootFolder, filePath, template, context) => {
    return new SearchPage(rootFolder, filePath, template, context)
}
