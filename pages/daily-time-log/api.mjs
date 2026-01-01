import TimeLogApp from './TimeLogApp.mjs'

const makeTimeLogApi = (baseDir, jwtSecret) => {
  const app = new TimeLogApp(baseDir, jwtSecret)

  return {
    async init(req, res){
      await app.init()
      res.json({ ok: true })
    },

    async snapshot(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const snapshot = await app.init()
      res.json(snapshot)
    },

    async login(req, res){
      const { email } = req.body
      if (!email) {
        res.statusCode = 400
        res.json({ error: 'email required' })
        return
      }
      const user = {
        id: 'u_' + Date.now(),
        name: email.split('@')[0],
        email,
        role: 'member'
      }
      const event = await app.createUser(user)
      const jwt = app.getJWT(user)
      await app.login(user, jwt)
      res.json({ token: jwt, user })
    },

    async logout(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const event = await app.logout(req.user.userId)
      res.json({ ok: true })
    },

    async createUser(req, res){
      if (!app.auth.requireAuth(req, res)) return
      if (!app.auth.requirePermission('manage_users')(req, res)) return
      const { email, role } = req.body
      const user = { id: 'u_' + Date.now(), name: email.split('@')[0], email, role: role || 'member' }
      const event = await app.createUser(user)
      res.json(event)
    },

    async createClient(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const event = await app.createClient(req.body.client)
      res.json(event)
    },

    async createProject(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const event = await app.createProject(req.body.project)
      res.json(event)
    },

    async createActivity(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const event = await app.createActivity(req.body.activity)
      res.json(event)
    },

    async assignRole(req, res){
      if (!app.auth.requireAuth(req, res)) return
      if (!app.auth.requirePermission('manage_users')(req, res)) return
      const event = await app.assignRole(req.body.userId, req.body.role)
      res.json(event)
    },

    async logTime(req, res){
      if (!app.auth.requireAuth(req, res)) return
      if (!app.auth.requirePermission('log_time')(req, res)) return
      const entry = { ...req.body.entry, userId: req.user.userId }
      const event = await app.logTime(entry)
      res.json(event)
    },

    async createGoal(req, res){
      if (!app.auth.requireAuth(req, res)) return
      const event = await app.createGoal(req.body.goal)
      res.json(event)
    },

    async restrictAccess(req, res){
      if (!app.auth.requireAuth(req, res)) return
      if (!app.auth.requirePermission('manage_users')(req, res)) return
      const event = await app.restrictAccess(req.body.userId, req.body.allowed)
      res.json(event)
    }
  }
}

export default makeTimeLogApi

