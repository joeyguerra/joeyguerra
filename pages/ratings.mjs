
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class RatingsPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Ratings'
        this.uri = '/ratings.html'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/ratings.html'
        this.excerpt = 'Ratings example with MVC.'
        this.published = new Date('2015-01-01')
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new RatingsPage(pagesFolder, filePath, template, delegate)
}
