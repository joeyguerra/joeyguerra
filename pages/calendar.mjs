
import { Page } from 'juphjacs/src/Page.mjs'

class CalendarPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/app.html'
        this.title = 'A large calendar, all 365 day'
        this.canonical = 'https://www.joeyguerra.com/calendar.html'
        this.uri = '/calendar.html'
        this.excerpt = 'This is a 38x46 inch calendar that shows all 365 days.'
        this.shouldPublish = true
        this.published = new Date('2024-01-01')
        this.image = ''
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''

    }
}

export default async (rootFolder, filePath, template) => {
    return new CalendarPage(rootFolder, filePath, template)
}
