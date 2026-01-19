import { RssCollector, DefensePosureCollector, MarketsCollector, PollCollector, GdeltCollector } from './NatoDataCollectors.mjs'
import { NatoHeatAssigner } from './NatoHeatAssigner.mjs'

export class NatoWeeklyWorker {
  constructor(natoFractureDB, logger = console) {
    this.db = natoFractureDB
    this.logger = logger
  }

  async run() {
    this.logger.info('NATO weekly worker: starting data collection...')
    try {
      const rss = new RssCollector(this.logger)
      const defense = new DefensePosureCollector(this.logger)
      const markets = new MarketsCollector(this.logger)
      const polls = new PollCollector(this.logger)
      const gdelt = new GdeltCollector(this.logger)
      const assigner = new NatoHeatAssigner(this.logger)

      const eliteLanguage = await rss.collectEliteLanguage()
      this.logger.info('Elite language collected:', eliteLanguage)

      const defensePosture = await defense.collectDefensePosture()
      this.logger.info('Defense posture collected:', defensePosture)

      const mkts = await markets.collectMarkets()
      this.logger.info('Markets collected:', mkts)

      const pollData = await polls.collectPolls()
      this.logger.info('Polls collected:', pollData)

      const media = await gdelt.collectMediaNarrative()
      this.logger.info('Media narrative collected:', media)

      const allStats = {
        elite_language: eliteLanguage,
        defense_posture: defensePosture,
        markets: mkts,
        public_opinion: pollData,
        media_attention: media
      }

      const heats = assigner.assignHeats(allStats)
      this.logger.info('Heat assignments:', heats)

      const weekEnding = new Date().toISOString().slice(0, 10)
      const memo = [
        `Elite language: ${heats.elite_language}/5 (${eliteLanguage.article5} Article 5, ${eliteLanguage.contingency} contingency)`,
        `Defense posture: ${heats.defense_posture}/5 (${defensePosture.posture_relevant} announcements, ${defensePosture.europe_involved} Europe-focused)`,
        `Markets: ${heats.markets}/5 (IG Δ${mkts.ig_change.toFixed(1)}, HY Δ${mkts.hy_change.toFixed(1)})`
      ].join('\n')

      const pillars = Object.keys(heats).map(key => ({
        pillar_key: key,
        heat: heats[key],
        weight: this.db.db.prepare('SELECT weight FROM pillar_scores WHERE pillar_key = ? LIMIT 1').get(key)?.weight || {
          elite_language: 25,
          defense_posture: 25,
          markets: 20,
          public_opinion: 15,
          media_attention: 15
        }[key],
        evidence_json: JSON.stringify(allStats[key].evidence || [])
      }))

      this.db.upsertSnapshot(weekEnding, memo, pillars)
      this.logger.info('NATO weekly snapshot created for', weekEnding)
      return { success: true, snapshot: { weekEnding, heats, memo } }
    } catch (e) {
      this.logger.error('NATO weekly worker error:', e)
      return { success: false, error: e.message }
    }
  }
}
