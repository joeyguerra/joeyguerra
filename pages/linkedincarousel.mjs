
import { Page } from 'juphjacs/src/Page.mjs'

class LinkedInCarouselPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'LinkedIn Carousel Builder'
        this.layout = './pages/layouts/carousel.html'
        this.canonical = 'https://joeyguerra.com/linkedincarousel.html'
        this.excerpt = 'Build PDF documents for LinkedIn Carousel Posts.'
        this.shouldPublish = true
        this.published = new Date('2024-03-07')
        this.uri = '/linkedincarousel.html'
        this.touchStartupImage = '/images/daily-pushups-splash-screen.png'
        this.image = '/images/pushups-screenshot.jpg'
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new LinkedInCarouselPage(rootFolder, filePath, template)
}
