
import MakeKeyValueObservable from "../webapp/MakeKeyValueObservable.mjs"
import MakeObservableList from "../webapp/MakeObservableList.mjs"
import TodoView from "../webapp/TodoView.mjs"
import EntryView from ".../webapp/EntryView.mjs"
import FooterView from "../webapp/FooterView.mjs"
import TogglerView from "../webapp/TogglerView.mjs"

class TodoApp{
  constructor(template, todoList, window, io){
    this.template = template
    this.todoList = todoList
    this.window = window
    this.io = io
    this.document = this.window.document
    this.views = MakeObservableList()
    this.todos = MakeObservableList()
    this.todo = MakeKeyValueObservable({one: false, text: "What needs to be done?"})
    this.views.push(new EntryView(document.getElementById("header"), this.todos, this))
    this.views.push(new FooterView(document.getElementById("footer"), this.todos, this))
    this.views.push(new TogglerView(document.getElementById("toggle-all"), this.todos, this))
  }
  todoWasAdded(key, old, value){
    if(!value.text || value.text.length == 0) return
    let todo = this.todos.find(todo=>todo.text == value.text)
    const elem = this.template.cloneNode(true)
    const view = new TodoView({
      container: elem,
      completed: elem.querySelector(".toggle"),
      destroy: elem.querySelector(".destroy"),
      label: elem.querySelector("label"),
      input: elem.querySelector(".edit")
    }, todo, this)
    this.views.push(view)
    this.todoList.appendChild(elem)
    this.window.localStorage.setItem("todos", JSON.stringify(this.todos))
  }
  todoWasDeleted(arg){
    let todo = arg.detail
    this.todos.remove(t => t.text == todo.text)
    this.window.localStorage.setItem("todos", JSON.stringify(this.todos))
  }
  todoWasRemoved(key, old, value){
    let i = 0
    let ubounds = this.views.length
    const deleted = this.views.remove(view => view.model.text == old.text)
    this.todoList.removeChild(deleted.container);
    this.window.localStorage.setItem("todos", JSON.stringify(this.todos))
  }
  showAll(){
    this.views.forEach(view => {
      if(Object.keys(view.model).indexOf("done") > -1){
        view.show()
      }
    })
  }
  showCompleted(){
    this.views.forEach(view => {
      if(Object.keys(view.model).indexOf("done") > -1){
        if(view.model.done) view.show()
        else view.hide()
      }
    })
  }
  showActive(){
    this.views.forEach(view => {
      if(view.show){
        if(view.model.done) view.hide()
        else view.show()
      }
    })
  }
  clearCompleted(){
    this.todos.removeMany(todo=>todo.done)
  }
  finishedEditing(view){
    this.views.forEach(v => {
      if(v.focus) v.focus()
    })
    this.window.localStorage.setItem("todos", JSON.stringify(this.todos))
  }
  todoWasCompleted(model){
    this.window.localStorage.setItem("todos", JSON.stringify(this.todos))
  }
  viewWasInitialized(view){

  }
}
export default TodoApp

