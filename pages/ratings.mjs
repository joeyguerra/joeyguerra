
import { Page } from 'juphjacs/src/Page.mjs'

class RatingsPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Ratings'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/ratings.html'
        this.excerpt = 'Ratings example with MVC.'
        this.shouldPublish = true
        this.published = new Date('2015-01-01')
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new RatingsPage(rootFolder, filePath, template)
}
