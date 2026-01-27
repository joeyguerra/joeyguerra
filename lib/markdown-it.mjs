// ESM wrapper for markdown-it
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

export function markdownToHtml(text) {
  return md.render(text || '')
}

export function htmlToMarkdown(html) {
  // Simple fallback: strip tags, replace <br> with \n, decode entities
  // For full fidelity, use a library like turndown (not included here)
  return html
    .replace(/<br\s*\/?>(\n)?/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
