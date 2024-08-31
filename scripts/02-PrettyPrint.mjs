// Description:
//   Pretty print log messages.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot no command
//
// Notes:
//   Make this good
//
// Author:
//   Joey Guerra

import pino from 'pino'
export default async robot => {
    if(process.env.NODE_ENV === 'production') {
        return
    }
    
    robot.logger = pino({
        name: robot.name,
        transport: {
            target: 'pino-pretty'
        },
        level: robot.config.HUBOT_LOG_LEVEL || 'info'
    })
}