import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class MissionLogPage extends Page {
  constructor(pagesFolder, filePath, template, delegate) {
    super(pagesFolder, filePath, template, delegate)
    this.title = 'Mission Log'
    this.layout = './pages/layouts/blog.html'
    this.canonical = 'https://joeyguerra.com/blog/mission-log.html'
    this.excerpt = 'Chronological log of mission updates and milestones across the site.'
    this.published = new Date('2025-11-30T00:00:00Z')
    this.uri = '/blog/mission-log.html'
    this.tags = ['missions', 'log', 'updates']
    this.entries = []
  }

  async get(req, res) {
    const blogPlugin = this.context.getPluginByName('BlogPlugin')
    let postLogs = []
    if (blogPlugin && blogPlugin.posts) {
      // Normalize plugin posts into log items
      postLogs = [...blogPlugin.posts].map(p => ({
        date: new Date(p.published).toISOString().slice(0, 10),
        title: p.title,
        summary: p.excerpt ?? '',
        link: p.link,
        mission: 'Blog',
        tags: p.tags ?? []
      }))
    }

    // Merge curated mission entries with blog posts
    let merged = [...this.entries, ...postLogs]

    // Filter by tag if query param exists
    const url = new URL(req.url, `http://${req.headers.host}`)
    const tagFilter = url.searchParams.get('tag')
    if (tagFilter) {
      merged = merged.filter(entry => {
        return entry.tags && entry.tags.includes(tagFilter)
      })
      this.title = `Mission Log: #${tagFilter}`
    }

    // Sort desc by date
    merged.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Expose to template
    this.entries = merged
    this.selectedTag = tagFilter
    await this.render()
    res.setHeader('Content-Type', 'text/html')
    res.end(this.content)
  }
}

export default async (pagesFolder, filePath, template, delegate) => {
  return new MissionLogPage(pagesFolder, filePath, template, delegate)
}
