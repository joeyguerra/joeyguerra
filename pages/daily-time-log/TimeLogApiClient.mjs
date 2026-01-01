import MakeObservableList from '../webapp/MakeObservableList.mjs'
import MakeKeyValueObservable from '../webapp/MakeKeyValueObservable.mjs'

class TimeLogApiClient {
  constructor(window, apiBase = '/api/time-log'){
    this.window = window
    this.apiBase = apiBase
    this.token = this.window.localStorage?.getItem('timeLogToken')
    this.model = MakeKeyValueObservable({
      currentUser: null,
      users: MakeObservableList(),
      clients: MakeObservableList(),
      projects: MakeObservableList(),
      activities: MakeObservableList(),
      timeEntries: MakeObservableList(),
      roles: MakeKeyValueObservable({}),
      sessions: MakeKeyValueObservable({})
    })
  }

  async request(method, path, body = null){
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(this.apiBase + path, opts)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `${res.status}: ${res.statusText}`)
    return data
  }

  async init(){
    if (!this.token) return
    const snapshot = await this.request('GET', '/snapshot')
    snapshot.users?.forEach(u => this.model.users.push(u))
    snapshot.clients?.forEach(c => this.model.clients.push(c))
    snapshot.projects?.forEach(p => this.model.projects.push(p))
    snapshot.timeEntries?.forEach(e => this.model.timeEntries.push(e))
    if (snapshot.currentUser) this.model.currentUser = snapshot.currentUser
    if (snapshot.roles) Object.assign(this.model.roles, snapshot.roles)
    return snapshot
  }

  async login(email){
    const result = await this.request('POST', '/login', { email })
    this.token = result.token
    this.window.localStorage?.setItem('timeLogToken', this.token)
    this.model.currentUser = result.user
    this.model.users.push(result.user)
    return result
  }

  async logout(){
    await this.request('POST', '/logout', {})
    this.token = null
    this.window.localStorage?.removeItem('timeLogToken')
    this.model.currentUser = null
  }

  async createUser(email, role = 'member'){
    const result = await this.request('POST', '/users', { email, role })
    this.model.users.push(result)
    return result
  }

  async createClient(client){
    const result = await this.request('POST', '/clients', { client })
    this.model.clients.push(client)
    return result
  }

  async createProject(project){
    const result = await this.request('POST', '/projects', { project })
    this.model.projects.push(project)
    return result
  }

  async createActivity(activity){
    const result = await this.request('POST', '/activities', { activity })
    return result
  }

  async assignRole(userId, role){
    const result = await this.request('POST', '/roles', { userId, role })
    this.model.roles[userId] = role
    return result
  }

  async logTime(entry){
    const allowed = this.model.access?.[entry.userId]
    if (allowed) {
      const ok = allowed.projects?.includes(entry.projectId)
      if (!ok) throw new Error('user not allowed for project')
    }
    const result = await this.request('POST', '/time-entries', { entry })
    this.model.timeEntries.push(entry)
    return result
  }

  async createGoal(goal){
    const result = await this.request('POST', '/goals', { goal })
    if (!this.model.goals) this.model.goals = MakeObservableList()
    this.model.goals.push(goal)
    return result
  }

  async restrictAccess(userId, allowed){
    const result = await this.request('POST', '/access', { userId, allowed })
    if (!this.model.access) this.model.access = MakeKeyValueObservable({})
    this.model.access[userId] = allowed
    return result
  }

  isLoggedIn(){
    return !!this.model.currentUser
  }

  isAdmin(){
    return this.model.currentUser && this.model.currentUser.role === 'admin'
  }

  isManager(){
    return this.model.currentUser && this.model.currentUser.role === 'manager'
  }
}

export default TimeLogApiClient

