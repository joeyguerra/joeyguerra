// Description:
//   Start a juphjacs web server.
//
// Author:
//   Joey Guerra

import { JuphjacWebServer } from 'juphjacs'

const CHANNEL_ID = '1239325514133667931'
const eventNames = {
    'yesterday-today-feedback': 'New Yesterday/Today Feedback',
    'guide-software-success-signup': 'New Guide Signup'
}
export default async robot => {
    robot.eventNames = eventNames
    function createDatabase () {
        return {
            addEvent(eventType, data) {
                console.debug(`Database event logged: ${eventType}`, data)
                try {
                robot.messageRoom(CHANNEL_ID, `# ${robot.eventNames[eventType]}:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\``)
                } catch (error) {
                    robot.logger.error(`Failed to send message to chat room: ${error.message}`)
                }
            }
        }
    }

    class CacheService {
        constructor() {
            this.store = new Map()
        }
        get(key) {
            return this.store.get(key)
        }
        set(key, value) {
            this.store.set(key, value)
        }
    }

    // Initialize your services
    const db = await createDatabase()
    const cache = new CacheService()

    const myAppConfig = {
        appName: 'Joey Guerra Website',
        enableFeatureX: true,
        apiBaseUrl: 'https://joeyguerra.com'
    }

    const server = new JuphjacWebServer({
        rootDir: process.cwd(),
        logLevel: process.env.LOG_LEVEL || 'info',
        logger: robot.logger,
        context: {
            db,
            cache,
            config: myAppConfig,
            robot
        }
    })

    await server.initialize()
    await server.start(process.env.PORT || 3000)
    robot.server = server.httpServer

    process.on('SIGINT', async () => {
        console.log('Shutting down server...')
        await server.stop()
        process.exit(0)
    })
    process.on('SIGTERM', async () => {
        console.log('Shutting down server...')
        await server.stop()
        process.exit(0)
    })


}