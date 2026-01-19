import { Page } from 'juphjacs'
import NatoFractureDB from '../../lib/NatoFractureDB.mjs'
import { NatoWeeklyWorker } from '../../lib/NatoWeeklyWorker.mjs'

function parseUrlEncoded(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8')
        const params = {}
        raw.split('&').forEach(pair => {
          if (!pair) return
          const [k, v] = pair.split('=')
          const key = decodeURIComponent(k.replace(/\+/g, ' '))
          const val = decodeURIComponent((v || '').replace(/\+/g, ' '))
          params[key] = val
        })
        resolve(params)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

const DEFAULT_WEIGHTS = {
  elite_language: 25,
  defense_posture: 25,
  markets: 20,
  public_opinion: 15,
  media_attention: 15
}

class NatoFractureDashboardPage extends Page {
  constructor(rootFolder, filePath, template, context) {
    super(rootFolder, filePath, template, context)
    this.layout = './pages/layouts/app.html'
    this.title = 'NATO Fracture Dashboard'
    this.canonical = 'https://joeyguerra.com/dashboards/nato-fracture.html'
    this.uri = '/dashboards/nato-fracture.html'
    this.route = new RegExp('^/dashboards/nato-fracture(?:\.html)?/?$')
    this.db = context?.natoFractureDB || new NatoFractureDB(process.env.DB_PATH, this.context?.logger || console)
    this.current = null
    this.history = []
    this.details = null
    this.currentScore = 0
    this.currentBand = 'Normal'
  }

  ensureDbSeeded() {
    try { this.db.seedIfEmpty() } catch {}
  }

  async get(req, res) {
    this.ensureDbSeeded()
    const url = new URL(req.url, 'http://localhost')
    const week = url.searchParams.get('week')
    const snap = week ? this.db.getSnapshotByWeek(week) : this.db.getLatestSnapshot()
    
    if (snap) {
      snap.pillars = snap.pillars.map(p => {
        const contribution = (p.heat / 5) * p.weight
        const evidence = p.evidence_json ? JSON.parse(p.evidence_json) : []
        const evidenceCount = evidence.length
        const evidenceList = evidence
        return { ...p, contribution, evidence, evidenceCount, evidenceList }
      })
    }
    
    this.current = snap
    this.currentScore = snap ? this.db.computeScore(snap.pillars) : 0
    this.currentBand = this.db.bandFor(this.currentScore)
    this.details = week && snap ? snap : null
    this.history = this.db.getHistory(12).map(s => {
      const score = this.db.computeScore(s.pillars)
      const band = this.db.bandFor(score)
      const notesSnippet = String(s.notes || '').replace(/[\r\n]+/g, ' ').slice(0, 80)
      return { ...s, score, band, notesSnippet }
    })
    await this.render()
    res.setHeader('Content-Type', 'text/html')
    await res.end(this.content)
  }

  async post(req, res) {
    const url = new URL(req.url, 'http://localhost')
    const action = url.searchParams.get('action')
    
    if (action === 'refresh') {
      return this.refreshData(req, res)
    }

    try {
      const contentType = (req.headers['content-type'] || '').toLowerCase()
      let data
      if (contentType.includes('application/json')) {
        data = await req.json()
      } else {
        data = await parseUrlEncoded(req)
      }

      const week_ending = data.week_ending
      const notes = String(data.notes || '')
      const pillars = Object.keys(DEFAULT_WEIGHTS).map(key => {
        const heat = Number(data[`heat_${key}`] ?? data[key]?.heat ?? 0)
        const weight = Number(data[`weight_${key}`] ?? data[key]?.weight ?? DEFAULT_WEIGHTS[key])
        const ev = data[`evidence_${key}`] ?? ''
        const evidence_json = Array.isArray(ev)
          ? JSON.stringify(ev)
          : JSON.stringify(String(ev).split('\n').map(s => s.trim()).filter(Boolean))
        return { pillar_key: key, heat, weight, evidence_json }
      })

      // validate heats
      for (const p of pillars) {
        if (Number.isNaN(p.heat) || p.heat < 0 || p.heat > 5) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          await res.end('Invalid heat values')
          return
        }
      }
      this.db.upsertSnapshot(week_ending, notes, pillars)
      res.statusCode = 302
      res.setHeader('Location', '/dashboards/nato-fracture.html')
      res.end()
    } catch (e) {
      this.context?.logger?.error?.('NATO dashboard POST error', e)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      await res.end('Internal Server Error')
    }
  }

  async refreshData(req, res) {
    try {
      const worker = new NatoWeeklyWorker(this.db, this.context?.logger || console)
      const result = await worker.run()
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      await res.end(JSON.stringify(result))
    } catch (e) {
      this.context?.logger?.error?.('NATO refresh error', e)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      await res.end(JSON.stringify({ success: false, error: e.message }))
    }
  }
}

export default async (rootFolder, filePath, template, context) => {
  return new NatoFractureDashboardPage(rootFolder, filePath, template, context)
}
