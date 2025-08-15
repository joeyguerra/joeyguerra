
import { Page } from 'juphjacs/src/Page.mjs'

class CarouselEventsPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/carousel.html'
        this.title = 'Carousel Example 1'
        this.canonical = 'https://joeyguerra.com/linkedincarousel.html'
        this.excerpt = 'LinkedIn carousel template.'
        this.shouldPublish = true
        this.published = new Date('2024-10-05')
        this.uri = '/linkedincarousel.html'
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CarouselEventsPage(rootFolder, filePath, template)
}
