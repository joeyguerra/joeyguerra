import crypto from 'crypto'

class Cookie {
    constructor(name, value, options = {}) {
        this.name = name
        this.value = value
        this.path = options.path || '/'
        this.expires = options.expires ? options.expires.toUTCString() : ''
        this.httpOnly = options.httpOnly || false
        this.secure = options.secure || false
        this.domain = options.domain
        this.sameSite = options.sameSite
        this.partitioned = options.partitioned || false
    }

    toHeader() {
        return `${this.name}=${this.value}; Path=${this.path}; ${this.expires ? `Expires=${this.expires};` : ''
            } ${this.httpOnly ? 'HttpOnly;' : ''} ${this.secure ? 'Secure;' : ''} ${this.domain ? `Domain=${this.domain};` : ''
            } ${this.sameSite ? `SameSite=${this.sameSite};` : ''} ${this.partitioned ? 'Partitioned;' : ''
            }`.trim()
    }
}

class CookieManager {
    constructor(secrets) {
        if (!Array.isArray(secrets) || secrets.length === 0) {
            throw new Error('You must provide an array of secrets for key rotation')
        }
        this.secrets = secrets
        this.cookies = {}
        this.IV_LENGTH = 16
    }

    static isValidCookieName(name) {
        return /^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/.test(name)
    }

    static isValidCookieValue(value) {
        return /^[\u0021-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E\u0080-\u00FF]+$/.test(value) && !/["]/.test(value)
    }
    
    encrypt(value) {
        const iv = crypto.randomBytes(this.IV_LENGTH)
        const cipher = crypto.createCipheriv('aes-256-gcm', this.secrets[0], iv)

        let encrypted = cipher.update(value, 'utf8', 'base64')
        encrypted += cipher.final('base64')

        const authTag = cipher.getAuthTag().toString('base64')

        return `${iv.toString('base64')}.${encrypted}.${authTag}`
    }

    decrypt(encryptedValue) {
        const [iv, encrypted, authTag] = encryptedValue.split('.')
        if (!iv || !encrypted || !authTag) return null

        for (const secret of this.secrets) {
            try {
                const decipher = crypto.createDecipheriv('aes-256-gcm', secret, Buffer.from(iv, 'base64'))
                decipher.setAuthTag(Buffer.from(authTag, 'base64'))

                let decrypted = decipher.update(encrypted, 'base64', 'utf8')
                decrypted += decipher.final('utf8')

                return decrypted
            } catch (err) { }
        }
        return null
    }

    set(name, value, options = {}) {
        if (!CookieManager.isValidCookieName(name)) {
            throw new Error(`Invalid cookie name: ${name}`)
        }
        if (!CookieManager.isValidCookieValue(value)) {
            throw new Error(`Invalid cookie value for name "${name}"`)
        }

        const cookieValue = options.encrypt ? this.encrypt(value) : value
        this.cookies[name] = new Cookie(name, cookieValue, options)
    }

    get(name, decrypt = false) {
        const cookie = this.cookies[name]
        if (!cookie) return null

        return decrypt ? this.decrypt(cookie.value) : cookie.value
    }

    delete(name) {
        if (this.cookies[name]) {
            this.cookies[name].expires = 'Thu, 01 Jan 1970 00:00:00 GMT'
        }
    }

    list() {
        return this.cookies
    }

    generateHeaders() {
        return Object.values(this.cookies).map(cookie => cookie.toHeader())
    }
}

export {
    CookieManager,
    Cookie
}
