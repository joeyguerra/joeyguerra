import App from './App.mjs'
import MakeKeyValueObservable from './MakeKeyValueObservable.mjs'
import MakeObservableList from './MakeObservableList.mjs'

class DomElementMover {
    constructor(container, model = { portionOfHeightFromTop: 1 }, delegate) {
        this.container = container
        this.model = model
        this.delegate = delegate
        this.startX = 0
        this.startY = 0
        this.model.observe("x", this)
        this.model.observe("y", this)
    }
    update(key, old, value) {
        const name = key + 'Update'
        this[name](value)
    }
    xUpdate(v) {
        let left = v - this.container.clientWidth / 2
        if (v * 2 > 1280) {
        left = v / 2 - this.container.clientWidth / 2
        }
        this.container.style["margin-left"] = `${left}px`
    }
    yUpdate(v) {
        let top = v - this.container.clientHeight / this.model.portionOfHeightFromTop
        this.container.style["margin-top"] = `${top}px`
    }
}

const peers = []
const model = MakeKeyValueObservable({
  contacts: MakeObservableList(),
  term: ''
})
const user = {
  self: null
}

// TODO: Implement a mock socket.io server
// const io = options => {
//     const subscribers = {}
//     return {
//       emit(event, message){
//         if(!subscribers[event]) return
//         subscribers[event].forEach(s => s(message))
//       },
//       on(event, callback){
//         if(!subscribers[event]) subscribers[event] = []
//         subscribers[event].push(callback)
//     }
//   }
// }

// const socket = io({
//   reconnectionAttempts: 5
// })

const trackersAnnounceURLs = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.webtorrent.io'
]

// const p2pt = new P2PT(trackersAnnounceURLs, 'www.joeyguerra.com')

// p2pt.on('trackerconnect', (tracker, stats) => {
//   console.log(`Connected to tracker:`, tracker)
//   console.log(`Peers:`, stats)
// })

// p2pt.on('peerconnect', async peer => {
//   // let [p, msg] = await p2pt.send(peer, 'Hi there!')
//   // let [p2, msg2] = await peer.respond('Hi back!')
//   peers.push(peer)
//   socket.emit('joined', {
//     member: peer
//   })
// })

// p2pt.on('msg', async (peer, msg) => {
//   console.log('msg', peer, msg)
//   let [p2, msg2] = await peer.respond('Message received')
//   console.log('msg response', p2, msg2)
// })

// console.log('P2PT started. Peer id = ', p2pt._peerId)
// user.self = {
//   id: p2pt._peerId
// }
// window.addEventListener('unload', e => {
//   p2pt.destroy()
// })

// const broadCast = async (message, peers) => {
//   for await(let peer of peers){
//     if(!peer.connected) continue
//     let [p, msg] = await p2pt.send(peer, message)
//   }
// }
let socket = io()
// TODO: For p2p integration
// socket.on('sending message from user', async message => {
//   await broadCast(message, peers)
// })

socket.on('message', message => {
  console.log('got message', message)
})
// window.app = new App(window, socket, user, model)
window.addEventListener('load', async e => {
  // p2pt.start()
  // setInterval(async () => {
  //   await broadCast(`[${Date.now()}] ${window.navigator.userAgent}`, peers)
  // }, 5000)
}, true)

if (!Set.prototype.difference) {
  Set.prototype.difference = function(setB) {
      var difference = new Set(this)
      for (var elem of setB) {
          difference.delete(elem)
      }
      return difference
  }
}

