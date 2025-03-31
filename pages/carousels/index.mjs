
import { Page } from 'juphjacs/src/Page.mjs'

class CarouselsPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/index.html'
        this.title = 'All my LiinkedIn Carousels'
        this.canonical = 'https://www.joeyguerra.com/carousels/'
        this.excerpt = 'List of all my LinkedIn carousels. These are slide decks that I created to share insights and tips on software engineering, leadership, and career development.'
        this.shouldPublish = true
        this.published = new Date('2025-03-30')
        this.uri = '/carousels/index.html'
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel-screenshot.jpg'
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CarouselsPage(rootFolder, filePath, template)
}
