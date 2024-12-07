import io from '/socket.io/socket.io.esm.min.js'
import morphdom from '/morphdom/morphdom-esm.js'
const morphdomOptions = {
    onNodeAdded (node) {
        if (node.nodeName === 'SCRIPT' && node.id !== 'HotReloader') {
            const script = document.createElement('script')
            Array(...node.attributes).forEach( attr => { script.setAttribute(attr.nodeName ,attr.nodeValue) })
            script.innerHTML = node.innerHTML
            node.replaceWith(script)
        }

        if (node.nodeName === 'LINK' && node.id !== 'HotReloader') {
            const link = document.createElement('link')
            Array(...node.attributes).forEach( attr => { link.setAttribute(attr.nodeName ,attr.nodeValue) })
            link.innerHTML = node.innerHTML
            node.replaceWith(link)
        }
    },
    onBeforeElUpdated (fromEl, toEl) {
        if (fromEl.nodeName === 'SCRIPT' && toEl.nodeName === 'SCRIPT' && fromEl.id !== 'HotReloader' && toEl.id !== 'HotReloader') {
            const script = document.createElement('script')
            Array(...toEl.attributes).forEach( attr => { script.setAttribute(attr.nodeName ,attr.nodeValue) })
            script.innerHTML = toEl.innerHTML
            fromEl.replaceWith(script)
            return false
        }

        if (fromEl.nodeName === 'LINK' && toEl.nodeName === 'LINK' && fromEl.id !== 'HotReloader' && toEl.id !== 'HotReloader') {
            const link = document.createElement('link')
            Array(...toEl.attributes).forEach( attr => { link.setAttribute(attr.nodeName ,attr.nodeValue) })
            link.innerHTML = toEl.innerHTML
            fromEl.replaceWith(link)
            return false
        }
        return true
    }
}

class HotReloader {
    constructor(window, socket) {
        this.window = window
        this.socket = socket
        socket.on('file changed', msg => {
            this.update(msg)
        })
        socket.on('disconnect', reason => {
            console.error('Disconnected:', reason)
        })
        socket.on('connect_error', error => {
            console.error('Connection error:', error)
        })
        window.addEventListener('unload', e =>{
            socket.close()
        })    
    }

    update(msg) {
        console.log('updating', msg)
        const domFromData = new DOMParser().parseFromString(msg.data, 'text/html')
        morphdom(document.head, domFromData.head, morphdomOptions)
        morphdom(document.body, domFromData.body, morphdomOptions)
        if (msg.fileThatTriggeredIt.endsWith('.js') || msg.fileThatTriggeredIt.endsWith('.mjs')) {
            const scriptElements = document.querySelectorAll('script');
            scriptElements.forEach(script => {
                if (script.src && script.src.includes(msg.fileThatTriggeredIt)) {
                    const newScript = document.createElement('script')
                    if (msg.fileThatTriggeredIt.endsWith('.mjs')) {
                        newScript.type = 'module'
                    }
                    newScript.src = `${script.src}?t=${new Date().getTime()}`
                    script.replaceWith(newScript)
                }
            })
        }

        if (msg.fileThatTriggeredIt.endsWith('.css')) {
            const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
            linkElements.forEach(link => {
                if (link.href && link.href.includes(msg.fileThatTriggeredIt)) {
                    const newLink = document.createElement('link')
                    newLink.rel = 'stylesheet'
                    newLink.href = `${link.href.split('?')[0]}?t=${new Date().getTime()}`;
                    link.replaceWith(newLink)
                }
            })
        }
        console.info('morphed', new Date()) 
    }
}
export { HotReloader }