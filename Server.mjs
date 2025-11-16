#!/usr/bin/env node
import { JuphjacWebServer } from 'juphjacs'


function createDatabase () {
    return {
        addEvent(eventType, data) {
            console.log(`Database event logged: ${eventType}`, data)
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
    context: {
        db,
        cache,
        config: myAppConfig,
    }
})

await server.initialize()
await server.start(process.env.PORT || 3000)

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

