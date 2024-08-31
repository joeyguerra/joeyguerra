import { JSDOM } from 'jsdom'
import mockKeypressingEvents from './MockKeypressingEvents.mjs'

const fill = (elem, value, dom) => {
    value.split('').forEach((c, i) => {
        const keydown = new dom.window.KeyboardEvent('keydown', { key: c })
        elem.dispatchEvent(keydown)
        const keyup = new dom.window.KeyboardEvent('keyup', { key: c })
        elem.dispatchEvent(keyup)
    })
}

const mockTextboxes = dom => {
    const textboxes = Array.from(dom.window.document.querySelectorAll('input[type="text"]'))
        .concat(Array.from(dom.window.document.querySelectorAll('textarea')))
        .concat(Array.from(dom.window.document.querySelectorAll('input[type="search"]')))
        .concat(Array.from(dom.window.document.querySelectorAll('input[type="email"]')))
        .concat(Array.from(dom.window.document.querySelectorAll('input[type="tel"]')))
        .concat(Array.from(dom.window.document.querySelectorAll('input[type="url"]')))

    textboxes.forEach(elem => {
        elem.fill = value => {
            value.split('').forEach((c, i) => {
                const keydown = new dom.window.KeyboardEvent('keydown', { key: c })
                elem.dispatchEvent(keydown)
                const keyup = new dom.window.KeyboardEvent('keyup', { key: c })
                elem.dispatchEvent(keyup)
            })
        }
    })
    mockKeypressingEvents(textboxes)
    return textboxes
}
const mockForms = dom => {
    const forms = Array.from(dom.window.document.querySelectorAll('form'))
    forms.forEach(form => {
        form.submit = submitter => {
            const e = new dom.window.SubmitEvent('submit', { submitter: submitter ?? form })
            form.dispatchEvent(e)
        }
    })
    return forms
}
const mockFormsFromChildRecursive = (dom, elem) => {
    if(!elem?.querySelectorAll) return
    if(elem instanceof dom.window.HTMLFormElement) {
        elem.submit = submitter => {
            const e = new dom.window.SubmitEvent('submit', { submitter: submitter ?? elem })
            elem.dispatchEvent(e)
        }
    }
    Array.from(elem.children).forEach(child => mockFormsFromChildRecursive(dom, child))
}
const mockTextboxesFromChildRecursive = (dom, elem) => {
    if(!elem?.querySelectorAll) return
    if(elem instanceof dom.window.HTMLInputElement && ['text', 'search', 'email', 'tel', 'url'].includes(elem.type)) {
        elem.fill = value => {
            value.split('').forEach((c, i) => {
                const keydown = new dom.window.KeyboardEvent('keydown', { key: c })
                elem.dispatchEvent(keydown)
                const keyup = new dom.window.KeyboardEvent('keyup', { key: c })
                elem.dispatchEvent(keyup)
            })
        }
        mockKeypressingEvents([elem])
    }
    Array.from(elem.children).forEach(child => mockTextboxesFromChildRecursive(dom, child))
}
const makeDomFromFile = async filePath => {
    const dom = await JSDOM.fromFile(filePath, {
        url: 'https://example.org/',
        referrer: 'https://example.org/',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 5000000,
        pretendToBeVisual: true,
        runScripts: 'dangerously',
        resources: 'usable'
    })
    mockTextboxes(dom)
    mockForms(dom)
    const didChange = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            if(mutation.type !== 'childList') {
                return
            }
            mutation.addedNodes.forEach(node => {
                mockTextboxesFromChildRecursive(dom, node)
                mockFormsFromChildRecursive(dom, node)
            })
        })
    }
    const observer = new dom.window.MutationObserver(didChange)
    observer.observe(dom.window.document, { attributes: false, childList: true, subtree: false })
    const task = await new Promise((resolve, reject) => {
        dom.window.addEventListener('load', () => {
            resolve(dom)
        }, true)
    })
    return task
}
const makeDomFromString = async (html) => {
    const dom = new JSDOM(html, {
        url: 'https://example.org/',
        referrer: 'https://example.org/',
        contentType: 'text/html',
        includeNodeLocations: true,
        storageQuota: 5000000,
        pretendToBeVisual: true,
        runScripts: 'dangerously',
        resources: 'usable'
    })
    mockTextboxes(dom)
    mockForms(dom)
    const didChange = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            if(mutation.type !== 'childList') {
                return
            }
            mutation.addedNodes.forEach(node => {
                mockTextboxesFromChildRecursive(dom, node)
                mockFormsFromChildRecursive(dom, node)
            })
        })
    }
    const observer = new dom.window.MutationObserver(didChange)
    observer.observe(dom.window.document, { attributes: false, childList: true, subtree: true })

    const task = await new Promise((resolve, reject) => {
        dom.window.addEventListener('load', () => {
            resolve(dom)
        }, true)
    })
    return task
}
const makeDomFromUrl= async (url) => {
    const dom = await JSDOM.fromURL(url, {
        includeNodeLocations: true,
        storageQuota: 5000000,
        pretendToBeVisual: true,
        runScripts: 'dangerously',
        resources: 'usable'
    })
    mockTextboxes(dom)
    mockForms(dom)
    const didChange = (mutationList, observer) => {
        mutationList.forEach(mutation => {
            if(mutation.type !== 'childList') {
                return
            }
            mutation.addedNodes.forEach(node => {
                mockTextboxesFromChildRecursive(dom, node)
                mockFormsFromChildRecursive(dom, node)
            })
        })
    }
    const observer = new dom.window.MutationObserver(didChange)
    observer.observe(dom.window.document, { attributes: false, childList: true, subtree: true })

    const task = await new Promise((resolve, reject) => {
        dom.window.addEventListener('load', () => {
            resolve(dom)
        }, true)
    })
    return task
}

export {
    makeDomFromFile,
    makeDomFromString,
    makeDomFromUrl,
    fill
}

export default makeDomFromFile