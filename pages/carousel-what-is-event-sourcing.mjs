
import { Page } from 'juphjacs/src/Page.mjs'

class CarouselWhatIsEventSourcingPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.layout = './pages/layouts/carousel.html'
        this.title = 'What is Event Sourcing?'
        this.canonical = 'https://joeyguerra.com/carousel-what-is-event-sourcing.html'
        this.excerpt = 'Event Sourcing is a data persistence strategy that enables us to, at any time, visualize the state of our system at any point in time, past, present and future.'
        this.shouldPublish = true
        this.published = new Date('2024-06-04')
        this.uri = '/carousel-what-is-event-sourcing.html'
        this.touchStartupImage = '/images/carousel.png'
        this.image = '/images/carousel-screenshot.jpg'
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (rootFolder, filePath, template) => {
    return new CarouselWhatIsEventSourcingPage(rootFolder, filePath, template)
}
