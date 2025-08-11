
import { Page } from 'juphjacs/src/Page.mjs'

class ItemPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Item Component'
        this.layout = './pages/layouts/component.html'
        this.canonical = 'https://www.joeyguerra.com/components/item.html'
        this.excerpt = 'The Item Component is just an item in a list.'
        this.shouldPublish = true
        this.published = new Date('2025-05-03T15:55:00Z')
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new ItemPage(rootFolder, filePath, template)
}
