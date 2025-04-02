
import { Page } from 'juphjacs/src/Page.mjs'

class IndexPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Joey Guerra | Software Engineering Consultant"
        this.layout = './pages/layouts/homepage.html'
        this.canonical = 'https://www.joeyguerra.com/'
        this.excerpt = `I specialize in software modernization and systems integration. Whether you're trying to move off legacy code,
        unify your data, or automate operations, I bring clarity, momentum, and proven architecture patterns that work
        in the real world.`
        this.shouldPublish = true
        this.published = new Date('2025-04-01 20:43:00')
        this.uri = '/'
        this.image = ''
        this.tags = ['software', 'consulting', 'engineering']
    }
}

export default async (rootFolder, filePath, template) => {
    return new IndexPage(rootFolder, filePath, template)
}
