class FooterView extends EventTarget {
    constructor(container, model, delegate){
      super()
      this.container = container
      this.model = model
      this.delegate = delegate
      this.items = container.querySelector("strong")
      const buttons = container.querySelectorAll("button")
      this.all = buttons[0]
      this.active = buttons[1]
      this.completed = buttons[2]
      this.clearCompleted = buttons[3]
      this.clearCompletedCount = this.clearCompleted.querySelector("span")
      this.all.addEventListener("click", e => {
        const event = new CustomEvent("allWasClicked", {
          detail: {}
        })
        this.dispatchEvent(event)
      }, true)
      this.completed.addEventListener("click", e => {
        const event = new CustomEvent("completedWasClicked", {
          detail: {}
        })
        this.dispatchEvent(event)
      }, true)
      this.active.addEventListener("click", e => {
        const event = new CustomEvent("activeWasClicked", {
          detail: {}
        })
        this.dispatchEvent(event)
      }, true)
      this.clearCompleted.addEventListener("click", e => {
        const event = new CustomEvent("clearCompletedWasClicked", {
          detail: {}
        })
        this.dispatchEvent(event)
      }, true)
      ;["push", "pop", "remove", "shift", "unshift"].forEach(key=>{
        this.model.observe(key, this)
      })
      
      this.addEventListener("allWasClicked", delegate.showAll.bind(delegate))
      this.addEventListener("completedWasClicked", delegate.showCompleted.bind(delegate))
      this.addEventListener("activeWasClicked", delegate.showActive.bind(delegate))
      this.addEventListener("clearCompletedWasClicked", delegate.clearCompleted.bind(delegate))
    }
    update(key, old, value){
      if(["push", "unshift"].indexOf(key) > -1) value.observe("done", this.todoWasCompleted.bind(this))
      this.items.innerHTML = this.model.filter(t=>!t.done).length
      this.clearCompletedCount.innerHTML = this.model.filter(t=>t.done).length
    }
    todoWasCompleted(key, old, value){
      this.items.innerHTML = this.model.filter(t=>!t.done).length
      this.clearCompletedCount.innerHTML = this.model.filter(t=>t.done).length
    }
  }
  
  export default FooterView