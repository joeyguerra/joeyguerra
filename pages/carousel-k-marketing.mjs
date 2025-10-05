
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class CarouselKMarketingPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/carousel.html'
        this.title = '360 Feedback Loop is Non-Existent with Customers'
        this.canonical = 'https://joeyguerra.com/carousel-k-marketing.html'
        this.excerpt = 'LinkedIn carousel template.'
        this.published = new Date('2024-10-01')
        this.uri = '/carousel-k-marketing.html'
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CarouselKMarketingPage(rootFolder, filePath, template)
}
