import MakeObservableList from '../webapp/MakeObservableList.mjs'

export default class DailyTimeLogView {
  constructor(window, app){
    this.window = window
    this.app = app
    this.root = window.document.querySelector('#time-log-root')
    if (!this.root) return
    this.app.model.observe('currentUser', () => this.render())
    this.render()
  }
  el(html){
    const t = this.window.document.createElement('template')
    t.innerHTML = html.trim()
    return t.content.firstChild
  }
  render(){
    this.root.innerHTML = ''
    if (!this.app.isLoggedIn()) {
      this.root.appendChild(this.el(`
        <form id='login-form'>
          <h2>Login</h2>
          <input name='email' type='email' placeholder='email' required>
          <input name='password' type='password' placeholder='password' required>
          <button type='submit'>Sign In</button>
        </form>
      `))
      this.bindLogin()
      return
    }
    const user = this.app.model.currentUser
    const form = this.el(`
      <div>
        <h2>Welcome, ${user.name}</h2>
        <p>Role: ${this.app.model.roles[user.id] || 'member'}</p>
        <form id='log-form'>
          <input name='userId' type='hidden' value='${user.id}'>
          <input name='projectId' placeholder='project id' required>
          <input name='minutes' type='number' placeholder='minutes' required>
          <button type='submit'>Log Time</button>
        </form>
        <ul id='entries'></ul>
        <button id='logout-btn'>Logout</button>
      </div>
    `)
    this.root.appendChild(form)
    const list = form.querySelector('#entries')
    const renderEntries = () => {
      list.innerHTML = ''
      const userEntries = this.app.model.timeEntries.filter(e => e.userId === user.id)
      userEntries.forEach(e => {
        const li = this.el(`<li>${e.projectId}: ${e.minutes}m</li>`)
        list.appendChild(li)
      })
    }
    renderEntries()
    this.app.model.timeEntries.observe('push', renderEntries)
    this.bindLogTime()
    this.bindLogout()
  }
  bindLogin(){
    const form = this.window.document.querySelector('#login-form')
    if (!form) return
    form.addEventListener('submit', async e => {
      e.preventDefault()
      const data = Object.fromEntries(new this.window.FormData(form).entries())
      const user = { id: 'u_' + Date.now(), name: data.email, email: data.email }
      await this.app.login(user, 'token_' + Math.random())
      this.app.model.currentUser = user
      form.reset()
    })
  }
  bindLogTime(){
    const form = this.window.document.querySelector('#log-form')
    if (!form) return
    form.addEventListener('submit', async e => {
      e.preventDefault()
      const data = Object.fromEntries(new this.window.FormData(form).entries())
      data.minutes = Number(data.minutes)
      if (!data.userId || !data.projectId || !data.minutes) return
      await this.app.logTime({ id: 't_' + Date.now(), userId: data.userId, projectId: data.projectId, minutes: data.minutes })
      this.app.model.timeEntries.push(data)
      form.reset()
    })
  }
  bindLogout(){
    const btn = this.window.document.querySelector('#logout-btn')
    if (!btn) return
    btn.addEventListener('click', async e => {
      e.preventDefault()
      await this.app.logout(this.app.model.currentUser.id)
      this.app.model.currentUser = null
    })
  }
}
