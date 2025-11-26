export default {
    siteName: 'Joey Guerra',
    sourceFolder: './pages',
    buildFolder: './_site',
    resources: ['css', 'js', 'images', 'HubotSans', 'favicon_package_v0', '.well-known', 'guide-software-success/assets', 'webapp'],
    fileExtensions: {
        exclude: ['.html', '.xml', '.md', '.mjs', '.js'],
        include: ['.html', '.xml', '.md']
    },
    build: {
        source: './pages',
        output: './_site',
        assets: ['css', 'js', 'images', 'HubotSans', 'favicon_package_v0', '.well-known'],
        layouts: './pages/layouts'
    },
    plugins: [{
            name: 'blog',
            enabled: true,
            path: 'juphjacs/plugins/Blog.mjs',
            options: {
                postsFolder: 'blog',
                postsPerPage: 10,
                dateFormat: 'MMMM DD, YYYY'
            }
        },
        {
            name: 'sitemap',
            enabled: true,
            path: 'juphjacs/plugins/Sitemap.mjs',
            options: {
                hostname: 'https://joeyguerra.com'
            }
        }
    ]
}
