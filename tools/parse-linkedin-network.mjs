import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'

const inputPath = resolve('pages/linkedin-network.html')
const outputPath = resolve('data/linkedin-network.json')

const html = await readFile(inputPath, 'utf8')
const dom = new JSDOM(html)
const { document } = dom.window

const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim()

const profileAnchors = Array.from(document.querySelectorAll('a[href*="linkedin.com/in/"]'))

const totalConnectionsText = Array.from(document.querySelectorAll('p'))
  .map((p) => normalizeText(p.textContent))
  .find((text) => /connections$/i.test(text))

const reportedTotal = totalConnectionsText
  ? Number.parseInt(totalConnectionsText.replace(/[^0-9]/g, ''), 10)
  : null

const findConnectedOnElement = (root) => {
  if (!root) return null
  const paragraphs = Array.from(root.querySelectorAll('p'))
  return paragraphs.find((p) => normalizeText(p.textContent).startsWith('Connected on ')) || null
}

const findItemRoot = (anchor) => {
  let node = anchor
  for (let i = 0; i < 12 && node; i += 1) {
    const connectedEl = findConnectedOnElement(node)
    if (connectedEl) return node
    node = node.parentElement
  }
  return anchor.parentElement
}

const extractHeadline = (nameAnchor) => {
  const nameP = nameAnchor.closest('p')
  if (!nameP) return ''
  const nameContainer = nameP.parentElement
  if (!nameContainer) return ''

  const possible = Array.from(nameContainer.querySelectorAll('p'))
    .map((p) => normalizeText(p.textContent))
    .filter((text) => text && text !== normalizeText(nameAnchor.textContent))
    .filter((text) => !text.startsWith('Connected on '))

  return possible[0] || ''
}

const parseConnectedOn = (text) => {
  const normalized = normalizeText(text)
  if (!normalized.startsWith('Connected on ')) return { connectedOn: '', connectedOnDate: '' }
  const connectedOn = normalized.replace('Connected on ', '')
  const parsed = Date.parse(connectedOn)
  const connectedOnDate = Number.isNaN(parsed) ? '' : new Date(parsed).toISOString().slice(0, 10)
  return { connectedOn, connectedOnDate }
}

const byProfileUrl = new Map()

for (const anchor of profileAnchors) {
  const profileUrl = anchor.href
  const name = normalizeText(anchor.textContent)
  if (!profileUrl || !name) continue

  const root = findItemRoot(anchor)
  const headline = extractHeadline(anchor)
  const connectedEl = findConnectedOnElement(root)
  const { connectedOn, connectedOnDate } = connectedEl
    ? parseConnectedOn(connectedEl.textContent)
    : { connectedOn: '', connectedOnDate: '' }

  const imageEl = root ? root.querySelector('img[alt*="profile picture"], img') : null
  const imageUrl = imageEl?.getAttribute('src') || ''
  const imageAlt = imageEl?.getAttribute('alt') || ''

  const messageLink = root ? root.querySelector('a[aria-label="Message"]') : null
  const messageHref = messageLink?.getAttribute('href') || ''
  const messageUrl = messageHref.startsWith('http')
    ? messageHref
    : messageHref
      ? `https://www.linkedin.com${messageHref}`
      : ''

  if (!byProfileUrl.has(profileUrl)) {
    byProfileUrl.set(profileUrl, {
      name,
      headline,
      profileUrl,
      connectedOn,
      connectedOnDate,
      profileImageUrl: imageUrl,
      profileImageAlt: imageAlt,
      messageUrl
    })
    continue
  }

  const existing = byProfileUrl.get(profileUrl)
  if (!existing.headline && headline) existing.headline = headline
  if (!existing.connectedOn && connectedOn) existing.connectedOn = connectedOn
  if (!existing.connectedOnDate && connectedOnDate) existing.connectedOnDate = connectedOnDate
  if (!existing.profileImageUrl && imageUrl) existing.profileImageUrl = imageUrl
  if (!existing.profileImageAlt && imageAlt) existing.profileImageAlt = imageAlt
  if (!existing.messageUrl && messageUrl) existing.messageUrl = messageUrl
}

const connections = Array.from(byProfileUrl.values())

const output = {
  source: {
    inputPath: 'pages/linkedin-network.html',
    parsedAt: new Date().toISOString(),
    reportedTotal
  },
  total: connections.length,
  connections
}

await writeFile(outputPath, JSON.stringify(output, null, 2))

console.log(`Wrote ${connections.length} connections to ${outputPath}`)