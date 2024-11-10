class TogglerView {
    constructor(container, model, delegate){
      this.container = container
      this.model = model
      this.delegate = delegate
      this.container.addEventListener("click", this, true)
    }
    toggle(e){
      if(this.model.length == 0) return e.prevenDefault()
      this.model.forEach(item => item.done = e.target.checked)
    }
    click(e){
      this.toggle(e)
    }
    handleEvent(e){
      if(this[e.type]) this[e.type](e)
    }
  }
  
  export default TogglerView