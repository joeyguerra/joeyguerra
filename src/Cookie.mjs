import crypto from 'crypto'

class Cookie {
    #partitioned = false
    #secure = false
    #sameSite = null
    #secrets = []
    constructor(rawHeader, secrets = []) {
        if (!rawHeader) {
            return
        }
        Object.assign(this, Cookie.deserialize(rawHeader))
        this.#secrets = secrets
        if (this.Encrypted) {
            Object.assign(this, Cookie.deserialize(Cookie.decrypt(decodeURIComponent(this.Encrypted), this.#secrets)))
        }
    }

    get Partitioned() {
        return this.#partitioned
    }

    set Partitioned(value) {
        this.#partitioned = value
        if (value === true) {
            this.Secure = true
        }
    }

    get Secure() {
        return this.#secure
    }

    set Secure(value) {
        this.#secure = value
    }

    get SameSite() {
        return this.#sameSite
    }

    set SameSite(value) {
        if (['Strict', 'Lax', 'None'].includes(value)) {
            this.#sameSite = value
        }
        if (this.#sameSite === 'None') {
            this.Secure = true
        }
    }

    serialize() {
        if (this.Encrypted) {
            return this.#serializeEncryptedForOutgoing()
        }
        
        return Array.from((new Set(Object.keys(this).sort())).difference(new Set(Cookie.metaProperties.sort())))
            .map(key => `${key}=${encodeURIComponent(this[key])}`)
            .concat(
                Cookie.metaProperties.sort().reduce((acc, key) => {
                    if (this[key]) {
                        if (key === 'MaxAge') {
                            acc.push(`Max-Age=${this[key]}`)
                        } else if (key === 'Expires') {
                            acc.push(`${key}=${this[key].toUTCString()}`)
                        } else {
                            if (typeof this[key] === 'boolean') {
                                acc.push(key)
                            } else {
                                acc.push(`${key}=${this[key]}`)
                            }
                        }
                    }
                    return acc
                }, [])
            ).join('; ').trim() + ';'
    }

    serializeCookieJarOnly() {
        return Array.from((new Set(Object.keys(this).sort())).difference(new Set(Cookie.metaProperties.sort())))
            .map(key => `${key}=${this[key]}`)
            .join('; ').trim() + ';'
    }

    serializeCookiePropertiesOnly() {
        return Cookie.metaProperties.sort().reduce((acc, key) => {
            if (this[key]) {
                if (key === 'MaxAge') {
                    acc.push(`Max-Age=${this[key]}`)
                } else if (key === 'Expires') {
                    acc.push(`${key}=${this[key].toUTCString()}`)
                } else {
                    if (typeof this[key] === 'boolean') {
                        acc.push(key)
                    } else {
                        acc.push(`${key}=${this[key]}`)
                    }
                }
            }
            return acc
        }, []).join('; ').trim() + ';'
    }

    canSend(url) {
        if (this.Path) {
            if (url.pathname.startsWith(this.Path)) {
                return true
            }
            return false
        }

        if (this.Domain) {
            if (url.hostname.endsWith(this.Domain)) {
                return true
            }
            return false
        }

        if (this.Secure === true && !url.protocol.includes('https')) {
            return false
        }

        return true
    }

    hasExpired(date, now = new Date()) {
        if (this.MaxAge !== undefined) {
            if (this.MaxAge <= 0) {
                return true
            }
            return date > new Date(now.getTime() + this.MaxAge * 1000)
        }
        return this.Expires && date > this.Expires
    }
    
    #serializeEncryptedForOutgoing() {
        return `Encrypted=${encodeURIComponent(Cookie.encrypt(this.serializeCookieJarOnly(), this.#secrets[0]))}; ${this.serializeCookiePropertiesOnly()}`
    }

    static transformToTyped(name, value) {
        let v = value
        if (v && v[0] === '"' && v[v.length-1] === '"') v = v.slice(1, -1)
        if (!v || v.length === 0) return true
        if (name.toLowerCase() === 'expires') return new Date(v)
        if (v === 'true') return true
        if (v === 'false') return false
        if (!isNaN(v)) return Number(v)
        return v
    }

    static invalidCharactersRegex = /[#\$%&;'*+\-.^`|~]/
    static isValidCookieName(name) {
        return !Cookie.invalidCharactersRegex.test(name)
    }
    static invalidCharactersForValueRegex = /^"[^"\+\-\x00-\x1F\x7F\x80\xFF,;:~\[\]\\\s]*"$|^[^"\+\-\x00-\x1F\x7F\x80\xFF,;:~\[\]\\\s]+$/

    static isValidCookieValue(value) {
        return Cookie.invalidCharactersForValueRegex.test(value) && !/^([^"]*["!][^"]*)$/.test(value)
    }
    static metaProperties = ['Path', 'Expires', 'HttpOnly', 'Secure', 'Domain', 'SameSite', 'Partitioned', 'MaxAge']
    static deserialize(header) {
        if (!header || header.length === 0) return null

        const cookie = header.split('; ').map(part => part.replace(/;$/, '').trim())
            .reduce((acc, current) => {
                let [name, ...valueParts] = current.split('=')
                let value = valueParts.join('=')
                
                if (name === 'Max-Age') {
                    name = 'MaxAge'
                }

                if (!Cookie.isValidCookieName(name)) {
                    return acc
                }

                if (value && !Cookie.metaProperties.some(key => key.toLowerCase() === name.toLowerCase())
                    && !Cookie.isValidCookieValue(value)) {
                    return acc
                }
                acc[name] = Cookie.transformToTyped(name, decodeURIComponent(value))
                return acc
            }, {})
        return cookie
    }

    static secretForEncrypting(secret) {
        const buffer = Buffer.from(secret, 'utf8')
        if (buffer.length > 32) {
            return buffer.slice(0, 32)
        } else if (buffer.length < 32) {
            const paddedBuffer = Buffer.alloc(32)
            buffer.copy(paddedBuffer)
            return paddedBuffer
        }
        return buffer
    }

    static encrypt(value, secret) {
        const ivLength = 16
        const iv = crypto.randomBytes(ivLength)
        const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv)
        let encrypted = cipher.update(value, 'utf8', 'base64')
        encrypted += cipher.final('base64')
        const authTag = cipher.getAuthTag().toString('base64')
        return `${iv.toString('base64')}.${encrypted}.${authTag}`
    }

    static decrypt(encryptedValue, secrets) {
        const [iv, encrypted, authTag] = encryptedValue.split('.')
        if (!iv || !encrypted || !authTag) return null
        if (secrets.length === 0) {
            throw new Error('You must provide a secret to decrypt the cookie')
        }
        for (const secret of secrets) {
            const decipher = crypto.createDecipheriv('aes-256-gcm', secret, Buffer.from(iv, 'base64'))
            decipher.setAuthTag(Buffer.from(authTag, 'base64'))
            let decrypted = decipher.update(encrypted, 'base64', 'utf8')
            decrypted += decipher.final('utf8')
            return decrypted
        }
    }
}

class CookieHeader {
    constructor(name, value, options = {}) {
        this.name = name
        this.value = value
        this.options = options
    }
    serialize() {
        let serialized = `${this.name}=${this.value}`
        if (this.options.path) {
            serialized += `; Path=${this.options.path}`
        }
        if (this.options.maxAge) {
            serialized += `; Max-Age=${this.options.maxAge}`
        }
        if (!this.options.maxAge && this.options.expires) {
            serialized += `; Expires=${this.options.expires.toUTCString()}`
        }
        if (this.options.domain) {
            serialized += `; Domain=${this.options.domain}`
        }
        if (this.options.secure) {
            serialized += `; Secure`
        }
        if (this.options.httpOnly) {
            serialized += `; HttpOnly`
        }
        if (this.options.ArraysameSite) {
            serialized += `; SameSite=${this.options.ArraysameSite}`
        }
        return serialized
    }
}

export {
    Cookie,
    CookieHeader
}
