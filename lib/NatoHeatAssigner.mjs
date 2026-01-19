export class NatoHeatAssigner {
  constructor(logger = console) {
    this.logger = logger
  }

  assignEliteLanguageHeat(stats) {
    let heat = 0
    if (stats.article5 > 0) heat += 2
    if (stats.contingency > 2) heat += 2
    if (stats.concern > 3) heat += 1
    return Math.min(5, heat)
  }

  assignDefensePostureHeat(stats) {
    let heat = 0
    if (stats.posture_relevant > 0) heat += 1
    if (stats.europe_involved > 0) heat += 2
    if (stats.posture_relevant > 3) heat += 2
    return Math.min(5, heat)
  }

  assignMarketsHeat(stats) {
    let heat = 0
    if (stats.ig_change > 10) heat += 2
    if (stats.hy_change > 15) heat += 2
    if (stats.risk_off) heat += 1
    return Math.min(5, heat)
  }

  assignPublicOpinionHeat(stats) {
    let heat = 0
    const natFav = stats.nato_favorability || 65
    if (natFav < 50) heat += 3
    else if (natFav < 60) heat += 2
    else if (natFav < 70) heat += 1
    return Math.min(5, heat)
  }

  assignMediaHeat(stats) {
    let heat = 0
    if (stats.volume_index > 1000) heat += 3
    else if (stats.volume_index > 500) heat += 2
    else if (stats.volume_index > 100) heat += 1
    return Math.min(5, heat)
  }

  assignHeats(allStats) {
    return {
      elite_language: this.assignEliteLanguageHeat(allStats.elite_language),
      defense_posture: this.assignDefensePostureHeat(allStats.defense_posture),
      markets: this.assignMarketsHeat(allStats.markets),
      public_opinion: this.assignPublicOpinionHeat(allStats.public_opinion),
      media_attention: this.assignMediaHeat(allStats.media_attention)
    }
  }
}
