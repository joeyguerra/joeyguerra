// Description:
// Responds with all the script help commands.
//
// Dependencies:
//
// Configuration:
//
// Commands:
// hubot ico - Convert PNG to ICO. #ico
//
// Notes:
//
// Author:
//   Joey Guerra

import {createIco} from '../../lib/PngToIco.mjs'

export default robot => {
    robot.respond(/ico/i, async resp => {
        const replies = []
        const images = []
        const names = []
        for (const [key, attachment] of resp.message.user.message.attachments){
            const name = attachment.url.split('/').reduce((prev, current)=> current)
            names.push(name.replace(/\.(.*)$/, '.ico'))
            const response = await fetch(attachment.url)
            if(!response.ok) {
                replies.push(`Failed to fetch ${attachment.url}`)
            } else {
                images.push(Buffer.from(await (await response.blob()).arrayBuffer()))
            }
        }
        // Note: ICO can take > 1 image to produce an .ico file
        const icos = await createIco(images)
        const name = names.pop()
        const payload = {
            files: [{
                file: icos,
                name: name,
                description: `${name} as an ICO file.`
            }]
        }
        return await resp.reply(payload)
    })
}