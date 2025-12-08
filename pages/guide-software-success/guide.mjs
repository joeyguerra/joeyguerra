
import { Page } from 'juphjacs'

class GuidePage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template)
        this.layout = './pages/guide-software-success/layout.html'
        this.title = 'The Mid-Sized Business Owner's Guide to Software Success'
        this.canonical = 'https://joeyguerra.com/guide-software-success/guide.html'
        this.uri = '/guide-software-success/guide.html'
        this.excerpt = 'Go Live Now, scale with confidence, and get real ROI from your software investments.'
        this.published = new Date('2025-11-08T08:00:00Z')
        this.image = ''
        this.touchStartupImage = ''
        this.touchIcon180 = ''
        this.touchIcon32 = ''
        this.touchIcon16 = ''
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new GuidePage(pagesFolder, filePath, template, delegate)
}
