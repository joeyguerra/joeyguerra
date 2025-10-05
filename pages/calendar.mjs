
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class CalendarPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template)
        this.layout = './pages/layouts/app.html'
        this.title = 'A large calendar, all 365 day'
        this.canonical = 'https://joeyguerra.com/calendar.html'
        this.uri = '/calendar.html'
        this.excerpt = 'This is a 38x46 inch calendar that shows all 365 days.'
        this.published = new Date('2024-01-01')
        this.image = ''
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''

    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new CalendarPage(pagesFolder, filePath, template, delegate)
}
