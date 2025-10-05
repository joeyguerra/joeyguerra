
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class ResponsiveHeaderPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.layout = './pages/layouts/post.html'
        this.title = 'Responsive Header'
        this.excerpt = 'This is a responsive header with a mobile navigation.'
        this.canonical = 'https://joeyguerra.com/responsive-header.html'
        this.image = ''
        this.published = new Date('2024-09-01')
        this.uri = '/responsive-header.html'
        this.tags = ['html', 'css', 'responsive']
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new ResponsiveHeaderPage(pagesFolder, filePath, template, delegate)
}
