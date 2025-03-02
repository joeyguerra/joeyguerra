
import { EVENTS } from 'juphjacs/src/Page.mjs'
import { TemplateLiteralRenderer } from 'juphjacs/src/TemplateLiteralRenderer.mjs'
import { EVENTS as SITE_GENERATOR_EVENTS } from 'juphjacs/src/SiteGenerator.mjs'
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
        this.published = published?.toISOString() ?? (new Date()).toISOString()
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
    process.on(EVENTS.TEMPLATE_RENDERED, (filePath, page) => {
        if(page.filePath.includes('layouts')) {
            return
        }
        if (filePath.includes('/sitemap.xml')) {
            sitemapIndex.filePath = filePath
            sitemapIndex.context = page
        }
        const match = page.route.match(page.route.filePath.replace(page.pagesFolder, ''))
        const slug = match ? match[0] : page.route.filePath.replace(page.pagesFolder, '')
        const uri = `${slug}`
        const link = new Link(page.title, slug, uri, page.shouldPublish, page.published)
        if (link.shouldPublish === true) {
            urls.add(link)
        }
    })

    process.on(EVENTS.PRE_TEMPLATE_RENDER, (filePath, page) => {
        const filesToInclude = [
            '/sitemap.xml'
        ]
        if (filesToInclude.some(file => filePath.includes(file))) {
            page.urls = new Set(Array.from(urls).sort((a, b) => a.slug.localeCompare(b.slug)))
        }
    })

    process.on(SITE_GENERATOR_EVENTS.STATIC_SITE_GENERATED, async (routes, layouts) => {
        sitemapIndex.context.urls = Array.from(urls).sort((a, b) => a.slug.localeCompare(b.slug))
        const newFilePath = sitemapIndex.filePath.replace(PAGES, '')
        const template = new TemplateLiteralRenderer(readFile, PAGES)
        const content = await readFile(join(PAGES, newFilePath), 'utf8')
        const output = await template.render(content, sitemapIndex.context)
        await File.writeFile(join(__dirname, SITE_FOLDER, newFilePath), output, 'utf8')
    })
}