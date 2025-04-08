import { KeyValueObservable } from './KeyValueObservable.mjs'

class ObservableArray {
    constructor() {
        this.items = []
        this.observers = []
    }

    add(keyValueObservable) {
        if (!(keyValueObservable instanceof KeyValueObservable)) {
            throw new Error('Item must be an instance of KeyValueObservable')
        }
        this.items.push(keyValueObservable)
        this.notifyListeners('add', null, keyValueObservable)
        return keyValueObservable
    }

    remove(key) {
        const index = this.items.findIndex(item => item.key === key)
        if (index !== -1) {
            const [removedItem] = this.items.splice(index, 1)
            this.notifyListeners('remove', removedItem, null)
            return removedItem
        }
        return null
    }

    get(key) {
        const item = this.items.find(item => item.key === key)
        return item ? item.value : undefined
    }

    notifyListeners(action, old, value) {
        this.observers.forEach(o => o.update(action, old, value))
    }

    addObserver(observer) {
        this.observers.push(observer)
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(o => o !== observer)
    }
    replace(items) {
        if (!Array.isArray(items)) {
            throw new Error('Items must be an array')
        }
        this.items = items
        this.notifyListeners('replace', null, items)
    }
}

export { ObservableArray }
