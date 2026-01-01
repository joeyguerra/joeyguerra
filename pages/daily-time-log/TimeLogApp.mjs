import { makeEventStore } from './EventStore.mjs'
import AuthService from './AuthService.mjs'

class TimeLogApp {
  constructor(baseDir, jwtSecret = process.env.JWT_SECRET || 'dev-secret-key'){
    this.store = makeEventStore({ baseDir })
    this.auth = new AuthService(jwtSecret)
  }

  async init(){
    const events = await this.store.readAll()
    const snapshot = await this.store.project({
      'user.created': (s, e) => {
        if (!s.users) s.users = []
        s.users.push(e.user)
      },
      'user.loggedIn': (s, e) => {
        if (!s.sessions) s.sessions = {}
        s.currentUser = e.user
        s.sessions[e.user.id] = { loginAt: e.ts, token: e.token }
      },
      'user.loggedOut': (s, e) => {
        s.currentUser = null
        delete s.sessions?.[e.userId]
      },
      'client.created': (s, e) => {
        if (!s.clients) s.clients = []
        s.clients.push(e.client)
      },
      'project.created': (s, e) => {
        if (!s.projects) s.projects = []
        s.projects.push(e.project)
      },
      'activity.created': (s, e) => {
        if (!s.activities) s.activities = []
        s.activities.push(e.activity)
      },
      'time.logged': (s, e) => {
        if (!s.timeEntries) s.timeEntries = []
        s.timeEntries.push(e.entry)
      },
      'role.assigned': (s, e) => {
        if (!s.roles) s.roles = {}
        s.roles[e.userId] = e.role
      },
      'goal.created': (s, e) => {
        if (!s.goals) s.goals = []
        s.goals.push(e.goal)
      },
      'access.restricted': (s, e) => {
        if (!s.access) s.access = {}
        s.access[e.userId] = e.allowed
      }
    })
    return snapshot
  }

  async createUser(user){
    return this.store.append({ type: 'user.created', user })
  }

  async createClient(client){
    return this.store.append({ type: 'client.created', client })
  }

  async createProject(project){
    return this.store.append({ type: 'project.created', project })
  }

  async createActivity(activity){
    return this.store.append({ type: 'activity.created', activity })
  }

  async assignRole(userId, role){
    return this.store.append({ type: 'role.assigned', userId, role })
  }

  async logTime(entry){
    return this.store.append({ type: 'time.logged', entry })
  }

  async createGoal(goal){
    return this.store.append({ type: 'goal.created', goal })
  }

  async restrictAccess(userId, allowed){
    return this.store.append({ type: 'access.restricted', userId, allowed })
  }

  async login(user, token){
    return this.store.append({ type: 'user.loggedIn', user, token })
  }

  async logout(userId){
    return this.store.append({ type: 'user.loggedOut', userId })
  }

  getJWT(user){
    return this.auth.createToken(user)
  }
}

export default TimeLogApp
