import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { Cookie } from '../src/Cookie.mjs'

await test('Cookie', async (t) => {
  await t.test('Deserialization', async (t) => {
    await t.test('Single name/value pair', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj')
      assert.equal(actual.sessionId, '33877898jjdiidj')
    })

    await t.test('Multiple name/value pairs', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; email=test@test.com;')
      assert.equal(actual.sessionId, '33877898jjdiidj')
      assert.equal(actual.email, 'test@test.com')
    })

    await t.test('Boolean attributes in a cookie', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Secure; HttpOnly;')
      assert.equal(actual.sessionId, '33877898jjdiidj')
      assert.equal(actual.Secure, true)
      assert.equal(actual.HttpOnly, true)
    })

    await t.test('Numbers in a cookie', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Max-Age=3600;')
      assert.equal(actual.sessionId, '33877898jjdiidj')
      assert.equal(actual.MaxAge, 3600)
    })

    await t.test('Double quoting values is allowed', () => {
      const actual = new Cookie('sessionId="33877898jjdiidj";')
      assert.equal(actual.sessionId, '33877898jjdiidj')
    })

    await t.test('Semicolons in name result in a noop', () => {
      const actual = new Cookie('session;Id=33877898jjdiidj;')
      assert.equal(actual['session;Id'], undefined)
      assert.notEqual(Object.values(actual).some(value => value === '33877898jjdiidj'), true)
    })

    await t.test('Invalid characters in names result in a noop essentially', () => {
      const listOfInvalidCharactersForName = ['#', '$', '%', '&', "'", '*', '+', '-', '.', '^', '`', '|', '~']
      listOfInvalidCharactersForName.forEach(char => {
        const actual = new Cookie(`sessionId=33877898jjdiidj; invalid${char}=value;`)
        assert.equal(actual.sessionId, '33877898jjdiidj')
        assert.equal(actual[`invalid${char}`], undefined)
      })
    })

    await t.test('Control characters are not allowed in values', () => {
      const listOfInvalidCharactersForValue = [`\u0021`, `\u002B`, `\u002D`, `\u003A`, `\u005B`, `\u005D`, `\u007E`, `\u0080`, `\u00FF`, '"', "!"]
      listOfInvalidCharactersForValue.forEach(char => {
        const actual = new Cookie(`sessionId=33877898jjdiidj; invalid=value${char};`)
        assert.equal(actual.sessionId, '33877898jjdiidj')
        assert.equal(actual.invalid, undefined)
      })
    })

    await t.test('Check an expired cookie', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Expires=Thu, 01 Jan 1970 00:00:00 GMT;')
      assert.equal(actual.sessionId, '33877898jjdiidj')
      assert.equal(actual.Expires.getTime(), 0)
      assert.equal(actual.hasExpired(new Date()), true)
    })

    await t.test('Check an unexpired cookie', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Expires=Thu, 02 Jan 2022 00:00:00 GMT;')
      assert.equal(actual.hasExpired(new Date('Thu, 01 Jan 2022 00:00:00 GMT')), false)
    })

    await t.test('Check an unexpired cookie with Max-Age', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Max-Age=3600;')
      assert.equal(actual.hasExpired(new Date(Date.now() + 3600000)), false)
    })

    await t.test('Max-Age = -1 means the cookie should be deleted', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Max-Age=-1;')
      assert.equal(actual.hasExpired(new Date()), true)
    })

    await t.test('Max-Age negative number means the cookie should be deleted', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Max-Age=-100;')
      assert.equal(actual.hasExpired(new Date()), true)
    })

    await t.test('Max-Age = 0 means the cookie should be deleted', () => {
      const actual = new Cookie('sessionId=33877898jjdiidj; Max-Age=0;')
      assert.equal(actual.hasExpired(new Date()), true)
    })
  })

  await t.test('Serialization', async (t) => {
    await t.test('Single name/value pair', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      const actual = cookie.serialize()
      assert.equal(actual, 'sessionId=33877898jjdiidj;')
    })

    await t.test('Multiple name/value pairs', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.email = 'luna@cats.com'
      const actual = cookie.serialize()
      assert.equal(actual, `email=${encodeURIComponent('luna@cats.com')}; sessionId=33877898jjdiidj;`)
    })
  })

  await t.test('Cookie Protocol Compliance', async (t) => {
    await t.test('Setting HttpOnly', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.HttpOnly = true
      const actual = cookie.serialize()
      assert.match(actual, /HttpOnly/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; HttpOnly;')
    })

    await t.test('Setting Secure', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Secure = true
      const actual = cookie.serialize()
      assert.match(actual, /Secure/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Secure;')
    })

    await t.test('If Secure, then cookie can only be sent to a URL with https protocol', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Secure = true
      const actual = cookie.serialize()
      assert.equal(cookie.canSend(new URL('http://localhost')), false)
      assert.equal(cookie.canSend(new URL('https://localhost')), true)
    })

    await t.test('Setting SameSite', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.SameSite = 'Strict'
      const actual = cookie.serialize()
      assert.match(actual, /SameSite=Strict/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; SameSite=Strict;')
    })

    await t.test('Setting SameSite=None MUST set Secure', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.SameSite = 'None'
      const actual = cookie.serialize()
      assert.match(actual, /Secure/)
      assert.match(actual, /SameSite=None/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; SameSite=None; Secure;')
    })

    await t.test('Setting Domain', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Domain = 'example.com'
      const actual = cookie.serialize()
      assert.match(actual, /Domain=example.com/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Domain=example.com;')
    })

    await t.test('If Domain is set, then the cookie can only be sent to that domain', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Domain = 'exampl.com'
      const actual = cookie.serialize()
      assert.equal(cookie.canSend(new URL('http://example.com')), false)
      assert.equal(cookie.canSend(new URL('http://exampl.com')), true)
    })

    await t.test('Setting Path', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Path = '/'
      const actual = cookie.serialize()
      assert.match(actual, /Path=\//)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Path=/;')
    })

    await t.test("If Path is set, then a cookie can only be sent in a response to a request with a URL path that is a prefix of the cookie's Path attribute", () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj; Path=/example')
      const actual = cookie.serialize()
      assert.equal(cookie.canSend(new URL('/notexample', 'http://localhost')), false)
      assert.match(actual, /Path=\/example/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Path=/example;')
    })

    await t.test('canSend only to the Path when it is set', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj; Path=/example')
      const actual = cookie.serialize()
      assert.equal(cookie.canSend(new URL('/example', 'http://localhost')), true)
      assert.equal(cookie.canSend(new URL('/example/other', 'http://localhost')), true)
      assert.equal(cookie.canSend(new URL('/notexample', 'http://localhost')), false)
    })
    
    await t.test('Setting MaxAge', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.MaxAge = 36001
      const actual = cookie.serialize()
      assert.match(actual, /Max-Age=3600/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Max-Age=36001;')
    })

    await t.test('Serialize cookie properties only', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj; Max-Age=3600; Expires=Sun, 02 Jan 2022 00:00:00 GMT; SameSite=None; Secure;')
      const actual = cookie.serializeCookiePropertiesOnly()
      assert.equal(actual, 'Expires=Sun, 02 Jan 2022 00:00:00 GMT; Max-Age=3600; SameSite=None; Secure;')
    })

    await t.test('Setting Expires', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Expires = new Date('Sun, 02 Jan 2022 00:00:00 GMT')
      const actual = cookie.serialize()
      assert.match(actual, /Expires=Sun, 02 Jan 2022 00:00:00 GMT/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Expires=Sun, 02 Jan 2022 00:00:00 GMT;')
    })

    await t.test('Setting partitioned', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.Partitioned = true
      const actual = cookie.serialize()
      assert.match(actual, /Partitioned/)
      assert.equal(actual, 'sessionId=33877898jjdiidj; Partitioned; Secure;')
    })
  })

  await t.test('Security', async (t) => {

    await t.test('Using a secret whose buffer length is > 32 bytes should truncate it to 32', () => {
      const actual = Cookie.secretForEncrypting('this is a secret that is longer than 32 bytes')
      assert.equal(actual.length, 32)
    })

    await t.test('Using a secret whose buffer length is exactly 32 bytes should not change it', () => {
      let secret = ''
      while (Buffer.from(secret, 'utf-8').length < 32) {
        secret += crypto.randomInt(0, 9).toString()
      }
      const actual = Cookie.secretForEncrypting(secret)
      assert.equal(actual.length, 32)
    })

    await t.test('Encrypted cookie header should deserialize into a Cookie object', () => {
      const unencryptedHeader = `sessionId=${encodeURIComponent('2883749823jjasdoiij-asddiikj')}; email=${encodeURIComponent('luna@cats.com')}; HttpOnly; Secure;`
      const incoming = `Encrypted=${encodeURIComponent('sig0o4psDcuqZtSsg3M7pw==.EQMewYHw712viAwrsRb+ucjGlrMF7MM5fvZbDYo3oMIPBUzzipJlTmLsJVCWzHWxrnkaMlh/JEak0+ui.ip7OkWeVx/94H9pNcm9/ug==')}; HttpOnly; Secure;`
      const actual = new Cookie(incoming, [Cookie.secretForEncrypting('such a secret')])
      const expected = new Cookie(unencryptedHeader, [Cookie.secretForEncrypting('such a secret')])
      delete actual.Encrypted 
      assert.deepEqual(actual, expected)
    })

    await t.test('An encrypted cookie should serialize to a cookie header with a name/value pair of Encrypted=<encrypted string>', () => {
      const incoming = `Encrypted=${encodeURIComponent('sig0o4psDcuqZtSsg3M7pw==.EQMewYHw712viAwrsRb+ucjGlrMF7MM5fvZbDYo3oMIPBUzzipJlTmLsJVCWzHWxrnkaMlh/JEak0+ui.ip7OkWeVx/94H9pNcm9/ug==')}; HttpOnly; Secure;`
      const cookie = new Cookie(incoming, [Cookie.secretForEncrypting('such a secret')])
      const actual = cookie.serialize()
      assert.match(actual, /^Encrypted=.+; HttpOnly; Secure;$/)
    })

    await t.test('Throws an exception if secrets are not set', () => {
      assert.throws((e) => new Cookie(`sessionId=33877898jjdiidj; Encrypted=${encodeURIComponent('sig0o4psDcuqZtSsg3M7pw==.EQMewYHw712viAwrsRb+ucjGlrMF7MM5fvZbDYo3oMIPBUzzipJlTmLsJVCWzHWxrnkaMlh/JEak0+ui.ip7OkWeVx/94H9pNcm9/ug==')};`),
        { name: 'Error', message: 'You must provide a secret to decrypt the cookie' })
    })

  })

  await t.test('Setting Cookie Attributes', async (t) => {
    await t.test('Can set a cookie attribute and it serializes correctly for adding to the Response header', () => {
      const cookie = new Cookie('sessionId=33877898jjdiidj;')
      cookie.sessionId = 'a new session id'
      cookie.theme = 'deep blue'
      const actual = cookie.serialize()
      assert.equal(actual, `sessionId=${encodeURIComponent('a new session id')}; theme=${encodeURIComponent('deep blue')};`)
    })

    await t.test('Can read attributes set via the header', () => {
      const cookie = new Cookie(`sessionId=33877898jjdiidj; theme=${encodeURIComponent('deep blue')};`)
      assert.equal(cookie.theme, 'deep blue')
    })
  })
})
