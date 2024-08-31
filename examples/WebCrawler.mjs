import http from 'node:http'
import { JSDOM } from 'jsdom'

let links = []
let server = http.createServer((req, res) => {
    let url = new URL(req.url, `http://localhost:${server.address().port}`)
    let lastPart = url.pathname.split('/').pop()
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>My <span>${lastPart}</span> Web Server</title>
            </head>
            <body>
                <h1>My <span>${lastPart}</span> Web Server</h1>
                <a href="http://localhost:${server.address().port}/links/${lastPart}">Links ${lastPart}</a>
            </body>
        </html>
    `)
    res.end()
})

let run = async function () {
    return new Promise((resolve, reject) => {
        server.listen(0, ()=> {
            console.log(`Server is running on port ${server.address().port}`)
            resolve()
        })
    })
}

await run()

for (let i = 0; i < 100; i++) {
    links.push({ title: `Link ${i}`, link: `http://localhost:${server.address().port}/links/${i}` })
}

async function mapFromDom(elem) {
    let uri = elem.querySelector('h1 span')?.textContent ?? null
    let title = elem.querySelector('a')?.textContent ?? null
    let link = elem.querySelector('a')?.href ?? null
    return { title, link, uri }
}

let urlQueue = []
let visited = new Set()
let activeWorkers = 0
let data = []
links.forEach(l => {
    urlQueue.push(l.link)
})
async function crawl(url){
    let response = await fetch(url)
    let html = await response.text()
    let dom = new JSDOM(html)
    let listing = mapFromDom(dom.window.document)
    return listing
}
async function processQueue(){
    while(urlQueue.length > 0 && activeWorkers < 5) {
        let url = urlQueue.shift()
        if (visited.has(url)) {
            continue
        }
        visited.add(url)
        activeWorkers++
        let listing = await crawl(url)
        data.push(listing)
        activeWorkers--
        await processQueue()
    }
    server.close()
}

await processQueue()
console.log(data)