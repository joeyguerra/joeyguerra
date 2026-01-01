import { sign, verify, decode } from './JWT.mjs'

const PERMISSIONS = {
  admin: ['view_daily_time_log', 'manage_users', 'view_team_entries', 'log_time'],
  manager: ['view_daily_time_log', 'view_team_entries', 'log_time'],
  member: ['view_daily_time_log', 'log_time']
}

class AuthService {
  constructor(secret = process.env.JWT_SECRET || 'dev-secret-key'){
    this.secret = secret
  }

  createToken(user){
    const role = user.role || 'member'
    return sign({
      userId: user.id,
      name: user.name,
      email: user.email,
      role,
      permissions: PERMISSIONS[role] || PERMISSIONS.member
    }, this.secret)
  }

  verifyToken(token){
    return verify(token, this.secret)
  }

  decodeToken(token){
    return decode(token)
  }

  hasPermission(token, permission){
    const payload = this.verifyToken(token)
    if (!payload) return false
    return payload.permissions?.includes(permission) || false
  }

  requireAuth(req, res, next){
    const auth = req.headers.authorization?.split(' ')[1]
    if (!auth) {
      res.statusCode = 401
      res.end(JSON.stringify({ error: 'missing token' }))
      return false
    }
    const payload = this.verifyToken(auth)
    if (!payload) {
      res.statusCode = 401
      res.end(JSON.stringify({ error: 'invalid token' }))
      return false
    }
    req.user = payload
    return true
  }

  requirePermission(permission){
    return (req, res, next) => {
      if (!req.user || !req.user.permissions?.includes(permission)) {
        res.statusCode = 403
        res.end(JSON.stringify({ error: 'insufficient permissions' }))
        return false
      }
      return true
    }
  }
}

export default AuthService
export { PERMISSIONS }
