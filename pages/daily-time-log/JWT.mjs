import crypto from 'crypto'

const sign = (payload, secret, expiresIn = 86400) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const claims = { ...payload, iat: now, exp: now + expiresIn }
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url')
  return `${header}.${body}.${sig}`
}

const verify = (token, secret) => {
  try {
    const [header, body, sig] = token.split('.')
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url')
    if (sig !== expected) throw new Error('invalid signature')
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('token expired')
    return payload
  } catch (e) {
    return null
  }
}

const decode = token => {
  try {
    const [, body] = token.split('.')
    return JSON.parse(Buffer.from(body, 'base64url').toString())
  } catch {
    return null
  }
}

export { sign, verify, decode }
