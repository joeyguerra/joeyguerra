
import { Page } from 'juphjacs/src/Page.mjs'

class RemindersPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Reminders'
        this.canonical = 'https://www.joeyguerra.com/reminders.html'
        this.excerpt = 'Reminders is a simple app that helps you remember to do things.'
        this.shouldPublish = true
        this.published = new Date('2025-04-07')
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new RemindersPage(rootFolder, filePath, template)
}
