
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class AiSoftwareEngineeringTrapCarouselPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/joeyg-carousel.html'
        this.title = 'AI Makes You Faster. But Is It Making You Weaker?'
        this.canonical = 'https://joeyguerra.com/ai-software-engineering-trap.html'
        this.excerpt = 'A CTO's Guide to Balancing Short-Term Wins with Long-Term Team Health.'
        this.shouldPublish = true
        this.published = new Date('2025-03-30')
        this.uri = '/ai-software-engineering-trap.html'
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel-screenshot.jpg'
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new AiSoftwareEngineeringTrapCarouselPage(rootFolder, filePath, template)
}
