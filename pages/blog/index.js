import { renderMarkdown } from '@devchitchat/index97/markdown.js'
import { join, sep } from 'node:path'

const BLOG_FOLDER = join(import.meta.dir, '../blog')

function formatDate(iso) {
    const d = new Date(iso)
    if (isNaN(d)) return iso
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

async function readAllBlogFiles (folder) {
    const glob = new Bun.Glob('**/*.{phtml,md}')
    const allRoutes = []
    for await (const file of glob.scan({cwd: folder, onlyFiles: true })) {
      const [year, fileName] = file.split(sep)
      if (!fileName) continue
      const f = Bun.file(join(folder, file))
      const page = renderMarkdown(await f.text())
      if (!page.data.published) continue
      page.data.displayDate = formatDate(page.data.published)
      allRoutes.push({year, fileName, page })
    }
    return allRoutes.sort((a, b) => a.page.data.published < b.page.data.published ? 1 : -1)
}

const posts = await readAllBlogFiles(BLOG_FOLDER)
export async function GET(req) {
  return { posts }
}
