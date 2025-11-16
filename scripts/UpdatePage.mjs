// Description:
//   Test updating the site from Hubot.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot update page <page-name> - Update the specified page
//
// Notes:
//   Make this good
//
// Author:
//   Joey Guerra

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export default async robot => {
    robot.respond(/update page (.+)/, async (msg) => {
        const pageName = msg.match[1]
        let html = await readFile(path.join(process.cwd(), 'pages', `guide-software-success/guide.html`), 'utf-8')

        html = html.replace(/<p>Last updated: .*?<\/p>/, `<p>Last updated: ${new Date().toISOString()}</p>`)
        try {
            await writeFile(path.join(process.cwd(), 'pages', `guide-software-success/guide.html`), html)
            msg.reply(`Page ${pageName} updated successfully`)
        } catch (error) {
            robot.logger.error(`Error updating page ${pageName}:`, error)
            msg.reply(`Error updating page ${pageName}`)
        }
    })
}