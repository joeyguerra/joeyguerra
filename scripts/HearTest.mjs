export default async robot => {
    robot.hear(/hello/i, async msg => {
        await msg.send('Hello there! How can I assist you today?')
    })
}