
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class ConceptsPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Concepts – Kaizen Ops Weblog'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/concepts/'
        this.excerpt = 'Reusable mental models and playbooks for building systems that work in the real world.'
        this.published = new Date('2025-12-01T12:00:00Z')
        this.uri = '/concepts/index.html'
        this.tags = ['concepts', 'mental models', 'playbooks', 'systems thinking', 'kaizen ops']
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new ConceptsPage(pagesFolder, filePath, template, delegate)
}
