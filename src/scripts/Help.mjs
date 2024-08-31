// Description:
// Responds with all the script help commands.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot help - list loaded scripts commands.
//
// Notes:
//
// Author:
//   Joey Guerra

export default robot => {
    robot.respond(/help\s?(?<command>.*)/i, async res => {
      let commands = robot.helpCommands()
      const command = res.match.groups?.command.toLowerCase().trim()
      if(command){
        commands = commands.filter(c => c.includes(`hubot ${command}`))
      }
      let output = commands.map(t => t.replace(new RegExp('hubot', 'gi'), `**${robot.name}**`)).map(t=>`- ${t}`).join('\n')
      if(output.length == 0) output = `No help found for ${command}`
      await res.send(output)
    })
  }