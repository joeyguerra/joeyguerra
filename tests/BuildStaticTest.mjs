import test from 'node:test'
import assert from 'node:assert/strict'
import { BaseHref } from '../lib/BaseHref.mjs'

test('Base Href', async (t) => {
    await t.test('should return the correct base href', (t) => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html', 'https://example.com')
        const blogIndex = new BaseHref('blog/index.html', 'https://example.com')
        const home = new BaseHref('calendar.html', 'https://example.com')
        assert.equal(blogPost.href, 'https://example.com/blog/2024')
        assert.equal(blogIndex.href, 'https://example.com/blog')
        assert.equal(home.href, 'https://example.com')
    })
    await t.test('should handle undefined default base href', (t) => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html')
        const blogIndex = new BaseHref('blog/index.html')
        const home = new BaseHref('calendar.html')
        assert.equal(blogPost.href, '/blog/2024')
        assert.equal(blogIndex.href, '/blog')
        assert.equal(home.href, '/')
    })
    await t.test('should handle root base href', (t) => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html', '/')
        const blogIndex = new BaseHref('blog/index.html', '/')
        const home = new BaseHref('calendar.html', '/')
        assert.equal(blogPost.href, '/blog/2024')
        assert.equal(blogIndex.href, '/blog')
        assert.equal(home.href, '/')
    })
    await t.test('should handle root base href with trailing slash', (t) => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html', '/')
        const blogIndex = new BaseHref('blog/index.html', '/')
        const home = new BaseHref('calendar.html', '/')
        assert.equal(blogPost.href, '/blog/2024')
        assert.equal(blogIndex.href, '/blog')
        assert.equal(home.href, '/')
    })
    await t.test('should handle null default base href', t => {
        const blogIndex = new BaseHref('blog/index.html', null)
        assert.equal(blogIndex.href, '/blog')
    })
    await t.test('should handle a context for the base href', t => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html', 'joeyguerra')
        assert.equal(blogPost.href, '/joeyguerra/blog/2024')
    })
    await t.test('should handle a context for the base href with a trailing slash', t => {
        const blogPost = new BaseHref('blog/2024/strategic-planning.html', 'joeyguerra/')
        assert.equal(blogPost.href, '/joeyguerra/blog/2024')
    })
})
