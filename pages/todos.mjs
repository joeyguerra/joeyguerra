
import { Page } from 'juphjacs/src/Page.mjs'

class TodoPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Todo App'
        this.layout = './pages/layouts/app.html'
        this.canonical = 'https://www.joeyguerra.com/todos.html'
        this.excerpt = 'Implement the MVC pattern for a Todo App.'
        this.shouldPublish = true
        this.uri = '/todos.html'
        this.image = '/pushups-screenshot.jpg'
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
        this.published = new Date('2021-01-01')
    }
}

export default async (rootFolder, filePath, template) => {
    return new TodoPage(rootFolder, filePath, template)
}
