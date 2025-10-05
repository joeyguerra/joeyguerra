
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class LinksPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Links to Topics of Interest'
        this.uri = '/links.html'
        this.layout = './pages/layouts/index.html'
        this.canonical = 'https://joeyguerra.com/links.html'
        this.excerpt = 'Links to Topics of Interest.'
        this.published = new Date('2022-09-01')
        this.image = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new LinksPage(pagesFolder, filePath, template, delegate)
}
