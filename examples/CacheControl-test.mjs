import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {getNextRequestTime} from '../lib/CacheControl.mjs'

describe('CacheControl', () => {
    it('should parse cache-control header and calculate the next time to make a request', async () => {
        const cacheControl = 'public, max-age=300'
        const now = Date.now()
        const actual = getNextRequestTime(cacheControl, now)
        const expected = now + (300 * 1000)
        assert.strictEqual(actual, expected)
    })
    it('should return now if there is no max-age', async () => {
        const cacheControl = 'public'
        const now = Date.now()
        const actual = getNextRequestTime(cacheControl, now)
        const expected = now
        assert.strictEqual(actual, expected)
    })
    it('should make a request if past the TTL', async () => {
        const cacheControl = 'public, max-age=300'
        const now = Date.now()
        const theFuture = now + (300 * 1000) + 1
        const nextRequestTime = getNextRequestTime(cacheControl, now)
        const actual = nextRequestTime < theFuture
        const expected = true
        assert.strictEqual(actual, expected)
    })
    it('shouild not make a reuqest if before the TTL', async () => {
        const cacheControl = 'public, max-age=300'
        const now = Date.now()
        const theFuture = now + (300 * 1000) - 1
        const nextRequestTime = getNextRequestTime(cacheControl, now)
        const actual = nextRequestTime > theFuture
        const expected = true
        assert.strictEqual(actual, expected)
    })
})