import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { CookieManager, Cookie } from '../src/CookieManager.mjs'

const secret1 = crypto.randomBytes(32)
const secret2 = crypto.randomBytes(32)
const secrets = [secret1, secret2]
const cookieManager = new CookieManager(secrets)

test('CookieManager: set() should throw error on invalid cookie name', () => {
    assert.throws(() => cookieManager.set('invalid;name', 'value'), {
        message: 'Invalid cookie name: invalid;name',
    })
})

test('CookieManager: set() should throw error on invalid cookie value', () => {
    assert.throws(
        () => cookieManager.set('name', 'invalid;value'),
        new Error('Invalid cookie value for name "name"')
    )
})

test('CookieManager: set() should create a valid, unencrypted cookie', () => {
    cookieManager.set('testCookie', 'testValue', { path: '/', httpOnly: true })
    const cookies = cookieManager.list()
    assert.equal(cookies.testCookie.value, 'testValue')
    assert.equal(cookies.testCookie.path, '/')
    assert.equal(cookies.testCookie.httpOnly, true)
})

test('CookieManager: get() should retrieve a cookie value without decryption', () => {
    assert.equal(cookieManager.get('testCookie'), 'testValue')
})

test('CookieManager: delete() should set the expiration date to the past', () => {
    cookieManager.delete('testCookie')
    const cookies = cookieManager.list()
    assert.equal(cookies.testCookie.expires, 'Thu, 01 Jan 1970 00:00:00 GMT')
})

test('CookieManager: set() should create an encrypted cookie', () => {
    cookieManager.set('encryptedCookie', 'secretData', { encrypt: true })
    const cookies = cookieManager.list()
    assert.ok(cookies.encryptedCookie.value.includes('.'))
    assert.notEqual(cookies.encryptedCookie.value, 'secretData')
})

test('CookieManager: get() should retrieve decrypted cookie value', () => {
    assert.equal(cookieManager.get('encryptedCookie', true), 'secretData')
})

test('CookieManager: generateHeaders() should generate correct headers', () => {
    cookieManager.set('headerCookie', 'headerValue', {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        domain: 'example.com',
    })
    const headers = cookieManager.generateHeaders()
    const expectedHeader = headers.find(header => header.startsWith('headerCookie=headerValue'))
    assert.match(expectedHeader, /Path=\//)
    assert.match(expectedHeader, /Secure/)
    assert.match(expectedHeader, /HttpOnly/)
    assert.match(expectedHeader, /SameSite=Strict/)
    assert.match(expectedHeader, /Domain=example.com/)
})


test('CookieManager: isValidCookieValue() should return true for valid characters', () => {
  assert.ok(CookieManager.isValidCookieValue('simpleValue'))
  assert.ok(CookieManager.isValidCookieValue('Valid123'))
  assert.ok(CookieManager.isValidCookieValue('!#$%&\'*+-./:<=>?@[]^_`{|}~'))
})

test('CookieManager: isValidCookieValue() should return false for invalid characters', () => {
  assert.equal(CookieManager.isValidCookieValue('invalid;value'), false) // Contains semicolon
  assert.equal(CookieManager.isValidCookieValue('invalid,value'), false) // Contains comma
  assert.equal(CookieManager.isValidCookieValue('invalid value'), false) // Contains space
  assert.equal(CookieManager.isValidCookieValue('invalid\\value'), false) // Contains backslash
  assert.equal(CookieManager.isValidCookieValue('value"with"quotes'), false) // Contains double quotes
})

test('CookieManager: isValidCookieValue() should return false for control characters', () => {
  for (let i = 0; i <= 31; i++) {
    const controlChar = String.fromCharCode(i)
    assert.equal(CookieManager.isValidCookieValue(`invalid${controlChar}value`), false)
  }
})

test('CookieManager: isValidCookieValue() should return true for Latin-1 Supplement characters', () => {
  for (let i = 128; i <= 255; i++) {
    const latinChar = String.fromCharCode(i)
    assert.ok(CookieManager.isValidCookieValue(`value${latinChar}test`))
  }
})
