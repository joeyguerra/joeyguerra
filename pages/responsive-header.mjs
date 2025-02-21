
import { Page } from 'juphjacs/src/Page.mjs'

class ResponsiveHeaderPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/post.html'
        this.title = 'Responsive Header'
        this.excerpt = 'This is a responsive header with a mobile navigation.'
        this.canonical = 'https://www.joeyguerra.com/responsive-header.html'
        this.shouldPublish = true
        this.image = ''
        this.published = new Date('2024-09-01')
        this.uri = '/responsive-header.html'
        this.tags = ['html', 'css', 'responsive']
    }
}

export default async (rootFolder, filePath, template) => {
    return new ResponsiveHeaderPage(rootFolder, filePath, template)
}
