class SpotlightSearch {
  constructor(dialogSelector = '#spotlight') {
    this.dialog = document.querySelector(dialogSelector)
    if (!this.dialog) {
      throw new Error(`Spotlight dialog not found: ${dialogSelector}`)
    }
    this.#attach()
  }

  #attach() {
    this.input = this.dialog.querySelector('input')
    this.results = this.dialog.querySelector('.spotlight-results')

    // Click backdrop to close
    this.dialog.addEventListener('click', e => {
      if (e.target === this.dialog) this.close()
    })

    // Search on every keystroke
    this.input.addEventListener('input', () => this.#search())

    // Navigate with click
    this.results.addEventListener('click', e => {
      const item = e.target.closest('[data-url]')
      if (item) {
        window.location.href = item.dataset.url
        this.close()
      }
    })

    // Global shortcuts
    document.addEventListener('keydown', e => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      
      // Open/toggle with ⌘K or /
      if ((e.metaKey && e.key === 'k') || (!isTyping && e.key === '/')) {
        e.preventDefault()
        this.dialog.open ? this.close() : this.open()
      }
      
      // Close with ESC
      if (e.key === 'Escape' && this.dialog.open) {
        e.preventDefault()
        this.close()
      }
    })
  }

  open() {
    this.dialog.showModal()
    this.input.value = ''
    this.input.focus()
    this.#showMessage('Type to search…')
  }

  close() {
    this.dialog.close()
  }

  #showMessage(text) {
    this.results.innerHTML = `<div class="spotlight-empty">${text}</div>`
  }

  async #search() {
    const q = this.input.value.trim()
    if (!q) return this.#showMessage('Type to search…')

    try {
      const res = await fetch('/search.html?q=' + encodeURIComponent(q))
      if (!res.ok) throw new Error(res.status)
      
      const html = await res.text()
      this.#renderResults(html, q)
    } catch (err) {
      this.#showMessage('Search failed')
    }
  }

  #renderResults(html, query) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Highlight matches cheaply
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi')
      doc.querySelectorAll('.title, .desc').forEach(el => {
        el.innerHTML = el.textContent.replace(regex, '<mark>$1</mark>')
      })
    }

    this.results.innerHTML = doc.body.innerHTML
  }
}

export const initSpotlightSearch = (options = {}) => {
  if (window.__spotlight) return window.__spotlight
  
  const spotlight = new SpotlightSearch(options.dialogSelector)
  window.__spotlight = spotlight

  const trigger = document.querySelector(options.triggerSelector)
  if (trigger) {
    trigger.addEventListener('click', e => {
      e.preventDefault()
      spotlight.open()
    })
  }

  return spotlight
}

