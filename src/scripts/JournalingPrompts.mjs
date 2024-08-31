// Description:
// Periodically sends journaling prompts.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra


let output = `#Journaling prompts
1. Why am I pursuing this specific goal?
1. What are three moments I'm grateful for?
1. What am I attached to that isn't serving me?
1. What is future me up to?`

function convertCurrentDateToCst (date) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Chicago'}))
}
function getNext930(date) {
    let nextDate = new Date(date)
    nextDate.setHours(21, 30, 0, 0)
    if (date > nextDate) {
        nextDate.setDate(nextDate.getDate() + 1)
    }
    return nextDate
}
function convertToHoursAndMins (diff) {
    let hours = Math.floor(diff / 1000 / 60 / 60)
    let minutes = Math.floor(diff / 1000 / 60 % 60)
    return `${hours} hours and ${minutes} minutes`
}
const GENERAL_CHANNEL = '962136636647440396'
export default async robot => {
    let now = new Date()
    let cstNow = convertCurrentDateToCst(now)
    let nextTime = getNext930(cstNow)
    let diff = nextTime - cstNow
    setTimeout(async () => {
        await robot.messageRoom(GENERAL_CHANNEL, output)
        setInterval(async () => {
            await robot.messageRoom(GENERAL_CHANNEL, output)
        }, 1000 * 60 * 60 * 24)
    }, diff)
    robot.respond(/(journaling|j) when/is, async res => {
        let now = new Date()
        let cstNow = convertCurrentDateToCst(now)
        let nextTime = getNext930(cstNow)
        let diff = nextTime - cstNow    
        await res.reply(`The next journaling prompt will be sent at ${nextTime.toLocaleString('en-US', { timeZone: 'America/Chicago'})} CST. That's in ${convertToHoursAndMins(diff)}.`)
    })
}