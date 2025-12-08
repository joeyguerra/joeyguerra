---
title: 'File-Based Routing Without the Magic'
excerpt: 'How Juphjacs maps URLs to files with zero configuration.'
layout: './pages/layouts/post.html'
canonical: 'https://joeyguerra.com/blog/2024/file-based-routing.html'
published: '2024-10-14'
tags: ['juphjacs', 'routing', 'architecture', 'dx']
---

# File-Based Routing Without the Magic

Most frameworks hide their routing behind conventions and loaders you can't see. Juphjacs takes a different approach: what you see in your file tree is exactly what you get in your URLs. No magic. No surprises.

## The Problem with Convention-Based Routing

Modern frameworks come with routing systems that feel convenient - until they don't:

- **Hidden transformations**: File names get mangled into URLs in unpredictable ways
- **Configuration sprawl**: Special cases pile up in config files far from the routes themselves
- **Runtime mystery**: Hard to trace which file handles which request without diving into framework internals
- **Debugging friction**: When a route breaks, you're debugging the framework, not your code

The cognitive load sneaks up on you. You spend more time remembering the framework's conventions than solving your actual problem. I want to make these more visible.

## How Juphjacs Does It

Juphjacs routing is explicit and transparent:

1. **Files map directly to URLs**: `pages/blog/2024/post.html` serves `/blog/2024/post.html`
2. **`.mjs` handlers define behavior**: `pages/blog/2024/post.mjs` exports a Page class with optional `get()`, `post()`, etc.
3. **Layout composition is explicit**: Each page declares its own layout in the constructor
4. **No hidden loaders**: The framework loads modules directly - you can read the source and see exactly what happens

### Example Structure

```
pages/
├── index.html              → /
├── index.mjs               → exports IndexPage
├── blog/
│   ├── index.html          → /blog/
│   ├── index.mjs           → exports BlogIndexPage
│   ├── 2024/
│   │   ├── post.html       → /blog/2024/post.html
│   │   └── post.mjs        → exports PostPage
```

### Page Handler Pattern

Every `.mjs` file follows the same pattern:

```javascript
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class PostPage extends Page {
  constructor(pagesFolder, filePath, template, delegate) {
    super(pagesFolder, filePath, template, delegate)
    this.title = 'My Post'
    this.layout = './pages/layouts/post.html'
    this.uri = '/blog/2024/post.html'
    this.canonical = 'https://example.com/blog/2024/post.html'
  }

  // Optional: handle GET requests with custom logic
  async get(req, res) {
    // Fetch data, set state, etc.
    await this.render()
    res.setHeader('Content-Type', 'text/html')
    res.end(this.content)
  }
}

export default async (pagesFolder, filePath, template, delegate) => {
  return new PostPage(pagesFolder, filePath, template, delegate)
}
```

**What's happening:**
- The constructor sets metadata: title, layout, canonical URL, etc.
- The optional `get()` method handles HTTP GET requests
- `render()` composes the page with its layout
- The default export is a factory function that returns an instance

### Static vs. Dynamic Pages

**Static pages** (no `.mjs` file):
- Served directly from the `.html` file
- No custom logic, just template rendering

**Dynamic pages** (has `.mjs` file):
- Page class controls rendering
- Can fetch data, check auth, redirect, etc.
- Full control over the request/response cycle

**Markdown pages** (no need for `.mjs` file):
- Transformed to static `.html` pages

## Why This Matters

### 1. **Transparency**
You can trace a request from URL to file in seconds. No guessing which framework convention applies.

### 2. **Incremental Adoption**
Start with static HTML files. Add a `.mjs` handler only when you need dynamic behavior. The framework doesn't force you into a pattern until you're ready.

### 3. **Easy Debugging**
When something breaks, you debug your code, not the framework's routing engine. The stack trace points directly to your page handler.

### 4. **No Lock-In**
Pages are just JavaScript classes. You can extract the logic, test it independently, or port it to another system without fighting framework-specific abstractions.

## Trade-offs

This approach isn't for everyone:

- **Explicit file paths**: You manage the URL structure manually. No automatic slug generation. Although, in the page object, you can override its route to something custom.
- **More files**: Every dynamic page needs both `.html` and `.mjs`. Some frameworks bundle these. More files to create visiblity.
- **Explicit layout configuration**: You define the layout file explicitly, or not.

These trade-offs favor **clarity over convenience**. If you prefer explicit control and transparent behavior, they're worth it.

## Comparison to Other Frameworks Route Configuration

| Framework | File → URL Mapping | Configuration | Debugging |
|-----------|-------------------|---------------|-----------|
| **Next.js** | Convention-based, automatic | `next.config.js` + file structure | Framework stack traces |
| **SvelteKit** | Convention-based, automatic | `svelte.config.js` + file structure | Framework stack traces |
| **Astro** | Convention-based, automatic | `astro.config.mjs` + file structure | Framework stack traces |
| **Juphjacs** | Explicit, 1:1 mapping | None (declared in page constructors) | Direct to your code |

## Try It Yourself

Clone the repo and explore:

```bash
git clone https://github.com/joeyguerra/juphjacs.git
cd juphjacs
npm install
npm run dev
```

Open `pages/` and match files to URLs at `http://localhost:3000`. The mapping is exactly what you see in the file tree.

## What's Next

This routing approach enables other patterns:

- **Plugin hooks**: Intercept routing at specific points without framework magic
- **Incremental builds**: Only rebuild what changed, skip the framework's internal cache
- **Testing in isolation**: Import page classes directly in tests - no server required

These are topics for future posts. For now, the takeaway is simple: **routing should be boring**. It should map files to URLs, nothing more.

---

Follow the mission: [Juphjacs Web Framework](/missions/juphjacs.html)

Back to the blog: [Mission Log](/blog/mission-log.html)
