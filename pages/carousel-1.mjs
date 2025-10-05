
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class CarouselPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.layout = './pages/layouts/carousel.html'
        this.title = 'Carousel Example 1'
        this.canonical = 'https://joeyguerra.com/carousel-1.html'
        this.excerpt = 'LinkedIn carousel template.'
        this.uri = '/carousel-1.html'
        this.published = new Date('2024-10-09')
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel.png'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new CarouselPage(pagesFolder, filePath, template, delegate)
}
