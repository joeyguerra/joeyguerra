import MakeObservableList from '/webapp/MakeObservableList.mjs'
import MakeKeyValueObservable from '/webapp/MakeKeyValueObservable.mjs'

const TodoView = (container, model, delegate)=>{
  const defaultClassList = container.classList
  const completed = container.querySelector('.toggle')
  const label = container.querySelector('label')
  const destroy = container.querySelector('.destroy')
  const input = container.querySelector('.edit')

  label.innerHTML = model.text
  input.value = model.text
  completed.checked = model.done
  model.observe('done', (key, old, value) => {
    if(value){
      container.classList.add('completed')
    } else {
      container.classList.remove('completed')
    }
    completed.checked = value
  })
  model.observe('text', (key, old, value) => {
    label.innerHTML = value
  })
  const view = {
    get container(){
      return container
    },
    get model() {
      return model
    },
    get delegate(){
      return delegate
    },
    get isEditing(){
      console.log("gettng", container.classList)
      return container.classList.indexOf("editing") > -1
    },
    set isEditing(v){
      console.log("settng", container.classList.toString())
      if(!v) {
        container.classList.remove("editing")
        return
      }
      container.classList.add("editing")
      input.focus()
      input.select()
    },
    show(){
      if(model.done){
        container.classList.add("completed")
      } else {
        container.classList.remove("completed")
      }
      container.classList.remove("hidden")
    },
    hide(){
      container.classList.add("hidden")
    },
    click(e){
      if(e.target === completed){
        model.done = e.target.checked
        delegate.completed(model)
      } else if(e.target === destroy){
        delegate.deleteTodo(model)
      }
    },
    dblclick(e){
      if(e.target === label){
        this.isEditing = true
        console.log("dblclicking", e.target)
      }
    },
    keyup(e){
      if(e.target === input) model.text = input.value
    },
    keydown(e){
      if(e.target !== input) return
      if(e.keyCode !== 13) return
      this.isEditing = false
      delegate.finishedEditing(this)
    },
    blur(e){
      if(e.target !== input) return
      this.isEditing = false
    },
    handleEvent(e){
      if(this[e.type]) this[e.type](e)
    }
  }
  completed.addEventListener("click", view, true)
  destroy.addEventListener("click", view, true)
  label.addEventListener("dblclick", view, true)
  input.addEventListener("keyup", view, true)
  input.addEventListener("keydown", view, true)
  input.addEventListener("blur", view, true)
  view.show()
  return view
}

const TodoEntryView = (container, model, delegate) => {
  const entry = container.querySelector("input")
  const view = {
    get container(){
      return container
    },
    get model() {
      return model
    },
    get delegate(){
      return delegate
    },
    clear(){
      entry.value = ""
    },
    focuse(){
      entry.focus()
    },
    submit(e){
      e.preventDefault()
      if(entry.value.length == 0) return
      model.push(MakeKeyValueObservable({text: entry.value, done: false}))
      this.clear()
    },
    handleEvent(e){
      console.log('handling', e)
      if(this[e.type]) this[e.type](e)
    },
    focus(){
      entry.focus()
      entry.select()
    }
  }
  container.addEventListener("submit", view, true)
  return view
}

const TodoFooterView = (container, model, delegate) => {
  const items = container.querySelector("strong")
  const buttons = container.querySelectorAll("button")
  const all = buttons[0]
  const active = buttons[1]
  const completed = buttons[2]
  const clearCompleted = buttons[3]
  const clearCompletedCount = clearCompleted.querySelector("span")
  const view = {
    get container(){
      return container
    },
    get model() {
      return model
    },
    get delegate(){
      return delegate
    },
    update(key, old, value){
      if(["push", "unshift"].indexOf(key) > -1) value.observe("done", this.doneWasClicked)
      items.innerHTML = model.filter(t=>!t.done).length
      clearCompletedCount.innerHTML = model.filter(t=>t.done).length
    },
    doneWasClicked(key, old, value){
      items.innerHTML = model.filter(t=>!t.done).length
      clearCompletedCount.innerHTML = model.filter(t=>t.done).length
    }
  }
  ;["push", "pop", "remove", "shift", "unshift"].forEach(key=>{
    model.observe(key, view)
  })
  all.addEventListener("click", delegate.showAll.bind(delegate), true)
  completed.addEventListener("click", delegate.showCompleted.bind(delegate), true)
  active.addEventListener("click", delegate.showActive.bind(delegate), true)
  clearCompleted.addEventListener("click", delegate.clearCompleted.bind(delegate), true)
  return view
}

