
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class WorkoutPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Workout Tracker'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/workout.html'
        this.excerpt = 'Track your work.'
        this.uri = '/workout.html'
        this.image = '/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
        this.published = new Date('2025-07-01')
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new WorkoutPage(pagesFolder, filePath, template, delegate)
}
