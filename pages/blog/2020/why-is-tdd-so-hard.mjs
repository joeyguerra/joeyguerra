
import { Page } from 'juphjacs/src/Page.mjs'

class WhyIsTDDSoHardPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Why Is Test Driven Development (TDD) So Hard: Revisited"
        this.layout = './pages/layouts/post.html'
        this.canonical = 'https://www.joeyguerra.com/blog/2020/why-is-tdd-so-hard.html'
        this.excerpt = "I wrote about TDD in 2016. Since then, I feel like I've gotten better at it and have seen people use it less. So I'm revisiting the question, why is TDD so hard. I started a few conversations about it over Slack and LinkedIn. Here's my summary."
        this.shouldPublish = true
        this.published = new Date('2020-03-20')
        this.tags = ['tdd', 'software design', 'software architecture']
        this.image = ''
        this.uri = '/blog/2020/why-is-tdd-so-hard.html'
    }
}

export default async (rootFolder, filePath, template) => {
    return new WhyIsTDDSoHardPage(rootFolder, filePath, template)
}
