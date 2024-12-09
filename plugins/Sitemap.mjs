
import { Template, EVENTS } from '../src/Template.mjs'
import { promises as File } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { readFile } = File
const __dirname = dirname(fileURLToPath(import.meta.url)).replace('/plugins', '')
const PAGES = join(__dirname, 'pages')
const SITE_FOLDER = '_site'

class Link {
    constructor(title, slug, uri, shouldPublish, published) {
        this.title = title
        this.slug = slug
        this.uri = uri
        this.host = 'https://joeyguerra.com'
        this.shouldPublish = shouldPublish
        this.published = published ?? new Date()
    }
    get url() {
        return `${this.host}${this.uri}`
    }
}

const urls = new Set()

export default async () => {
    const sitemapIndex = {
        filePath: '',
        context: {urls: []}
    }
    process.on(EVENTS.TEMPLATE_RENDERED, async (filePath, context, output) => {
        if (filePath.includes('/sitemap.xml')) {
            sitemapIndex.filePath = filePath
            sitemapIndex.context = context
        }
        const slug = context.req.urlParsed.pathname
        const uri = `${slug}`
        const link = new Link(context.title, slug, uri, context.shouldPublish, context.published)
        if (link.shouldPublish === true) {
            urls.add(link)
        }
    })

    process.on(EVENTS.PRE_TEMPLATE_RENDER, async (filePath, initialContext, content) => {
        const filesToInclude = [
            '/sitemap.xml'
        ]
        if (filesToInclude.some(file => filePath.includes(file))) {
            initialContext.urls = new Set(Array.from(urls).sort((a, b) => a.slug.localeCompare(b.slug)))
        }
    })

    process.on(EVENTS.STATIC_SITE_GENERATED, async (routes, layouts) => {
        sitemapIndex.context.urls = Array.from(urls).sort((a, b) => a.slug.localeCompare(b.slug))
        const newFilePath = sitemapIndex.filePath.replace(PAGES, '')
        const template = new Template(readFile, PAGES)
        const content = await readFile(join(PAGES, newFilePath), 'utf8')
        const output = await template.render(content, sitemapIndex.context)
        await File.writeFile(join(__dirname, SITE_FOLDER, newFilePath), output, 'utf8')
    })
}