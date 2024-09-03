// Description:
// Http status cat.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot cat <code> - Get a cat image for the specified http status code. #http #status #cat
//
// Notes:
//
// Author:
//   Joey Guerra

export default robot => {
    robot.respond(/cat (?<code>\d+)/i, async res => {
        const {code} = res.match.groups
        await res.reply(`https://http.cat/${code}`)
    })
}
