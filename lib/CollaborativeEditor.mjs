
class Offset {
    constructor(start, end){
        this.start = start
        this.end = end
    }
}
class Client {
    constructor(id, delegate, window){
        this.id = id
        this.window = window
        this.delegate = delegate
        this.document = window.document
        this.current = null
    }
    cursorOn(node, offset){
        this.current = {node, offset}
    }
    inserting(text){
        const {node, offset} = this.current
        if(!node) return
        const newNode = node.cloneNode()
        let previousOffset = offset
        const current = newNode.textContent.split('')
        current.splice(offset.start, 0, text)
        newNode.textContent = current.join('')
        node.replaceWith(newNode)
        this.delegate.hasChanged(this.id, newNode, node, previousOffset, text.length)
    }
    deleting(node, offset){
        if(!node) return
        const newNode = node.cloneNode(true)
        let previousOffset = offset
        const length = offset.end - offset.start
        const current = newNode.textContent.split('')
        current.splice(offset.start, offset.end)
        newNode.textContent = current.join('')
        node.replaceWith(newNode)
        this.delegate.hasChanged(this.id, newNode, node, previousOffset, length)
    }
}
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function getCssSelector(el) {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += `#${el.id}`;
        path.unshift(selector);
        break;
      } else {
        let sib = el;
        let nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector) nth++;
        }
        if (nth != 1) selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }
  
function broadcast(client){
    let node = client.current.node
    const offset = client.current.offset
    const currentNodeSelector = getCssSelector(node.parentNode)
    const currentNode = document.querySelector(currentNodeSelector)
    const indexWithinCurrentNode = Array.from(currentNode.childNodes).findIndex(n => n == node)
    // console.log({selector: currentNodeSelector, indexWithinCurrentNode, offset})
    if(indexWithinCurrentNode > 0){
        // console.log('yes', indexWithinCurrentNode, currentNode.childNodes[indexWithinCurrentNode])
    }
    // console.log('node', currentNode, currentNode.textContent[offset], node, node.parentNode, offset, indexWithinCurrentNode)
}


function receive(client){

}

class CollaborativeEditor {
    constructor(window, model, div = null, lib = {}){
        this.clients = []
        this.me = new Client('me', this, window)
        this.window = window
        this.document = window.document
        this.div = div
        this.interval = null
        this.offset = new Offset(0, 0)
        this.model = model
        this.lib = lib
    }
    hasChanged(id, node, oldNode, offset, length){
        this.clients.forEach(client => {
            if(client.id == id){
                client.current.node = node
                client.current.offset.start = offset.start + length
                client.current.offset.end = offset.end
            }
        })
        
        if(!this.me.current?.node || oldNode != this.me.current.node){
            return
        }
        this.me.current.node = node
        const selection = this.me.current.node.ownerDocument.getSelection()
        selection.removeAllRanges()
        const range = this.me.current.node.ownerDocument.createRange()
        range.selectNodeContents(this.me.current.node)
        try{
            range.setStart(this.me.current.node, this.me.current.offset.start)
            range.setEnd(this.me.current.node, this.me.current.offset.end)
            selection.addRange(range)
        }catch(e){
            console.log(e)
        }
    }
    handleEvent(e){
        if(this[e.type]) this[e.type](e)
    }
    startSimulator(nerf){
        console.log(this.div)
        this.clients.push(nerf)
        if(this.div.childNodes.length == 0){
            this.div.appendChild(this.document.createElement('p'))
        }
        return setInterval(async () => {
            const randomChar = characters.charAt(Math.floor(Math.random() * characters.length))
            Math.random() > 0.5 ? nerf.inserting(randomChar) : nerf.deleting(this.div.childNodes[1].firstChild, new Offset(10, 11))
            nerf.current.node.dispatchEvent(new InputEvent('input', {bubbles: true, data: randomChar, inputType: 'insertText'}))
        }, 1000)
    }
    start(){
        if(this.div == null) {
            this.div = this.document.createElement('div')
            this.div.contentEditable = true
            this.document.body.appendChild(this.div)
        }
        this.document.addEventListener('selectionchange', this, true)
        this.div.addEventListener('input', this, true, )
        this.div.addEventListener('click', this, true)
    }
    click(e){
        const selection = e.target.ownerDocument.defaultView.getSelection()
        this.offset = new Offset(selection.baseOffset, selection.focusOffset)
        const range = selection.getRangeAt(0)
        this.me.cursorOn(selection.anchorNode, new Offset(range.startOffset, range.endOffset))
        broadcast(this.me)
    }
    selectionchange(e){
        const selection = this.div.ownerDocument.defaultView.getSelection()
        const range = selection.getRangeAt(0)
        if(this.me.current){
            this.me.cursorOn(selection.anchorNode, new Offset(range.startOffset, range.endOffset))
            broadcast(this.me)
        }
    }
    input(e) {
        if(e.isTrusted && e.data){
            const offset = this.me.current.offset + e.data.length
            this.me.cursorOn(this.me.current.node, new Offset(offset, offset))
            broadcast(this.me)
        }
    }
}

export {
    CollaborativeEditor,
    Client,
    Offset
}