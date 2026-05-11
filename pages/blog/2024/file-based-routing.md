---
title: 'File-Based Routing Without the Magic'
excerpt: 'How index97 maps URLs to files with zero configuration.'
layout: './pages/layouts/post.html'
uri: '/blog/2024/file-based-routing'
published: 2024-10-14T00:00:00Z
tags: ['index97', 'routing', 'architecture', 'dx']
---

# File-Based Routing Without the Magic

Most frameworks hide their routing behind conventions and loaders you can't see. index97 takes a different approach: what you see in your file tree is exactly what you get in your URLs. No magic. No surprises.

## The Problem with Convention-Based Routing

Modern frameworks come with routing systems that feel convenient - until they don't:

- **Hidden transformations**: File names get mangled into URLs in unpredictable ways
- **Configuration sprawl**: Special cases pile up in config files far from the routes themselves
- **Runtime mystery**: Hard to trace which file handles which request without diving into framework internals
- **Debugging friction**: When a route breaks, you're debugging the framework, not your code

The cognitive load sneaks up on you. You spend more time remembering the framework's conventions than solving your actual problem. I want to make these more visible.

## How index97 Does It

index97 routing is explicit and transparent. Every file in `pages/` is a route, determined entirely by its extension:

| Extension | Kind | What it does |
|-----------|------|--------------|
| `.html` | document | Served as-is — no processing |
| `.phtml` | page | Template rendered with handler data |
| `.js` | handler | Exports HTTP method functions (`GET`, `POST`, etc.) |
| `.md` | markdown | Rendered from Markdown, front matter as slots |

Files prefixed with `_` are **private** — they are never routes. That's how `_layout.html` and `_layout.js` stay out of the URL space.

### Example Structure

```
pages/
├── _layout.html            ← wraps every page (not a route)
├── _layout.js              ← server-side data for the layout
├── index.html              → /
├── about.html              → /about
├── blog/
│   ├── index.html          → /blog
│   ├── index.js            → /blog  (handler with data)
│   ├── index.phtml         → template for the above
│   ├── 2024/
│   │   └── post.md         → /blog/2024/post
│   └── [slug].js           → /blog/:slug  (dynamic route)
│   └── [slug].phtml        ← template for the dynamic route
└── public/
    └── style.css           ← static assets, never routed
```

### Document Pages

An `.html` file with no `.js` sibling is served directly:

```html
<!-- pages/about.html -->
<template data-slot="title">About</template>

<h1>About</h1>
<p>Just a file. No handler needed.</p>
```

### Handler + Template Pages

When you need data, pair a `.js` handler with a `.phtml` template. The handler exports named HTTP method functions:

```js
// pages/blog/index.js
import { renderMarkdown } from '@devchitchat/index97/markdown.js'

export async function GET(req) {
  const posts = await loadPosts()
  return { posts }
}
```

```html
<!-- pages/blog/index.phtml -->
<template data-slot="title">Blog</template>

<h1>Blog</h1>
<ul>
  {{#each posts}}
  <li><a href="{{page.uri}}">{{page.title}}</a></li>
  {{/each}}
</ul>
```

The handler returns a plain object. index97 passes it to the template. No class, no lifecycle hooks, no adapter layer.

### Dynamic Routes

Wrap a segment in brackets to make it a parameter:

```
pages/blog/[slug].js      → /blog/hello-world
pages/blog/[slug].phtml   → template for the above
```

```js
// pages/blog/[slug].js
export async function GET(req) {
  const post = await getPost(req.params.slug)
  if (!post) return new Response('', { status: 404 })
  return { post }
}
```

```html
<!-- pages/blog/[slug].phtml -->
<h1>{{post.title}}</h1>
<div>{{{post.body}}}</div>
```

### Markdown Pages

Drop a `.md` file and it routes automatically. Front matter keys become layout slots:

```markdown
---
title: 'My Post'
published: 2024-10-14T00:00:00Z
---

# My Post

Content goes here.
```

The framework renders the Markdown body and injects `title`, `published`, and any other front matter keys as `{{slot:title}}` etc. in the layout. No handler required.

### Layouts

`_layout.html` in a directory wraps every page below it. The framework walks up the tree to find the nearest one:

```html
<!-- pages/_layout.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title>{{slot:title || My Site}}</title>
  {{slot:head}}
</head>
<body>
  {{content}}
</body>
</html>
```

Pages inject into named slots with `<template data-slot="name">`. Everything else lands in `{{content}}`.

To make data available across all pages — session state, nav items, feature flags — export a `data` function from `_layout.js`:

```js
// pages/_layout.js
export function data(req) {
  return { user: getSession(req) }
}
```

```html
<!-- pages/_layout.html -->
{{#if user}}<a href="/signout">Sign out</a>{{/if}}
```

### Forms: PUT, PATCH, DELETE

HTML forms only support GET and POST. index97 rewrites the others automatically — no JavaScript required:

```html
<form method="DELETE" action="/posts/42">
  <button>Delete</button>
</form>
```

```js
export async function DELETE(req) {
  await db.run('DELETE FROM posts WHERE id = ?', [req.params.id])
  return Response.redirect('/posts', 303)
}
```

## Why This Matters

### 1. **Transparency**
You can trace a request from URL to file in seconds. The extension tells you exactly how the file will be handled — no guessing which framework convention applies.

### 2. **Incremental Adoption**
Start with `.html` files. Add a `.js` handler only when you need dynamic behavior. Swap to `.md` for content-heavy pages. The framework doesn't force a pattern until you're ready.

### 3. **Easy Debugging**
When something breaks, you debug your code, not the framework's routing engine. Handlers are plain functions — the stack trace points directly to your export.

### 4. **No Lock-In**
Handlers are plain async functions that return objects or `Response` instances. There's nothing framework-specific to unpick if you want to move the logic elsewhere.

## Trade-offs

This approach isn't for everyone:

- **Explicit file paths**: You manage the URL structure manually. No automatic slug generation from a title field.
- **More files**: Dynamic pages need both a `.js` handler and a `.phtml` template alongside each other.
- **Explicit layouts**: `_layout.html` is discovered by directory proximity, not a global config — which means you need to know where your nearest layout lives.

These trade-offs favor **clarity over convenience**. If you prefer explicit control and transparent behavior, they're worth it.

## Comparison to Other Frameworks

| Framework | File → URL Mapping | Handler pattern | Debugging |
|-----------|-------------------|-----------------|-----------|
| **Next.js** | Convention-based, automatic | React components + `getServerSideProps` | Framework stack traces |
| **SvelteKit** | Convention-based, automatic | `+page.server.js` loader pattern | Framework stack traces |
| **Astro** | Convention-based, automatic | Frontmatter scripts in `.astro` files | Framework stack traces |
| **index97** | Explicit, extension-driven | Plain async functions, plain objects | Direct to your code |

## Try It Yourself

```bash
mkdir my-site && cd my-site
bun init -y
bun add @devchitchat/index97
```

```js
// server.js
import { createServer } from '@devchitchat/index97'
createServer({ pagesDir: './pages' })
```

```bash
bun server.js
```

Open `pages/` and match files to URLs at `http://localhost:3000`. The mapping is exactly what you see in the file tree.
