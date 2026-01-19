import { writeFile } from 'fs/promises'

export default async robot => {
    robot.respond(/get gov feed/i, async msg => {
        const response = await fetch('https://www.state.gov/feed/?topic=defense')
        console.debug(response)
        if (!response.ok) {
            msg.reply(`Error fetching feed: ${response.status} ${response.statusText}`)
            return
        }
        const text = await response.text()
        msg.reply(`Fetched feed content:\n${text.slice(0, 500)}...`)
    })
}