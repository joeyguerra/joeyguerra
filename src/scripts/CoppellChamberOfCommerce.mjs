// Description:
//  Coppell Chamber of Commerce
//
// Commands:
//  hubot chamber update|u - Get the latest version of the list.
//  hubot chamber search|s <query> - Search the list for a business.

//
// Notes:
//  The Coppell Chamber of Commerce Directory is a list of businesses in Coppell, Texas.
//  The directory is available at https://business.coppellchamber.org/list/searchalpha
//  but it sucks. This script will provide a better interface to the directory.
//

//https://business.coppellchamber.org/list/searchalpha/b

import { JSDOM } from 'jsdom'
import {load as cheerio} from 'cheerio'
import fs from 'node:fs'
import path from 'node:path'
import { Template } from '../../lib/Template.mjs'
import { fileURLToPath } from 'node:url'

const ENDPOINT = 'https://business.coppellchamber.org/list/searchalpha'
const cache = { data: [], timestamp: 0, expires: 60 * 60 * 1000 }
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../')
function mapDomToListingShcema(elem){
    if (!elem) {
        return null
    }
    let website = elem.querySelector('.mn-print-url')?.href
    let name = elem.querySelector('[itemprop="name"] a')
    let address = elem.querySelector('[itemprop="address"]')
    let street = address?.querySelector('[itemprop="streetAddress"]')?.textContent ?? null
    let street2 = address?.querySelector('.mn-address2')?.textContent ?? null
    let citystatezip = address?.querySelector('[itemprop="citystatezip"]')
    let addressLocality = citystatezip?.querySelector('[itemprop="addressLocality"]')?.textContent ?? null
    let addressRegion = citystatezip?.querySelector('[itemprop="addressRegion"]')?.textContent ?? null
    let zip = citystatezip?.querySelector('[itemprop="postalCode"]')?.textContent ?? null
    let addressFormated = `${street}, ${addressLocality}, ${addressRegion} ${zip}`
    let phone = elem.querySelector('[itemprop="telephone"]')?.textContent ?? null
    return { name: name?.textContent, address: addressFormated, website, phone}
}
function mapDomToListing(element) {
    let name = element.querySelector('[itemprop="name"]')?.textContent.trim()
    if (!name || name === '') {
        name = element.querySelector('.card-header')?.textContent.trim()
    }
    let address = element.querySelector('.gz-card-address a')
    let street = address?.querySelector('[itemprop="streetAddress"]')?.textContent ?? null
    let street2 = address?.querySelector('.mn-address2')?.textContent ?? null
    let citystatezip = address?.querySelector('[itemprop="citystatezip"]')
    let addressLocality = citystatezip?.querySelector('.gz-address-city')?.textContent ?? null
    let addressRegion = citystatezip?.querySelector('span:nth-child(2)')?.textContent ?? null
    let zip = citystatezip?.querySelector('span:nth-child(3)')?.textContent ?? null

    let phone = element.querySelector('.gz-card-phone')?.textContent.trim()
    let website = element.querySelector('.gz-card-website a')?.href
    let addressFormated = formatAddress(street, addressLocality, addressRegion, zip)
    return { name, address: addressFormated, website, phone}
}
function formatAddress (street, addressLocality, addressRegion, zip) {
    return [street, addressLocality, addressRegion, zip].filter(Boolean).join(',')
}
let urlQueue = []
let visited = new Set()
let activeWorkers = 0
async function processQueue(delay, cache){
    while(urlQueue.length > 0 && activeWorkers < 5) {
        let url = urlQueue.shift()
        if (visited.has(url)) {
            continue
        }
        visited.add(url)
        activeWorkers++
        await delay(500)
        let listing = await crawl(url)
        if (listing) {
            cache.data = cache.data.concat(listing)
        }
        cache.timestamp = Date.now()
        activeWorkers--
        await processQueue(delay, cache)
    }
}

async function crawl(url){
    let response = await fetch(url)
    let html = await response.text()
    let parsed = new URL(url)
    await fs.promises.writeFile(`${ROOT_DIR}/public/chamber-directory/${parsed.pathname.split('/').pop()}.html`, html)
    let dom = new JSDOM(html)
    return Array.from(dom.window.document.querySelectorAll('.gz-results-card')).map(mapDomToListing)
}

function search(query){
    let results = cache.data.filter(item => {
        return item.name.toLowerCase().includes(query.toLowerCase())
    })
    return results
}

function list(){
    return cache.data
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

// 0-9
for (let i = 48; i <= 57; i++) {
    urlQueue.push(`${ENDPOINT}/${String.fromCharCode(i)}`);
}

// a-z
for (let i = 97; i < 123; i++) {
    urlQueue.push(`${ENDPOINT}/${String.fromCharCode(i)}`)
}

export default async robot => {
    
    robot.respond(/chamber [update|u]/i, async res => {
        cache.data = []
        await processQueue(delay, cache)
        await fs.promises.writeFile(`${ROOT_DIR}/resources/coppell-chamber-of-commerce-directory.json`, JSON.stringify(cache.data, null, 2))
        await res.reply('Updated.')
    })
    
    robot.respond(/chamber [search|s] (?<query>.+)/i, async res => {
        let { query } = res.match.groups
        let results = search(query)
        if (results.length === 0) {
            await res.reply('No results found.')
        } else {
            let output = results.map(item => `${item.name}\n${item.address}\n${item.phone}\n${item.website}`).join('\n\n')
            await res.reply(output)
        }
    })
}