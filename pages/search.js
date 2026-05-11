import path from 'node:path'

const PAGES_DIR = new URL('.', import.meta.url).pathname

function parseFrontmatter(src) {
    if (!src.startsWith('---')) return { data: {}, body: src }
    const end = src.indexOf('\n---', 3)
    if (end === -1) return { data: {}, body: src }
    const raw = src.slice(3, end).trim()
    const data = {}
    for (const line of raw.split('\n')) {
        const colon = line.indexOf(':')
        if (colon === -1) continue
        const key = line.slice(0, colon).trim()
        let val = line.slice(colon + 1).trim()
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
        }
        // Parse arrays like ['a', 'b']
        if (val.startsWith('[')) {
            try { val = JSON.parse(val.replace(/'/g, '"')) } catch { /* keep as string */ }
        }
        data[key] = val
    }
    return { data, body: src.slice(end + 4) }
}

async function loadBlogPosts() {
    const glob = new Bun.Glob('blog/**/*.md')
    const posts = []
    for await (const file of glob.scan({ cwd: PAGES_DIR, onlyFiles: true })) {
        try {
            const src = await Bun.file(path.join(PAGES_DIR, file)).text()
            const { data } = parseFrontmatter(src)
            if (!data.title) continue
            posts.push({
                title: data.title,
                excerpt: data.excerpt || '',
                link: data.uri || '/' + file.replace(/\.md$/, '.html'),
                type: 'post'
            })
        } catch { /* skip unreadable files */ }
    }
    return posts
}

export async function GET(req) {
    const url = new URL(req.url)
    const query = (url.searchParams.get('q') || '').trim().toLowerCase()

    const posts = await loadBlogPosts()

    const results = query
        ? posts.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.excerpt.toLowerCase().includes(query)
        ).slice(0, 10)
        : []

    return { results, query }
}
