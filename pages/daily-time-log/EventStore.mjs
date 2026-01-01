import fs from 'fs'
import path from 'path'

const ensureFile = filePath => {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '')
}

export const makeEventStore = ({ baseDir, file = 'data/event-log.ndjson' }) => {
  const filePath = path.join(baseDir, file)
  ensureFile(filePath)

  const append = async event => {
    const enriched = { ...event, ts: new Date().toISOString() }
    await fs.promises.appendFile(filePath, JSON.stringify(enriched) + '\n', 'utf8')
    return enriched
  }

  const readAll = async () => {
    const content = await fs.promises.readFile(filePath, 'utf8')
    return content
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
  }

  const project = async (reducers = {}) => {
    const events = await readAll()
    const state = {}
    for (const e of events) {
      const reduce = reducers[e.type]
      if (reduce) reduce(state, e)
    }
    return state
  }

  return { append, readAll, project, filePath }
}
