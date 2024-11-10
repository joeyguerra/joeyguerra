import crypto from 'node:crypto'
import Cookie from './Cookie.mjs'

class Session {
  constructor(cookieHeader = '', keys = []) {
    this.cookie = new Cookie(cookieHeader, keys)
    this.sessions = {}
  }

  createSession(data, options = {}) {
    const sessionId = crypto.randomBytes(16).toString('hex')
    this.sessions[sessionId] = data
    this.cookie.set('session_id', sessionId, { ...options, signed: true, encrypted: true })
    return sessionId
  }

  getSession() {
    const sessionId = this.cookie.get('session_id')
    if (sessionId && this.cookie.verify(sessionId)) {
      const decryptedSessionId = this.cookie.decrypt(sessionId)
      return this.sessions[decryptedSessionId] || null
    }
    return null
  }

  deleteSession() {
    const sessionId = this.cookie.get('session_id')
    if (sessionId && this.cookie.verify(sessionId)) {
      const decryptedSessionId = this.cookie.decrypt(sessionId)
      delete this.sessions[decryptedSessionId]
      this.cookie.set('session_id', '', { 'Max-Age': 0 })
    }
  }

  toString() {
    return this.cookie.toString()
  }
}

// Example usage:
const cookieHeader = 'session=abc123 user=JohnDoe'
const keys = ['oldSecretKey', 'newSecretKey']
const sessionManager = new Session(cookieHeader, keys)

// Create a new session
const sessionId = sessionManager.createSession({ userId: 1 }, { Secure: true, HttpOnly: true, 'Max-Age': 3600 })
console.log(`Session ID: ${sessionId}`)

// Retrieve the session
const sessionData = sessionManager.getSession()
console.log(`Session Data: ${JSON.stringify(sessionData)}`)

// Delete the session
sessionManager.deleteSession()
console.log(`Session after deletion: ${JSON.stringify(sessionManager.getSession())}`)

// Output the cookie string
console.log(sessionManager.toString())