class BaseHref {
    constructor(uri, defaultBaseHref = '') {
        this.uri = uri
        this.defaultBaseHref = defaultBaseHref
            ? defaultBaseHref.replace(/\/$/, '') ?? ''
            : ''
        if (!this.defaultBaseHref.includes('http') && this.defaultBaseHref.startsWith('/')) {
            this.defaultBaseHref = this.defaultBaseHref.replace(/^\//, '')
        }
    }
    get href() {
        const parts = `${this.defaultBaseHref}/${this.uri}`.split('/')
        parts.pop()
        const href = `${parts.join('/')}`
        if (!href.includes('http') && !/^\//.test(href) && href.length > 0) {
            return `/${href}/`
        }
        return `${href}/`
    }
}

export { BaseHref}