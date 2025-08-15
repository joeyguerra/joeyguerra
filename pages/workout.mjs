
import { Page } from 'juphjacs/src/Page.mjs'

class WorkoutPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Workout Tracker'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://joeyguerra.com/workout.html'
        this.excerpt = 'Track your work.'
        this.shouldPublish = true
        this.uri = '/workout.html'
        this.image = '/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
        this.published = new Date('2025-07-01')
    }
}

export default async (rootFolder, filePath, template) => {
    return new WorkoutPage(rootFolder, filePath, template)
}
