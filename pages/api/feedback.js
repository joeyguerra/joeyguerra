export async function GET(req) {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST(req) {
    try {
        const body = await req.json()
        const { type, message, url, timestamp, name, email } = body

        if (!message || !type) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const eventData = {
            type,
            message,
            url,
            timestamp: new Date().toISOString()
        }

        if (name) eventData.name = name
        if (email) eventData.email = email

        // Log the event — Hubot picks this up via its own listener
        console.log('yesterday-today-feedback', JSON.stringify(eventData))

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Feedback API error:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
