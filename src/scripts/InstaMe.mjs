// Description:
// Segment a photo into a grid of smaller photos.
//
// Dependencies:
//
// Commands:
//   hubot insta me - Segment an uploaded photo into a grid of smaller photos. NOTE: Make sure to upload the photo.
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

import { segmentFromBufferToStreams } from '../../lib/ImageSegmenter.mjs'

export default robot => {
    robot.respond(/insta me/i, async resp => {
        const replies = []
        const images = []
        for (const [key, attachment] of resp.message.user.message.attachments){
            const response = await fetch(attachment.url)
            if(!response.ok) {
                replies.push(`Failed to fetch ${attachment.url}`)
            } else {
                images.push(Buffer.from(await (await response.blob()).arrayBuffer()))
            }
        }
        if(replies.length > 0) {
            console.error('Failed to fetch images', replies.join('\n'))
            return await resp.reply(replies.join('\n'))
        }
        const files = []
        for await (const image of images) {
            const slots = await segmentFromBufferToStreams(image, {
                tileWidth: 309,
                columns: 3,
                rows: 4
            })
            for await (const slot of slots) {
                const { format, size, width, height } = slot.bitmap
                files.push({
                    file: await slot.getBuffer('image/png'),
                    name: `slot-${slots.indexOf(slot)+1}.png`,
                    description: `slot-${slots.indexOf(slot)+1}`
                })
            }
        }
        files.reverse()
        if(files.length <= 10) {
            return await resp.reply({files: files})
        }
        while(files.length > 0) {
            const batch = files.splice(-files.length, 9)
            await resp.reply({files: batch})
        }
    })

}