#!/usr/bin/env bun
import { createServer } from '@devchitchat/index97'

await createServer({
    pagesDir: new URL('./pages', import.meta.url).pathname,
    port: Number(process.env.PORT) || 3000,
    dev: process.env.NODE_ENV !== 'production',
    // Allow inline styles and scripts since layouts use them
    csp: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://analytics.joeyguerra.com https://static.cloudflareinsights.com; img-src 'self' data: https://analytics.joeyguerra.com; font-src 'self'; connect-src 'self' wss: ws: https://analytics.joeyguerra.com https://cloudflareinsights.com;",
    onShutdown: (server) => {
        console.log('Shutting down server...')
        server.stop()
        process.exit(0)
    }
})
