class Observer {
    constructor() {}
    update(key, old, value) {}
    destroy() {}
}
class Observable {
    #observers = new Map()
    constructor() {}
    observe(key, observer) {
        if (!this.#observers.has(key)) {
            this.#observers.set(key, [])
        }
        this.#observers.get(key).push(observer)
    }
    stopObserving(observer) {
        this.#observers.forEach((observers, key) => {
            this.#observers.set(key, observers.filter((obs) => obs !== observer))
        })
    }
    update(key, old, value) {
        if (!this.#observers.has(key)) return
        this.#observers.get(key).forEach((observer) => {
            observer.update(key, old, value, this)
        })
    }
    destroy() {
        this.#observers.forEach((observers) => {
            observers.forEach((observer) => {
                observer.destroy()
            })
        })
        this.#observers.clear()
    }
}
class ObservableArray extends Array {
    #observers = new Map()
    constructor(...args) {
        super(...args)
    }
    push(item) {
        super.push(item)
        this.#update('push', null, item)
    }
    pop() {
        const item = super.pop()
        this.#update('pop', item, null)
        return item
    }
    remove(item) {
        const index = this.indexOf(item)
        if (index === -1) return
        super.splice(index, 1)
        this.#update('remove', item, null)
    }
    #update(key, old, value) {
        if (!this.#observers.has(key)) return
        this.#observers.get(key).forEach((observer) => {
            observer.update(key, old, value, this)
        })
    }
    observe(key, observer) {
        if (!this.#observers.has(key)) {
            this.#observers.set(key, [])
        }
        this.#observers.get(key).push(observer)

    }
    stopObserving(observer) {
        this.#observers.forEach((observers, key) => {
            this.#observers.set(key, observers.filter((obs) => obs !== observer))
        })
    }
    destroy() {
        this.#observers.forEach((observers) => {
            observers.forEach((observer) => {
                observer.destroy()
            })
        })
        this.#observers.clear()
    }
}

export { Observable, Observer, ObservableArray }