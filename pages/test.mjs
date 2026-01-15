
import { Page } from 'juphjacs'

class TestPage extends Page {
    constructor (rootFolder, filePath, template, context) {
        super(rootFolder, filePath, template, context)
        this.title = 'Test'
        this.excerpt = 'Test.'
        this.layout = './pages/layouts/component.html'
        this.canonical = 'https://joeyguerra.com/test.html'
        this.image = ''
        this.published = new Date('2025-12-01')
        this.uri = '/test.html'
        this.tags = ['test']
        this.urls = []
        this.results = []
    }
    async post (req, res) {
        res.setHeader('Content-Type', 'text/html')
        res.end('<h1>Test Page from the Server</h1><p>This is a test page from the server.</p>')
    }
}

export default async (rootFolder, filePath, template, context) => {
    return new TestPage(rootFolder, filePath, template, context)
}
