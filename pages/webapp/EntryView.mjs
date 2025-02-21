import MakeKeyValueObservable from "../webapp/MakeKeyValueObservable.mjs"
class EntryView extends EventTarget {
  constructor(container, model, delegate){
    super()
    this.container = container
    this.model = model
    this.delegate = delegate
    this.input = this.container.querySelector("input")
    this.container.addEventListener("submit", this, true)
  }
  handleEvent(e){
    if(this[e.type]) this[e.type](e)
  }
  submit(e){
    e.preventDefault()
    if(this.input.value.length == 0) return
    this.model.push(MakeKeyValueObservable({text: this.input.value, done: false}))
    this.clear()
  }
  clear(){
    this.input.value = ""
  }
  focus(){
    this.input.focus()
    this.input.select()
  }
}
export default EntryView