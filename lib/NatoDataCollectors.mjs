import https from 'node:https'
import http from 'node:http'
import { parseStringPromise } from 'xml2js'

function fetchJson(url, logger = console) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'NatoFractureBot/1.0' } }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

function fetchText(url, logger = console) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'NatoFractureBot/1.0' } }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

export class RssCollector {
  constructor(logger = console) {
    this.logger = logger
    this.keywords = {
      contingency: ['contingency', 'readiness', 'deterrence', 'strategic autonomy'],
      article5: ['article 5', 'collective defense'],
      concern: ['concern', 'concerned', 'alert', 'vigilant']
    }
  }

  async fetchFeed(url) {
    try {
      const xml = await fetchText(url, this.logger)
      const parsed = await parseStringPromise(xml)
      const items = parsed?.rss?.channel?.[0]?.item || []
      return items.map(item => ({
        title: item.title?.[0] || '',
        description: item.description?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        link: item.link?.[0] || ''
      }))
    } catch (e) {
      this.logger.warn('RssCollector.fetchFeed error:', e.message)
      return []
    }
  }

  analyzeStatements(items) {
    const stats = {
      total: items.length,
      contingency: 0,
      article5: 0,
      concern: 0,
      evidence: []
    }
    items.forEach(item => {
      const text = (item.title + ' ' + item.description).toLowerCase()
      this.keywords.contingency.forEach(kw => {
        if (text.includes(kw)) stats.contingency++
      })
      this.keywords.article5.forEach(kw => {
        if (text.includes(kw)) stats.article5++
      })
      this.keywords.concern.forEach(kw => {
        if (text.includes(kw)) stats.concern++
      })
      if (stats.contingency > 0 || stats.article5 > 0) {
        stats.evidence.push({ label: item.title, url: item.link, note: item.pubDate })
      }
    })
    return stats
  }

  async collectEliteLanguage() {
    const feeds = [
      'https://www.consilium.europa.eu/feed/news/',
      'https://www.state.gov/feed/?topic=defense',
      'https://www.nato.int/nato_static_fl2014/assets/pdf/pdf_2024_02/20240220_nato-media-advisories.rss'
    ]
    let allItems = []
    for (const feed of feeds) {
      const items = await this.fetchFeed(feed)
      allItems = allItems.concat(items)
    }
    return this.analyzeStatements(allItems)
  }
}

export class DefensePosureCollector {
  constructor(logger = console) {
    this.logger = logger
    this.keywords = ['deployment', 'exercise', 'posture', 'rotation', 'accelerat', 'expanded', 'extended']
  }

  async fetchFeed(url) {
    try {
      const xml = await fetchText(url, this.logger)
      const parsed = await parseStringPromise(xml)
      const items = parsed?.rss?.channel?.[0]?.item || []
      return items.map(item => ({
        title: item.title?.[0] || '',
        link: item.link?.[0] || '',
        pubDate: item.pubDate?.[0] || ''
      }))
    } catch (e) {
      this.logger.warn('DefensePosureCollector.fetchFeed error:', e.message)
      return []
    }
  }

  analyzePosture(items) {
    const stats = {
      total: items.length,
      posture_relevant: 0,
      europe_involved: 0,
      evidence: []
    }
    items.forEach(item => {
      const text = (item.title).toLowerCase()
      const isRelevant = this.keywords.some(kw => text.includes(kw))
      if (isRelevant) {
        stats.posture_relevant++
        const hasEurope = text.includes('europe') || text.includes('baltic') || text.includes('poland')
        if (hasEurope) stats.europe_involved++
        stats.evidence.push({ label: item.title, url: item.link, note: item.pubDate })
      }
    })
    return stats
  }

  async collectDefensePosture() {
    const feeds = [
      'https://www.defense.gov/rss2/dod_news/'
    ]
    let allItems = []
    for (const feed of feeds) {
      const items = await this.fetchFeed(feed)
      allItems = allItems.concat(items)
    }
    return this.analyzePosture(allItems)
  }
}

export class MarketsCollector {
  constructor(logger = console) {
    this.logger = logger
    this.fredApiKey = process.env.FRED_API_KEY || ''
  }

  async fetchFredSeries(seriesId, observations = 1) {
    if (!this.fredApiKey) {
      this.logger.warn('FRED_API_KEY not set, returning mock data')
      return { value: 0, change: 0 }
    }
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${this.fredApiKey}&file_type=json&limit=${observations}`
      const data = await fetchJson(url, this.logger)
      const obs = data.observations || []
      if (obs.length < 2) return { value: 0, change: 0 }
      const latest = parseFloat(obs[obs.length - 1].value)
      const prev = parseFloat(obs[obs.length - 2].value)
      return { value: latest, change: latest - prev }
    } catch (e) {
      this.logger.warn('MarketsCollector.fetchFredSeries error:', e.message)
      return { value: 0, change: 0 }
    }
  }

  async collectMarkets() {
    const igSpread = await this.fetchFredSeries('BAMLH0A0HYM2')
    const hySpread = await this.fetchFredSeries('BAMLH0A0HYM2')
    return {
      ig_spread: igSpread.value,
      ig_change: igSpread.change,
      hy_spread: hySpread.value,
      hy_change: hySpread.change,
      risk_off: igSpread.change > 5 || hySpread.change > 5,
      evidence: [
        { label: 'ICE BofA IG Spread', url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', note: `Latest: ${igSpread.value}, Δ: ${igSpread.change}` },
        { label: 'ICE BofA HY Spread', url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', note: `Latest: ${hySpread.value}, Δ: ${hySpread.change}` }
      ]
    }
  }
}

export class PollCollector {
  constructor(logger = console) {
    this.logger = logger
    this.lastPoll = {
      date: '2026-01-01',
      nato_favorability: 65,
      us_support: 60,
      eu_support: 70,
      source: 'Cached'
    }
  }

  async collectPolls() {
    return {
      ...this.lastPoll,
      evidence: [
        { label: 'Pew Research NATO', url: 'https://www.pewresearch.org/', note: 'Check for latest NATO favorability' },
        { label: 'Eurobarometer', url: 'https://europa.eu/eurobarometer/', note: 'EU security attitudes' }
      ]
    }
  }
}

export class GdeltCollector {
  constructor(logger = console) {
    this.logger = logger
  }

  async queryGdelt(query) {
    try {
      const url = `https://api.gdeltproject.org/api/v2/search/tv?query=${encodeURIComponent(query)}&timespan=7d&maxrecords=100&format=json`
      const data = await fetchJson(url, this.logger)
      const articles = data.articles || []
      return {
        volume: articles.length,
        articles: articles.slice(0, 10).map(a => ({
          label: a.title || '',
          url: a.url || '',
          note: a.date || ''
        }))
      }
    } catch (e) {
      this.logger.warn('GdeltCollector.queryGdelt error:', e.message)
      return { volume: 0, articles: [] }
    }
  }

  async collectMediaNarrative() {
    const query = 'Trump NATO war Article 5'
    const result = await this.queryGdelt(query)
    return {
      volume_index: result.volume,
      top_articles: result.articles,
      evidence: result.articles
    }
  }
}
