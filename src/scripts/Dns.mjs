// Description:
// Responds with all the script help commands.
//
// Dependencies:
//
// Configuration:
//
// Commands:
// hubot dns <host name> - Get DNS entries for the specified host name. #dns
//
// Notes:
//
// Author:
//   Joey Guerra

import {getHostEntries} from '../../lib/DnsRecord.mjs'

export default robot => {
    robot.respond(/dns (?<hostName>.*)/i, async resp => {
        const {hostName} = resp.match.groups
        if(hostName){
            let results = (await getHostEntries(hostName)).filter(r => !r.err).reduce((acc, current) => {
                acc += current.addresses.reduce((a, b) => a += `* ${b}\n`, '')
                return acc
            }, `DNS RECORDS FOR **${hostName}**\n`)
            return await resp.reply(results)
        }
        return
    })
}