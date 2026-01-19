import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_DB_FILE = path.join(process.cwd(), 'data', 'nato-fracture.db')

class NatoFractureDB {
  constructor(dbPath = process.env.DB_PATH || DEFAULT_DB_FILE, logger = console) {
    this.logger = logger
    this.dbPath = dbPath
    const dir = path.dirname(this.dbPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    this.db = new DatabaseSync(this.dbPath, { enableForeignKeyConstraints: true })
    this.init()
  }

  init() {
    this.db.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS weekly_snapshots (
        id INTEGER PRIMARY KEY,
        week_ending TEXT UNIQUE,
        created_at TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS pillar_scores (
        id INTEGER PRIMARY KEY,
        snapshot_id INTEGER,
        pillar_key TEXT,
        heat INTEGER,
        weight INTEGER,
        evidence_json TEXT,
        FOREIGN KEY(snapshot_id) REFERENCES weekly_snapshots(id) ON DELETE CASCADE
      );
    `)
  }

  seedIfEmpty() {
    try {
      const count = this.db.prepare('SELECT COUNT(1) AS c FROM weekly_snapshots').get().c
      if (count > 0) return
      if (String(process.env.SEED_NATO_DASHBOARD || '0') !== '1') return
      const now = new Date()
      const isoDate = d => new Date(d).toISOString().slice(0, 10)
      const weeks = [
        { week_ending: isoDate(now), notes: 'Initial reading of signals across pillars.' },
        { week_ending: isoDate(new Date(now.getTime() - 7 * 86400000)), notes: 'Previous week baseline.' }
      ]
      const defaultWeights = {
        elite_language: 25,
        defense_posture: 25,
        markets: 20,
        public_opinion: 15,
        media_attention: 15
      }
      const exampleHeats = [
        { elite_language: 2, defense_posture: 3, markets: 2, public_opinion: 1, media_attention: 2 },
        { elite_language: 1, defense_posture: 2, markets: 2, public_opinion: 1, media_attention: 1 }
      ]
      weeks.forEach((w, i) => {
        const heats = exampleHeats[i]
        this.upsertSnapshot(w.week_ending, w.notes, Object.keys(defaultWeights).map(k => ({
          pillar_key: k,
          heat: heats[k],
          weight: defaultWeights[k],
          evidence_json: '[]'
        })))
      })
      this.logger.info('Seeded NatoFractureDB with sample data')
    } catch (e) {
      this.logger.error('Failed to seed NatoFractureDB', e)
    }
  }

  upsertSnapshot(week_ending, notes, pillars = []) {
    if (!week_ending) throw new Error('week_ending required')
    const isoWeek = new Date(week_ending).toISOString().slice(0, 10)
    const created_at = new Date().toISOString()
    const insertSnap = this.db.prepare('INSERT INTO weekly_snapshots (week_ending, created_at, notes) VALUES (?, ?, ?) ON CONFLICT(week_ending) DO UPDATE SET notes=excluded.notes')
    insertSnap.run(isoWeek, created_at, notes || '')
    const snap = this.db.prepare('SELECT * FROM weekly_snapshots WHERE week_ending = ?').get(isoWeek)
    const deletePillars = this.db.prepare('DELETE FROM pillar_scores WHERE snapshot_id = ?')
    deletePillars.run(snap.id)
    const insertPillar = this.db.prepare('INSERT INTO pillar_scores (snapshot_id, pillar_key, heat, weight, evidence_json) VALUES (?, ?, ?, ?, ?)')
    pillars.forEach(p => {
      const heat = Math.max(0, Math.min(5, Number(p.heat || 0)))
      const weight = Number(p.weight || 0)
      const evidence = typeof p.evidence_json === 'string' ? p.evidence_json : JSON.stringify(p.evidence_json || [])
      insertPillar.run(snap.id, String(p.pillar_key), heat, weight, evidence)
    })
    return snap
  }

  getSnapshotByWeek(week_ending) {
    const isoWeek = new Date(week_ending).toISOString().slice(0, 10)
    const snap = this.db.prepare('SELECT * FROM weekly_snapshots WHERE week_ending = ?').get(isoWeek)
    if (!snap) return null
    const pillars = this.db.prepare('SELECT * FROM pillar_scores WHERE snapshot_id = ? ORDER BY pillar_key').all(snap.id)
    return { ...snap, pillars }
  }

  getLatestSnapshot() {
    const snap = this.db.prepare('SELECT * FROM weekly_snapshots ORDER BY week_ending DESC LIMIT 1').get()
    if (!snap) return null
    const pillars = this.db.prepare('SELECT * FROM pillar_scores WHERE snapshot_id = ? ORDER BY pillar_key').all(snap.id)
    return { ...snap, pillars }
  }

  getHistory(limit = 12) {
    const snaps = this.db.prepare('SELECT * FROM weekly_snapshots ORDER BY week_ending DESC LIMIT ?').all(limit)
    return snaps.map(s => {
      const pillars = this.db.prepare('SELECT pillar_key, heat, weight FROM pillar_scores WHERE snapshot_id = ?').all(s.id)
      return { ...s, pillars }
    })
  }

  computeScore(pillars = []) {
    return Math.round(pillars.reduce((acc, p) => acc + ((Number(p.heat || 0) / 5) * Number(p.weight || 0)), 0))
  }

  bandFor(score) {
    if (score >= 70) return 'Crisis'
    if (score >= 50) return 'Alliance credibility event forming'
    if (score >= 25) return 'Elevated'
    return 'Normal'
  }
}

export default NatoFractureDB
