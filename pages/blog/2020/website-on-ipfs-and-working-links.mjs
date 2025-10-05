
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class WebsiteOnIpfsAndWorking extends Page {
    constructor (rootFolder, filePath, template) {
        super(rootFolder, filePath, template)
        this.title = "Website on IPFS and Working Links"
        this.layout = './pages/layouts/post.html'
        this.canonical = 'https://joeyguerra.com/blog/2020/website-on-ipfs-and-working-links.html'
        this.excerpt = "I wanted to host my website on IPFS. It's easy, but the links don't work. So I reached deep back into the recesses of my mind and found a fix."
        this.shouldPublish = true
        this.published = new Date('2020-01-26')
        this.tags = ['ipfs', 'html']
        this.image = ''
        this.uri = '/blog/2020/website-on-ipfs-and-working-links.html'
    }
}

export default async (rootFolder, filePath, template) => {
    return new WebsiteOnIpfsAndWorking(rootFolder, filePath, template)
}
