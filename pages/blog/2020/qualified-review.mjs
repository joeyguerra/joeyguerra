
import { Page } from 'juphjacs/src/Page.mjs'

class QualifiedReviewPage extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = 'Reviewing a Developer Skill Assesment Tool'
        this.layout = './pages/layouts/post.html'
        this.canonical = 'https://www.joeyguerra.com/blog/2020/qualified-review.html'
        this.excerpt = "We're growing. So in an effort to optimize the hiring process and improve the probability of hiring people who can do the job, we're thinking through our interview process. As part of that, we're researching Skill Assessment systems. Here's my first impressions with a tool called Qualified."
        this.shouldPublish = true
        this.published = new Date('2020-03-06T10:43:08.111Z')
        this.tags = ['hiring', 'qualified', 'skill assessment']
        this.image = ''
        this.uri = '/blog/2020/qualified-review.html'
    }
}

export default async (rootFolder, filePath, template) => {
    return new QualifiedReviewPage(rootFolder, filePath, template)
}
