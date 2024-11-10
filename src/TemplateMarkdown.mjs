import MarkdownIt from 'markdown-it'
import { Template } from './Template.mjs'
class TemplateMarkdown extends Template {
    constructor(readFile, basePath) {
        super(readFile, basePath)
        this.markdown = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true
        })
    }
    async render(content, initialContext = {}, isLayout = false) {
        let data = !isLayout ? this.markdown.render(content) : content
        let html = await super.render(data, initialContext, isLayout)
        return html
    }
}

export { TemplateMarkdown }