
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class IntegrationBugChaosCarouselPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/carousel.html'
        this.title = 'Can AI Handle Integration Disasters?'
        this.canonical = 'https://joeyguerra.com/integration-bug-chaos.html'
        this.excerpt = 'We hit a wall: corrupt sales data in a SOX-compliant pipeline. Friday night firefighting, late-night debugging, missing documentation, and urgent pressure. Could AI do this job?'
        this.shouldPublish = true
        this.published = new Date('2025-03-29')
        this.uri = '/integration-bug-chaos.html'
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel-screenshot.jpg'
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new IntegrationBugChaosCarouselPage(rootFolder, filePath, template)
}
