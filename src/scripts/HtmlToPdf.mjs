// Description:
// Takes a URL, gets the HTML and converts it to a PDF.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot pdfme <url> - Convert HTML from URL to a PDF.
//
// Notes:
//
// Author:
//   Joey Guerra

import htmlToPdfmake from 'html-to-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { JSDOM, ResourceLoader } from 'jsdom'
import { fileURLToPath } from 'url'
import agentFactory from 'jsdom/lib/jsdom/living/helpers/agent-factory.js'
import Request from 'jsdom/lib/jsdom/living/helpers/http-request.js'
import path from 'node:path'
import fs from 'node:fs/promises'
class ResourceMapper extends ResourceLoader {
    constructor(options) {
        super(options)
        this.resources = new Map()
    }
    fetch(urlString, { accept, cookieJar, referrer } = {}) {
        const url = new URL(urlString)
        if (!url) {
          return Promise.reject(new Error(`Tried to fetch invalid URL ${urlString}`))
        }
        switch (url.protocol.replace(':', '')) {
          case "data": {
            return super._readDataURL(url)
          }
          case "http":
          case "https": {
            const agents = agentFactory(this._proxy, this._strictSSL)
            const headers = {
              "User-Agent": this._userAgent,
              "Accept-Language": "en",
              "Accept-Encoding": "gzip",
              "Accept": accept || "*/*"
            };
            if (referrer) {
              headers.Referer = referrer
            }
            const requestClient = new Request(
              urlString,
              { followRedirects: true, cookieJar, agents },
              { headers }
            );
            const promise = new Promise((resolve, reject) => {
              const accumulated = []
              requestClient.once("response", res => {
                promise.response = res
                const { statusCode } = res
                // TODO This deviates from the spec when it comes to
                // loading resources such as images
                if (statusCode < 200 || statusCode > 299) {
                  requestClient.abort();
                  reject(new Error(`Resource was not loaded. Status: ${statusCode}`))
                }
              })
              requestClient.on("data", chunk => {
                accumulated.push(chunk)
              })
              requestClient.on("end", () => resolve(Buffer.concat(accumulated)))
              requestClient.on("error", reject)
            });
            // The method fromURL in lib/api.js crashes without the following four
            // properties defined on the Promise instance, causing the test suite to halt
            requestClient.on("end", () => {
              promise.href = requestClient.currentURL
            })
            promise.abort = requestClient.abort.bind(requestClient);
            promise.getHeader = name => headers[name] || requestClient.getHeader(name)
            requestClient.end()
            return promise
          }
          case "file": {
            try {
              return this._readFile(fileURLToPath(urlString))
            } catch (e) {
              return Promise.reject(e)
            }
          }
          default: {
            return Promise.reject(new Error(`Tried to fetch URL ${urlString} with invalid scheme ${url.scheme}`))
          }
        }
    }
}
export default async robot => {
    robot.respond(/pdfme\s?(?<targetUrl>.*)/i, async resp => {
        const { targetUrl } = resp.match.groups
        if(!targetUrl || targetUrl.length == 0){
            return resp.reply('Please provide a URL')
        }
        try {
          const url = new URL(targetUrl)
          pdfMake.vfs = pdfFonts.pdfMake.vfs
          const resourceMapper = new ResourceMapper()
          const dom = await JSDOM.fromURL(targetUrl, {
              referrer: targetUrl,
              includeNodeLocations: true
          })
          const images = {}
          for await (const img of dom.window.document.querySelectorAll('img')) {
            try {
              const response = await fetch(img.src)
              const buffer = await response.arrayBuffer()
              const base64 = Buffer.from(buffer).toString('base64')
              const mimeType = response.headers.get('content-type')
              if (mimeType.includes('svg')) {
                console.log(mimeType)
                img.remove()
                continue
              }
              const dataURI = `data:${mimeType}; base64,${base64}`
              const imageUrl = new URL(img.src)
              images[imageUrl.pathname.replace(/^\//, '')] = dataURI
            } catch (e) {
              console.error(e)
            }
          }
          dom.window.document.querySelectorAll('style').forEach(style => {
              style.remove()
          })
          const data = dom.serialize()

          const content = htmlToPdfmake(data, {
              window: dom.window
          })
          const docDefinition = {
              content,
              images
          }
          const pdfDocGenerator = pdfMake.createPdf(docDefinition)
          pdfDocGenerator.getBuffer(async (data) => {
              const bufferArray = new Uint8Array(data)
              const pdfData = Buffer.from(bufferArray)
              const payload = {
                  files: [{
                      file: pdfData,
                      name: 'test.pdf',
                      description: `Test PDF file.`
                  }]
              }
              await resp.reply(payload)
          })
        } catch (e) {
          await fs.appendFile('error.log', `${e}\n`)
          await resp.reply(`You're trying to create a PDF from an invalid URL`)
        }
    })
}