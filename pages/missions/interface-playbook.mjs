
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class InterfacePlaybookMissionPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Mission: Interface Design Playbook – Kaizen Ops'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/missions/interface-playbook.html'
        this.excerpt = 'Patterns and anti-patterns for designing system interfaces that reduce integration pain.'
        this.published = new Date('2024-03-10T00:00:00Z')
        this.uri = '/missions/interface-playbook.html'
        this.tags = ['interfaces', 'systems design', 'mission', 'integration', 'contracts', 'api design']
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new InterfacePlaybookMissionPage(pagesFolder, filePath, template, delegate)
}
