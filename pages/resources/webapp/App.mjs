import MakeObservableList from '../webapp/MakeObservableList.mjs'
import MakeKeyValueObservable from '../webapp/MakeKeyValueObservable.mjs'
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)

class App {
    #contactsA = new Set()
    #contactsB = new Set()

    constructor(window, socket, user, model){
        this.window = window
        this.user = user
        if (!model.observe) {
            model = MakeKeyValueObservable(model)
        }
        this.model = model
        this.socket = socket ?? {
            emit: (event, message) => console.log('socket.emit', event, message),
            on: (event, callback) => console.log('socket.on', event, callback)
        }
        this.views = []
        this.subscriptions = {}
        this.messages = MakeObservableList()
        this.socket.on('update', this.update.bind(this))
        this.socket.on('message', this.message.bind(this))
        this.socket.on('joined', this.joined.bind(this))
        if (!this.model.contacts) {
            this.model.contacts = MakeObservableList()
        }
        this.model.contacts.observe('remove', this.contactWasRemoved.bind(this))
        this.model.observe('term', this.termDidChange.bind(this))
    }
    #isIn (term, contact) {
        if(term.length === 0) return true
        return `${contact.name} ${contact.email} ${contact.phone}`.toLowerCase().indexOf(term.toLowerCase()) > -1
    }
    termDidChange(key, old, value){
        if(this.#contactsA.size === 0) this.model.contacts.forEach(contact => this.#contactsA.add(contact))
        this.#contactsB.clear()
        this.#contactsA.forEach(contact => {
            if(!this.#isIn(value, contact)) {
                this.#contactsB.add(contact)
            } else {
                this.#contactsB.delete(contact)
            }
        })
        this.#contactsB.forEach(contact => this.model.contacts.remove(c => c.id === contact.id))
        this.#contactsA.difference(this.#contactsB).forEach(contact => {
            if(!this.model.contacts.find(c => c.id === contact.id)) this.model.contacts.push(contact)
        })
    }
    contactWasRemoved(contact){
    }
    message(message){
        console.log("got message from message: ", message.substr(0, 20))
        this.messages.push(message)
    }
    update(message){
        console.log("got message from update: ", message.substr(0, 20))
        if(!message) return
        if(message.length == 0) return
        if(message.indexOf("<html") == -1) return
        window.location.reload(true)
        // const parser = new DOMParser()
        // const doc = parser.parseFromString(message, "text/html")
        // this.window.document.body = doc.body
        // this.window.document.open()
        // this.window.document.write(message)
        // this.window.document.close()
    }
    joined(message){
        console.log("Someone just joined", message.member.id, this.model.self.id)

    }
    send(message){
        this.socket.emit("sending message from user", message)
    }
}
export default App