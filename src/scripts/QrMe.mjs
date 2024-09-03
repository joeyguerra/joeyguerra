// Description:
//
// Dependencies:
//
// Configuration:
//
// Commands:
// hubot qrme <link> - create a QR code with the provided link as a PNG image. #qr
// Notes:
//
// Author:
//   Joey Guerra

import QRCode from '../../lib/QRCode/qrcode.js'
import Utf8Renderer from '../../lib/QRRenderers/Utf8Render.mjs'

export const makeQrCodeWith = async link => {
    let {createCanvas} = await import('canvas')
    const fontSize = 19
    let code = Utf8Renderer.render(QRCode.create(link))
    let codeLines = code.split('\n')//.map(t => t.trim()).filter(t => t.length > 0)
    const width = 532//codeLines[0].length*fontSize
    console.log(codeLines[0].length, width, codeLines.length*fontSize)
    const canvas = createCanvas(width, width)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px Monospace`
    const x = Math.floor(canvas.width/2 - width/3)
    const y = Math.floor(canvas.height/2 - width/2)
    ctx.fillStyle = 'black'
    codeLines.forEach((line, i)=> {
        ctx.fillText(line, x, i*fontSize + y)
    })

    const data = canvas.toBuffer('image/png')
    return data
}

const toHtml = (code, link) => `<!DOCTYPE html><head><style>pre{line-height: 1em;}</style></head><html><body><pre>${code}</pre><a href="${link}">Start</a></body></html>`
export default robot => {
    robot.router.get('/qrme/:link', async (req, res) => {
        const {link} = req.params
        const code = Utf8Renderer.render(QRCode.create(link))
        await res.send(toHtml(code, link))
    })

    robot.respond(/qrme (?<link>.*)/i, async res => {
        const {link} = res.match.groups
        const image = await makeQrCodeWith(link)
        const name = 'qr-code.png'
        const payload = {
            files: [{
                file: image,
                name: name,
                description: `${name} QR Code as PNG file.`
            }]
        }
        await res.reply(payload)
    })
    // robot.respond(/qr me (?<link>.*)/i, async res => {
    //     const {link} = res.match.groups
    //     let code = Utf8Renderer.render(QRCode.create(link)).split('\n').map(l => l.trim())
    //     console.log(code)
    //     await res.reply(code.join('\n'))
    // })


}