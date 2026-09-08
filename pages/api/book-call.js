import { appendFile, mkdir } from 'node:fs/promises'

const DATA_FOLDER = '.data'
const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token'
const SA_CA_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'
const SA_NAMESPACE_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/namespace'
const K8S_API = 'https://kubernetes.default.svc'

// Creates a DiscoveryCallRequest CRD resource so anything watching for them
// (the joey-agent bot, specifically) can pick it up and notify devchitchat.
// This process only ever needs create access on discoverycallrequests in its
// own namespace — it never touches a devchitchat credential directly. Same
// design as fieldmappings.com's contact form: the website does not hold the
// credential.
// Best-effort: a failure here must never affect the response the person
// booking the call sees.
async function publishDiscoveryCallRequest(fields) {
    try {
        const [token, ca, namespace] = await Promise.all([
            Bun.file(SA_TOKEN_PATH).text(),
            Bun.file(SA_CA_PATH).text(),
            Bun.file(SA_NAMESPACE_PATH).text(),
        ])
        const ns = namespace.trim()

        const submission = {
            apiVersion: 'joeyguerra.com/v1',
            kind: 'DiscoveryCallRequest',
            metadata: { generateName: 'discovery-call-', namespace: ns },
            spec: fields,
        }

        const res = await fetch(`${K8S_API}/apis/joeyguerra.com/v1/namespaces/${ns}/discoverycallrequests`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
            tls: { ca },
        })

        if (!res.ok) {
            console.error('publishDiscoveryCallRequest: k8s API returned', res.status, await res.text())
        } else {
            console.info('publishDiscoveryCallRequest: success')
        }
    } catch (e) {
        console.error('publishDiscoveryCallRequest failed:', e)
    }
}

// The response loads into an iframe with no src of its own, so it gets a
// blank default document — none of the parent page's styles apply unless we
// inline them here. Colors match the homepage's own dark theme (it doesn't
// use /css/base.css — it's a self-contained inline <style> block).
function renderIframeResponse(bodyHtml, color = '#ffffff') {
    return `<!doctype html>
<html>
<head></head>
<body style="margin:0; padding:0.75rem 0; background:#0f1115; color:${color}; font-family:system-ui,sans-serif;">
${bodyHtml}
</body>
</html>`
}

function isValidDate(s) {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function isValidTime(s) {
    return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
}

export async function POST(req) {
    await mkdir(DATA_FOLDER, { recursive: true })

    const contentType = req.headers.get('Content-Type') ?? ''
    let body = {}
    if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await req.text()
        body = Object.fromEntries(new URLSearchParams(text))
    }

    try {
        await appendFile(`${DATA_FOLDER}/visits.ndjson`,
            JSON.stringify({ timestamp: new Date(), ip: req.headers.get('x-forwarded-for') ?? 'unknown', url: req.url }) + '\n')
    } catch (e) {
        console.error('Failed to log visit:', e)
    }

    const { name, email, company, preferredDate, preferredTime, timezone, notes, website } = body

    if (!name || !email || !preferredDate || !preferredTime || !timezone) {
        return new Response(renderIframeResponse('<p>Name, email, and a preferred date/time are required. Please try again.</p>', '#ff8080'), {
            status: 400,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    if (!isValidDate(preferredDate) || !isValidTime(preferredTime)) {
        return new Response(renderIframeResponse('<p>That date or time didn\'t look right. Please try again.</p>', '#ff8080'), {
            status: 400,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    if ((notes ?? '').length > 2000) {
        return new Response(renderIframeResponse('<p>Notes are too long. Please try again.</p>', '#ff8080'), {
            status: 400,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    const thanks = renderIframeResponse('<h2 style="margin:0 0 0.25rem;">Got it.</h2><p style="margin:0;">I\'ll confirm your discovery call by email shortly.</p>')

    // Honeypot check
    if (website && website.length > 0) {
        return new Response(thanks, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    try {
        await appendFile(`${DATA_FOLDER}/site-messages.md`, `
# [${name}](mailto:${email})

    ${new Date().toISOString()} — requested ${preferredDate} ${preferredTime} (${timezone})

${company ? `Company: ${company}\n` : ''}${notes ?? ''}

`)
    } catch (e) {
        console.error('Failed to save message:', e)
    }

    // Best-effort — never let this affect the response the person booking
    // the call actually sees.
    publishDiscoveryCallRequest({ name, email, company, preferredDate, preferredTime, timezone, notes })

    return new Response(thanks, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
