
import { Page } from 'juphjacs/src/Page.mjs'

class TeleprompterPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Teleprompter'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/teleprompter.html'
        this.excerpt = 'Web teleprompter.'
        this.shouldPublish = false
        this.uri = '/teleprompter.html'
        this.image = null
        this.touchIcon180 = null
        this.touchIcon32 = null
        this.touchIcon16 = null
        this.touchStartupImage = null
        this.published = new Date('2024-11-08')
    }
}

export default async (rootFolder, filePath, template) => {
    return new TeleprompterPage(rootFolder, filePath, template)
}
