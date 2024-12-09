
import { Template, EVENTS } from '../src/Template.mjs'

class Post {
    constructor(title, year, excerpt, slug, uri, published, tags, image, shouldPublish) {
        this.title = title
        this.year = year
        this.excerpt = excerpt
        this.slug = slug
        this.uri = uri
        this.host = 'https://joeyguerra.com'
        this.published = published
        this.tags = tags
        this.image = image
        this.shouldPublish = shouldPublish
    }
    get url() {
        return `${this.host}${this.uri}`
    }
}

const posts = new Set()

export default async () => {
    const blogIndex = {
        filePath: '',
        context: {posts: []}
    }
    process.on(EVENTS.TEMPLATE_RENDERED, async (filePath, context, output) => {
        if (filePath.includes('/blog/index.html')) {
            blogIndex.filePath = filePath
            blogIndex.context = context
        }
        const regex = /\/blog\/(?<year>\d{4})\/(?<slug>[^.]+)(?<!\.html|\.md)/ig
        if (/\/blog\/\d+/i.test(filePath)) {
            const match = regex.exec(filePath)
            const { year, slug } = match.groups
            const uri = `/blog/${year}/${slug}.html`
            const post = new Post(context.title, new Date(year), context.excerpt,
                slug, uri, context.published, context.tags, context.image, context.shouldPublish)
            if (post.shouldPublish === true) {
                posts.add(post)
            }
        }
    })

    process.on(EVENTS.PRE_TEMPLATE_RENDER, async (filePath, initialContext, content) => {
        const filesToInclude = [
            '/blog/index.html'
        ]
        if (filesToInclude.some(file => filePath.includes(file))) {
            var sortedPosts = Array.from(posts).sort((a, b) => b.published - a.published)
            initialContext.postsSet = new Set(sortedPosts)
        }
    })
}