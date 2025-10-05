
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class CanIUseHtmlPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Can I use HTML?'
        this.layout = './pages/layouts/post.html'
        this.canonical = 'https://joeyguerra.com/blog/2020/can-i-use-html.html'
        this.excerpt = 'I was just wonderin if this thing works with HTML'
        this.shouldPublish = true
        this.uri = '/blog/2020/can-i-use-html.html'
        this.published = new Date('2020-01-01T11:23:00.000Z')
        this.tags = ['html']
        this.image = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CanIUseHtmlPage(rootFolder, filePath, template)
}
