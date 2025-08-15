
import { Page } from 'juphjacs/src/Page.mjs'

class IndexPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'About Joey Guerra - The Certified Joey Engineer® (CJE®) Program'
        this.layout = './pages/layouts/default.html'
        this.canonical = 'https://joeyguerra.com/'
        this.excerpt = `Unlock Your Potential with the Certified Joey Engineer® (CJE®) Program. Are you ready to take your engineering skills to the next level and set yourself apart in the competitive world of software development? The Certified Joey Engineer® program isn't just a training course - it's a transformation. Drawing on over 30 years of real-world experience in industries as diverse as aerospace, e-commerce, and custom software development, this program equips you with the mindset, tools, and techniques to tackle any challenge with confidence and ingenuity.`
        this.shouldPublish = true
        this.published = new Date('2019-01-01')
        this.uri = '/'
        this.image = ''
        this.tags = ['joey', 'guerra', 'software', 'engineer', 'cje', 'certified', 'program']
    }
}

export default async (rootFolder, filePath, template) => {
    return new IndexPage(rootFolder, filePath, template)
}
