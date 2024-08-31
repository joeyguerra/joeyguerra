class TodoView extends EventTarget {
    constructor(dom = {
      container: new HTMLElement(),
      completed: new HTMLInputElement(),
      destroy: new HTMLButtonElement(),
      label: new HTMLLabelElement(),
      input: new HTMLInputElement()
    }, model, delegate){
      super()
      this.container = dom.container
      this.model = model
      this.delegate = delegate
      this.defaultClassList = this.container.classList
      this.completed = dom.completed
      this.label = dom.label
      this.destroy = dom.destroy
      this.input = dom.input
      this.label.innerHTML = this.model.text
      this.input.value = this.model.text
      this.completed.checked = this.model.done
      if(this.delegate.todoWasCompleted) this.addEventListener("wasCompleted", this.delegate.todoWasCompleted.bind(this.delegate), true)
      if(this.delegate.todoWasDeleted) this.addEventListener("wasDeleted", this.delegate.todoWasDeleted.bind(this.delegate), true)
      if(this.delegate.finishedEditing) this.addEventListener("haveFinishedEditing", this.delegate.finishedEditing.bind(this.delegate), true)
      this.model.observe("done", this)
      this.model.observe("text", this)
      this.completed.addEventListener("click", this, true)
      this.destroy.addEventListener("click", this, true)
      this.label.addEventListener("dblclick", this, true)
      this.input.addEventListener("keyup", this, true)
      this.input.addEventListener("keydown", this, true)
      this.input.addEventListener("blur", this, true)
      if(this.delegate.viewInitialized) this.delegate.viewWasInitialized(this)
    }
    get isEditing(){
      return this.container.classList.indexOf("editing") > -1
    }
    set isEditing(value){
      if(!value) {
        this.container.classList.remove("editing")
        return
      }
      this.container.classList.add("editing")
      this.input.focus()
      this.input.select()
    }
    show(){
      if(this.model.done) this.container.classList.add("completed")
      else this.container.classList.remove("completed")
      this.container.classList.remove("hidden")
    }
    hide(){
      this.container.classList.add("hidden")
    }
    click(e){
      if(e.target === this.completed){
        this.model.done = e.target.checked
        let event = new CustomEvent("wasCompleted", {
          detail: this.model
        })
        this.dispatchEvent(event)
      } else if(e.target === this.destroy){
        let event = new CustomEvent("wasDeleted", {
          detail: this.model
        })
        this.dispatchEvent(event)
      }
    }
    dblclick(e){
      if(e.target === this.label) this.isEditing = true
    }
    keyup(e){
      if(e.target === this.input) this.model.text = this.input.value
    }
    keydown(e){
      if(e.target !== this.input) return
      if(e.keyCode !== 13) return
      this.isEditing = false
      
      this.dispatchEvent(new CustomEvent("haveFinishedEditing", {
        detail: this.model
      }))
    }
    blur(e){
      if(e.target !== this.input) return
      this.isEditing = false
    }
    handleEvent(e){
      if(this[e.type]) this[e.type](e)
    }
    update(key, old, value){
      switch(key){
          case("text"): this.label.innerHTML = value
          break
          case("done"):
            if(value) this.container.classList.add("completed")
            else this.container.classList.remove("completed")
            this.completed.checked = value
          break
      }
    }
  }
  export default TodoView