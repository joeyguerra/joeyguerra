const defaultIndex = [
  { title: 'Start Here', url: '/blog/start.html', type: 'page', desc: 'Suggested first stop' },
  { title: 'About Joey', url: '/about/', type: 'page', desc: 'About Joey Guerra' },
  { title: 'Mission Log', url: '/blog/mission-log.html', type: 'blog', desc: 'All posts and tags' },
  { title: 'Missions', url: '/missions/', type: 'page', desc: 'Active and past missions' },
  { title: 'Concepts', url: '/concepts/', type: 'page', desc: 'Core ideas and patterns' },
  { title: 'Guide to Software Success', url: '/guide-software-success/', type: 'guide', desc: 'Playbooks to ship well' },
  { title: 'The Hidden Cost of Interfaces', url: '/blog/2025/hidden-cost-of-interfaces.html', type: 'post', desc: 'Failure modes and a playbook' }
]

const byScore = (a, b) => b.score - a.score

const score = (q, item) => {
  const query = q.trim().toLowerCase()
  if (!query) return 0
  const title = (item.title || '').toLowerCase()
  const desc = (item.desc || '').toLowerCase()
  const url = (item.url || '').toLowerCase()
  let s = 0
  if (title === query) s += 50
  if (title.startsWith(query)) s += 25
  if (title.includes(query)) s += 15
  if (desc.includes(query)) s += 6
  if (url.includes(query)) s += 3
  return s
}

class SpotlightSearch {
  constructor () {
    this.data = []
    this.activeIndex = -1
    this.backdrop = this.#render()
    this.#attach()
    this.#loadIndex()
  }

  #render () {
    const backdrop = document.createElement('div')
    backdrop.className = 'spotlight-backdrop'
    backdrop.setAttribute('role', 'dialog')
    backdrop.setAttribute('aria-modal', 'true')
    backdrop.setAttribute('aria-hidden', 'true')
    backdrop.hidden = true
    backdrop.innerHTML = `
      <div class='spotlight-panel' role='document'>
        <div class='spotlight-input-wrap'>
          <span class='icon'>🔍</span>
          <input class='spotlight-input' type='search' placeholder='Search…' aria-label='Search' />
          <span class='spotlight-kbd-hint'>⌘ K</span>
        </div>
        <div class='spotlight-results'>
          <div class='spotlight-loading'>Type to search…</div>
          <ul class='spotlight-list' hidden></ul>
        </div>
      </div>
    `
    document.body.appendChild(backdrop)
    return backdrop
  }

  #attach () {
    this.input = this.backdrop.querySelector('.spotlight-input')
    this.list = this.backdrop.querySelector('.spotlight-list')
    this.resultsWrap = this.backdrop.querySelector('.spotlight-results')

    this.backdrop.addEventListener('click', e => {
      if (e.target === this.backdrop) this.close()
    })

    this.input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault()
        this.close()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.#move(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.#move(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        this.#openActive()
      }
    })

    let t
    this.input.addEventListener('input', () => {
      clearTimeout(t)
      const q = this.input.value
      t = setTimeout(() => this.#search(q), 100)
    })

    document.addEventListener('keydown', e => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if ((e.metaKey && e.key.toLowerCase() === 'k') || (!isTyping && e.key === '/')) {
        e.preventDefault()
        this.open()
      }
    })
  }

  async #loadIndex () {
    try {
      const res = await fetch('/js/search-index.json', { cache: 'no-store' })
      if (!res.ok) throw new Error('no index')
      const json = await res.json()
      this.data = Array.isArray(json) ? json : defaultIndex
    } catch {
      this.data = defaultIndex
    }
  }

  open () {
    this.backdrop.hidden = false
    this.backdrop.setAttribute('aria-hidden', 'false')
    this.backdrop.classList.add('is-open')
    this.input.value = ''
    this.input.focus()
    this.#renderEmpty('Type to search…')
    this.activeIndex = -1
  }

  close () {
    this.backdrop.classList.remove('is-open')
    this.backdrop.setAttribute('aria-hidden', 'true')
    this.backdrop.hidden = true
  }

  #renderEmpty (text) {
    this.list.hidden = true
    this.resultsWrap.querySelector('.spotlight-loading')?.remove()
    const d = document.createElement('div')
    d.className = 'spotlight-loading'
    d.textContent = text
    this.resultsWrap.prepend(d)
  }

  #search (q) {
    const trimmed = q.trim()
    if (!trimmed) return this.#renderEmpty('Type to search…')
    const results = this.data
      .map(r => ({ ...r, score: score(q, r) }))
      .filter(r => r.score > 0)
      .sort(byScore)
      .slice(0, 20)
    this.#renderResults(results)
  }

  #renderResults (items) {
    this.resultsWrap.querySelector('.spotlight-loading')?.remove()
    this.list.innerHTML = ''
    if (!items.length) {
      this.#renderEmpty('No results')
      return
    }
    this.list.hidden = false
    items.forEach((item, i) => {
      const li = document.createElement('li')
      li.className = 'spotlight-item'
      li.setAttribute('data-url', item.url)
      li.innerHTML = `
        <div>
          <div class='title'>${item.title}</div>
          <div class='desc'>${item.desc || item.url}</div>
        </div>
        <span class='badge'>${item.type || 'page'}</span>
      `
      li.addEventListener('mouseenter', () => this.#setActive(i))
      li.addEventListener('click', () => {
        window.location.assign(item.url)
      })
      this.list.appendChild(li)
    })
    this.activeIndex = -1
  }

  #setActive (i) {
    const children = Array.from(this.list.children)
    children.forEach(el => el.classList.remove('is-active'))
    const el = children[i]
    if (el) {
      el.classList.add('is-active')
      this.activeIndex = i
      el.scrollIntoView({ block: 'nearest' })
    }
  }

  #move (delta) {
    const count = this.list.children.length
    if (!count) return
    let next = this.activeIndex + delta
    if (next < 0) next = count - 1
    if (next >= count) next = 0
    this.#setActive(next)
  }

  #openActive () {
    const el = this.list.children[this.activeIndex]
    if (!el) return
    const url = el.getAttribute('data-url')
    if (url) window.location.assign(url)
  }
}

export const initSpotlightSearch = (opts = {}) => {
  if (window.__spotlightInstance) return window.__spotlightInstance
  const ensureCss = href => {
    if ([...document.styleSheets].some(s => s.href?.includes(href))) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }

  ensureCss('/css/spotlight-search.css')

  const spotlight = new SpotlightSearch()
  window.__spotlightInstance = spotlight
  const triggerSel = opts.triggerSelector || '#searchLink'
  const trigger = document.querySelector(triggerSel)
  if (trigger) {
    trigger.addEventListener('click', e => {
      e.preventDefault()
      spotlight.open()
    })
  }
  return spotlight
}

