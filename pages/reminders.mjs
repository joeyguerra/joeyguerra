
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class RemindersPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Reminders'
        this.uri = '/reminders.html'
        this.canonical = 'https://joeyguerra.com/reminders.html'
        this.excerpt = 'Reminders is a simple app that helps you remember to do things.'
        this.published = new Date('2025-04-07')
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new RemindersPage(pagesFolder, filePath, template, delegate)
}
