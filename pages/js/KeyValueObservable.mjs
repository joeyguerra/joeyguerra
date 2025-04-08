class KeyValueObservable {
    constructor() {
        this.store = new Map()
        this.observers = new Map()
    }

    set(key, value) {
        const oldValue = this.store.get(key)
        this.store.set(key, value)
        this.#notify(key, oldValue, value)
    }

    get(key) {
        return this.store.get(key)
    }

    addObserver(key, observer) {
        if (!this.observers.has(key)) {
            this.observers.set(key, [])
        }
        this.observers.get(key).push(observer)
    }

    removeObserver(key, observer) {
        if (!this.observers.has(key)) return
        const observers = this.observers.get(key).filter(o => o !== observer)
        this.observers.set(key, observers)
    }

    #notify(key, oldValue, newValue) {
        if (!this.observers.has(key)) return
        for (const observer of this.observers.get(key)) {
            observer.update(key, oldValue, newValue)
        }
    }
}

export { KeyValueObservable }
