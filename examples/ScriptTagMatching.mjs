import test from 'node:test'
import assert from 'node:assert/strict'

await test('ScriptTagMatching', async t => {
    await t.test('script matches with and without other attributes in the script element', async () => {
        const texts = [
            '<script async src="webapp/todos.mjs"></script>',
            '<script src="webapp/todos.mjs" async></script>',
            '<script src="webapp/todos.mjs"></script>',
        ]
        for (const text of texts) {
            const actual = text.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)
            assert.deepEqual(actual[1], 'webapp/todos.mjs', text)
        }
    })
})