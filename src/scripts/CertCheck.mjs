// Description:
// Check SSL certs for domain.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//  hubot cert check <domain> - Check the cert for the specified domain.
//
// Notes:
//
// Author:
//   Joey Guerra

import https from 'node:https'

function isStillValid (validFrom, validTo) {
    const today = new Date()
    return today > validFrom && today < validTo
}

async function makeRequest(domain) {
    const options = {
        hostname: domain,
        port: 443,
        path: '/',
        method: 'GET'
    }
    return new Promise((resolve, reject)=>{
        const req = https.request(options, res => {
            const cert = res.socket.getPeerCertificate()
            const cipher = res.socket.getCipher()
            console.log('cipher', cipher)
            const { valid_from, valid_to } = cert
            const validFrom = new Date(valid_from)
            const validTo = new Date(valid_to)
            const today = new Date()
            const validFromStr = validFrom.toDateString()
            const validToStr = validTo.toDateString()
            const todayStr = today.toDateString()
            const valid = isStillValid(validFrom, validTo)
            const validStr = valid ? 'valid' : 'invalid'
            const msg = `Valid from: ${validFromStr}\nValid to: ${validToStr}\nToday: ${todayStr}\nCert is ${validStr}`
            return resolve(msg)
        })
        req.on('error', error => {
            return reject(`error: ${error}`)
        })
        req.end()
    })
}

export default robot => {
    robot.commands.push(`hubot cert check hubot.gokaizen.io - Check the cert for the specified domain. #cert`)
    robot.respond(/cert check (?<domain>.*)/i, async resp => {
        const {domain} = resp.match.groups
        if(!domain) {
            console.error(domain)
            return await resp.reply(`Please provide a domain name. ${domain} is not a valid domain name.`)
        }
        try{
            let message = await makeRequest(domain)
            await resp.reply(message)
        }catch(e){
            await resp.reply(`error: ${e}`)
            console.error(e)
        }
    })
}
