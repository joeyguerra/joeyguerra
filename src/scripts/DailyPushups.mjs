// Description:
//  Record your daily pushups.
//
// Dependencies:
//
// Commands:
//  hubot pushups <number> - Record your daily pushups
//  hubot pushups - Get the total pushups for the day.
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '../../')


export default async robot => {
    robot.respond(/pushups (?<count>\d+)/i, async res => {
        let { count } = res.match.groups
        let date = new Date().toDateString()
        let key = `pushups-${date}`
        let current = await robot.brain.get(key) || 0
        let total = current + parseInt(count)
        await robot.brain.set(key, total)
        await res.reply(`Pushups for ${date}: ${total}`)
    })

}