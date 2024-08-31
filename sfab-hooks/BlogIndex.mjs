import { pathToFileURL } from 'node:url'

export default (sfab, args) => {
    const posts = []
    const urls = []
    let blogIndex = null
    let siteMap = null
    return {
        model(file, model) {
            // object returned gets Object.assigned to the model passed to the handlebars compiler for use in the templates.
            return {
                base: {
                    href: '/'
                },
                posts,
                urls
            }
        },
        async transformed(viewKey, filePath, file, model, html, viewModel) {
            // do something during transformation
            if(viewKey.includes('sitemap.xml')) siteMap = file
            if(viewModel.should_publish === 'yes') urls.push(`/${viewKey}`)
            if(!viewKey.includes('blog/')) return
            if(viewKey == 'blog/index.html') {
                blogIndex = file
            }
            if(viewModel.should_publish == 'yes') posts.push(viewModel)
        },
        async copied(filePath) {
            // file wsa copied to this filePath.
        },
        async partial(partialName, partial, handlebars) {
            // partial was registered. passing handlebars if you want to register more.
            handlebars.registerHelper('difference', (posts, index)=>{
                return posts.length - index - 1
            })
        },
        async done() {
            // all files have been copied and transformed. 
            // posts is a set of all posts that were transformed.
            posts.reverse()
            await sfab.render([blogIndex, siteMap], sfab.app, pathToFileURL(args.folder).pathname, pathToFileURL(args.destination).pathname)
        }
    }
}
