import crypto from 'crypto'

class Cookie {
    constructor(options = {}) {
        this.httpOnly = options.httpOnly ?? true
        this.secure = options.secure ?? true
        this.sameSite = options.sameSite ?? 'Strict'

        if (options.domain) {
            if (!options.domain.includes('.')) {
                throw new Error(`Invalid domain: ${options.domain}`)
            }
            this.domain = options.domain
        }
        if (options.expires) {
            if (!(options.expires instanceof Date)) {
                throw new Error(`Invalid expires: ${options.expires}`)
            }
            this.expires = options.expires
        }

        if (options.maxAge) {
            if (!Number.isInteger(options.maxAge)) {
                throw new Error(`Invalid maxAge: ${options.maxAge}`)
            }
            this.maxAge = options.maxAge
        }

        if (options.path) {
            this.path = options.path
        }

        this.jar = new Map()
    }
    toString() {
        return `${Array.from(this.jar.keys()).map(key => `${key}=${this.jar.get(key)}`).join('; ')}`
    }
}

class CookieManager {
    constructor(activeKey, keyRotation = []) {
        this.activeKey = activeKey
        this.keyRotation = keyRotation
        this.sessionStore = new Map()
    }
    toString() {
        console.log(this)
        return this
    }
    setCookie(name, value, options = {}) {
        if (!this.isValidCookieName(name)) {
            throw new Error(`Invalid cookie name: ${name}`)
        }

        if (!this.isValidCookieValue(value)) {
            throw new Error(`Invalid cookie value: ${value}`)
        }

        const defaults = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        }
        const cookie = { ...defaults, ...options, value }
        return cookie
    }

    toCamelCase(value) {
        return value.replace(/^([a-z])/gi, (match) => {
            return match.toLowerCase()
        });
    }
    #isSpecialProperty(name) {
        return ['secure', 'httponly', 'samesite', 'expires', 'max-age', 'domain', 'path'].includes(name.toLowerCase())
    }
    #setSpecialProperties(name, value, cookie) {
        switch (name.toLowerCase()) {
            case 'secure':
                cookie.secure = true
                break
            case 'httponly':
                cookie.httpOnly = true
                break
            case 'samesite':
                cookie.sameSite = decodeURIComponent(value)
                break
            case 'expires':
                cookie.expires = new Date(value)
                break
            case 'max-age':
                cookie.maxAge = parseInt(value)
                break
            case 'domain':
                cookie.domain = decodeURIComponent(value)
                break
            case 'path':
                cookie.path = decodeURIComponent(value)
                break
            default:
                break
        }

        return cookie
    }

    #getJarValue(name, value) {
        if (!this.isValidCookieName(name) || !this.isValidCookieValue(value)) {
            return null
        }
        return decodeURIComponent(value)
    }

    parseCookies(cookieHeader) {
        if (!cookieHeader) return new Cookie()

        if (this.isSigned(cookieHeader)) {
            const [input, signature] = cookieHeader.split('.')
            const cookie = this.parseCookies(input)
            const expectedInput = this.stringForVerifying(cookie.jar)
            console.log('expectedInput', expectedInput)
            if (this.verifySignature(expectedInput, signature)) {
                return cookie
            } else {
                throw new Error('Invalid signature')
            }
        }

        const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
        const cookieObj = {}

        const cookie = cookies.reduce((acc, cookie) => {
            const [name, value] = cookie.split('=')
            if (this.#isSpecialProperty(name)) {
                acc = this.#setSpecialProperties(name, value, acc)
            } else {
                const jarValue = this.#getJarValue(name, value)
                if (jarValue) {
                    acc.jar.set(name, jarValue)
                }
            }
            return acc
        }, new Cookie())

        return cookie
    }

    isSigned(value) {
        return value.includes('.')
    }

    isValidCookieName(name) {
        const validNamePattern = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/
        return validNamePattern.test(name)
    }

    isValidCookieValue(value) {
        const validValuePattern = /^[\x21-\x7E\x20]+$/
        return validValuePattern.test(value)
    }

    signCookie(cookie) {
        console.log('cookie', cookie)
        cookie.signature = this.signWithKey(cookie, this.activeKey)
        return cookie
    }

    signWithKey(cookie, key) {
        const hmac = crypto.createHmac('sha256', key)
        const input = Array.from(cookie.jar.keys()).sort().map(key => `${key}=${cookie.jar.get(key)}`).join(';')
        return hmac.update(input).digest('hex')
    }

    stringForVerifying(obj) {
        return Array.from(obj.keys()).sort().map(key => `${key}=${obj.get(key)}`).join(';')
    }

    verifySignature(input, signature) {
        const validSignature = crypto.createHmac('sha256', this.activeKey).update(input).digest('hex')

        if (signature === validSignature) {
            return true
        }

        for (const oldKey of this.keyRotation) {
            const oldSignature = crypto.createHmac('sha256', oldKey).update(input).digest('hex')
            if (signature === oldSignature) {
                return true
            }
        }

        return false
    }

    getSessionFromRequest(cookieHeader) {
        const sessionId = this.getCookieFromRequest('session', cookieHeader)
        if (!sessionId) return null
        return this.getSessionCookie(sessionId)
    }

    getCookieFromRequest(name, cookieHeader) {
        const cookies = this.parseCookies(cookieHeader)
        return cookies[name] || null
    }
}

export {
    CookieManager,
    Cookie
}