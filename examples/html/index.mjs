export default {
    layout: 'layouts/layout.html',
    title: 'Main Page',
    match(url) {
        return url === '/index.html'
    }
}