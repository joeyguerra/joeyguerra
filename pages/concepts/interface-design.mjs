import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class InterfaceDesignConceptPage extends Page {
	constructor (pagesFolder, filePath, template, delegate) {
		super(pagesFolder, filePath, template, delegate)
		this.title = 'Interface Design – Concept Field Guide'
		this.layout = './pages/layouts/blog.html'
		this.canonical = 'https://joeyguerra.com/concepts/interface-design.html'
		this.excerpt = 'Most integration pain doesn’t come from code — it comes from the shape of your interfaces. Design boundaries that clarify failure modes instead of hiding them.'
		this.published = new Date('2025-12-02T00:00:00Z')
		this.uri = '/concepts/interface-design.html'
		this.tags = ['concepts', 'interface design', 'contracts', 'idempotency', 'systems thinking']
	}
}

export default async (pagesFolder, filePath, template, delegate) => {
	return new InterfaceDesignConceptPage(pagesFolder, filePath, template, delegate)
}
