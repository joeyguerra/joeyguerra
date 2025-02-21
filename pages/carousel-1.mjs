
import { Page } from 'juphjacs/src/Page.mjs'

class CarouselPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/carousel.html'
        this.title = 'Carousel Example 1'
        this.canonical = 'https://www.joeyguerra.com/carousel-1.html'
        this.excerpt = 'LinkedIn carousel template.'
        this.uri = '/carousel-1.html'
        this.shouldPublish = true
        this.published = new Date('2024-10-09')
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel.png'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CarouselPage(rootFolder, filePath, template)
}