const TodoTogglerView = (container, model, delegate) => {
  const view = {
    get container(){
      return container
    },
    get model() {
      return model
    },
    get delegate(){
      return delegate
    },
    toggle(e){
      if(model.length == 0) return e.prevenDefault()
      model.forEach(item=> item.done = e.target.checked)
    },
    click(e){
      this.toggle(e)
    },
    handleEvent(e){
      if(this[e.type]) this[e.type](e)
    }
  }
  container.addEventListener("click", view, true)
  return view
}
const InfoView = (container, model, delegate) => {
  const downloadLink = container.querySelector('#downloadLink')
  const view = {
    get container(){
      return container
    },
    get model() {
      return model
    },
    get delegate(){
      return delegate
    },
    handleEvent(e){
      if(this[e.type]) this[e.type](e)
    },
    click(e){
      const data = encodeURIComponent(JSON.stringify(this.model))
      console.log(data)
      e.target.href = `data:application/octet-stream;charset=utf-8,${data}`
    }
  }
  downloadLink.addEventListener('click', view, true)
  return view
}

  const todoTemplate = document.getElementById("todo-list").querySelector("li:first-child")
  const template = todoTemplate.cloneNode(true)
const json = localStorage.getItem("todos")
  const todoList = document.getElementById("todo-list")
  todoList.removeChild(todoTemplate)
const TodoApp = ()=>{
  return {
    views: MakeObservableList(),
    todos: MakeObservableList(),
    todo: MakeKeyValueObservable({done: false, text: "What needs to be done?"}),
    entryAdded(key, old, value){
      if(!value.text || value.text.length == 0) return
      let todo = this.todos.find(todo=>todo.text == value.text)
      const elem = template.cloneNode(true)
      const view = TodoView(elem, todo, this)
      this.views.push(view)
      todoList.appendChild(elem)
      localStorage.setItem("todos", JSON.stringify(this.todos))
    },
    deleteTodo(todo){
      this.todos.remove(t => t.text == todo.text)
      localStorage.setItem("todos", JSON.stringify(this.todos))
    },
    removed(key, old, value){
      let i = 0
      let ubounds = this.views.length
      const deleted = this.views.remove(view => view.model.text == old.text)
      todoList.removeChild(deleted.container);
      localStorage.setItem("todos", JSON.stringify(this.todos))
    },
    showAll(){
      this.views.forEach(view => {
        if(Object.keys(view.model).indexOf("done") > -1){
          view.show()
        }
      })
    },
    showCompleted(){
      this.views.forEach(view => {
        if(Object.keys(view.model).indexOf("done") > -1){
          if(view.model.done) view.show()
          else view.hide()
        }
      })
    },
    showActive(){
      this.views.forEach(view => {
        if(view.show){
          if(view.model.done) view.hide()
          else view.show()
        }
      })
    },
    clearCompleted(){
      this.todos.removeMany(todo=>todo.done)
    },
    finishedEditing(view){
      this.views.forEach(v => {
        if(v.focus) v.focus()
      })
      localStorage.setItem("todos", JSON.stringify(this.todos))
    },
    completed(model){
      localStorage.setItem("todos", JSON.stringify(this.todos))
    }
  }
}

const todoApp = TodoApp()
todoApp.todos.observe("push", todoApp.entryAdded.bind(todoApp))
todoApp.todos.observe("remove", todoApp.removed.bind(todoApp))
if(json) {
  const todos = JSON.parse(json)
  todos.forEach(todo => todoApp.todos.push(MakeKeyValueObservable(todo)))
}
todoApp.views.push(TodoEntryView(document.getElementById("header"), todoApp.todos, todoApp))
todoApp.views.push(TodoFooterView(document.getElementById("footer"), todoApp.todos, todoApp))
todoApp.views.push(TodoTogglerView(document.getElementById("toggle-all"), todoApp.todos, todoApp))
todoApp.views.push(InfoView(document.getElementById('info'), todoApp.todos, todoApp))

console.log(todoApp)
export default todoApp
