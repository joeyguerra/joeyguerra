
import { Page } from 'juphjacs/src/Page.mjs'

class BlogIndexPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Blog"
        this.route = new RegExp('^/blog/?$')
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://www.joeyguerra.com/blog/'
        this.excerpt = 'My Blog.'
        this.shouldPublish = true
        this.published = new Date('2024-09-01')
        this.uri = '/blog/'
        this.tags = ['blog']
        this.postsSet = []
    }
}

export default async (rootFolder, filePath, template) => {
    return new BlogIndexPage(rootFolder, filePath, template)
}
