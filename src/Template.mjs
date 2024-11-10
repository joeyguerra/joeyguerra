import vm, { SyntheticModule, SourceTextModule } from 'node:vm'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const META_REGEX = /<meta name="(?<name>.*)" content="(?<content>.+)" \/>\n?/g
const LAYOUT_BODY_REGEX = /\n?(?<indention>\s*)(?<body>\$\{\s?body\s?\})/i
const SCRIPT_REGEX = /<script server>(?<script>[\s\S]*?)<\/script>\n?/gi

const EVENTS = {
    TEMPLATE_RENDERED: 'template rendered',
    STATIC_SITE_GENERATED: 'static site generated',
    PRE_TEMPLATE_RENDER: 'pre template render'
}


class Template {
    constructor(readFile, basePath) {
        this.readFile = readFile
        this.basePath = basePath
        this.context = {}
    }
    async render(content, initialContext = {}, isLayout = false) {
        const contexts = await this.executeScriptsIn(content, initialContext)
        const escapedContent = this.escapeScriptBackticks(content)
        this.context = Object.assign({}, initialContext)
        if (contexts.length > 0) {
            this.context = Object.assign(this.context, ...contexts)
        }
        // remove the scripts so that it's not ever sent to the client.
        let body = escapedContent?.replaceAll(SCRIPT_REGEX, '')
        try {
            const template = new Function('context', `with (context) { return \`${body}\` }`)
            body = template(this.context)
        } catch (e) {
            throw e
        } finally {
            body = this.restoreScriptBackticks(body)
        }
        if (!isLayout && this.context.layout) {
            this.context.layout = resolve(this.basePath, this.context.layout)
            const layoutHtml = await this.readFile(this.context.layout, 'utf-8')
            const layoutContext = Object.assign({}, this.context)
            body = this.render(layoutHtml, { body, ...layoutContext }, true)
        }
        return body
    }
    parseMetadata(html) {
        const meta = {}
        let match
        while ((match = META_REGEX.exec(html)) !== null) {
            meta[match.groups.name] = match.groups.content
        }
        return meta
    }
    async mergeWithLayout(html, layout, context) {
        let content = html.toString()

    }
    async executeScriptsIn(html, initialContext = {}) {
        const scripts = []
        let match
        while ((match = SCRIPT_REGEX.exec(html)) !== null) {
            scripts.push(match.groups.script)
        }
        if (scripts.length === 0) return []
        const contexts = []
        let context = vm.createContext({
            context: initialContext,
            console,
            process
        })
        for (let script of scripts) {
            script = script.replace(/\\`/g, '`')
            try {
                const module = await this.compileScript(script, context)
                if (module.namespace.default) {
                    Object.assign(context.context, module.namespace.default)
                } else {
                    Object.assign(context.context, module.namespace)
                }
                contexts.push(context.context)
            } catch (e) {
                console.error('compiling error', e, html)
            }
        }
        return contexts
    }
    async compileScript(script, context) {
        const module = new SourceTextModule(script, {
            context,
            initializeImportMeta(meta, module) {
                meta.url = `file://${filePath}`
            },
            importModuleDynamically: this.importModuleDynamically.bind(this)
        })
        await module.link(this.importModuleDynamically.bind(this))
        await module.evaluate()
        return module
    }
    async importNodeModule(specifier, referencingModule) {
        const mod = await import(specifier)
        // Note: this code resulted in an error when tyring to import Buffer from node:buffer
        // it said that Buffer didn't export default.
        // const namespace = new SyntheticModule(['default'],
        //     () => namespace.setExport('default', mod.default),
        //     { identifier: specifier, context: referencingModule.context }
        // )

        const namespace = new SyntheticModule(Object.keys(mod),
            function() {
                for (const [key, value] of Object.entries(mod)) {
                    this.setExport(key, value);
                }
            },
            { identifier: specifier, context: referencingModule.context }
        )
        try {
            await namespace.link(this.importModuleDynamically.bind(this))
            await namespace.evaluate()
        } catch (e) {
            console.error(e)
        }
        return namespace
    }
    async importOtherModule(specifier, referencingModule) {
        const resolvedPath = resolve(dirname(referencingModule.identifier), specifier)
        const moduleContent = await fs.promises.readFile(resolvedPath, 'utf-8')
        const childModule = new SourceTextModule(moduleContent, {
            context: referencingModule.context
        })
        try {
            await childModule.link(this.importModuleDynamically.bind(this))
            await childModule.evaluate()    
        } catch (e) {
            console.error('custom', e)
        }
        return childModule
    }
    async importModuleDynamically(specifier, referencingModule) {
        if (specifier.startsWith('node:') || !specifier.startsWith('/')) {
            return this.importNodeModule(specifier, referencingModule)
        } else {
            return this.importOtherModule(specifier, referencingModule)
        }
    }
    escapeScriptBackticks(html) {
        return html.replace(/<script([\s\S]*?)<\/script>/gi, (match) => {
            return match.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
        })
    }
    restoreScriptBackticks(html) {
        return html.replace(/<script([\s\S]*?)<\/script>/gi, (match) => {
            return match.replace(/\\`/g, '`').replace(/\\\$\\\{/g, '${')
        })
    }
}

export {
    Template,
    EVENTS
}