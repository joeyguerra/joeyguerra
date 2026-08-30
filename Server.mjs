#!/usr/bin/env bun
import { createServer } from '@devchitchat/index97'

const analyticsUrl = process.env.ANALYTICS_URL ?? 'https://analytics.joeyguerra.com'

await createServer({
    pagesDir: new URL('./pages', import.meta.url).pathname,
    port: Number(process.env.PORT) || 3000,
    dev: process.env.NODE_ENV !== 'production',
    // Allow inline styles and scripts since layouts use them
    csp: `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' ${analyticsUrl} https://static.cloudflareinsights.com; img-src 'self' data: ${analyticsUrl}; font-src 'self'; connect-src 'self' wss: ws: ${analyticsUrl} https://cloudflareinsights.com;`,
    onShutdown: (server) => {
        console.log('Shutting down server...')
        server.stop()
        process.exit(0)
    }
})
