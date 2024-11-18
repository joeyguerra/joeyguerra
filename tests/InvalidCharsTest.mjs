import { test } from 'node:test'
import assert from 'node:assert/strict'

await test('Invalid Chars Test', async (t) => {
    await t.test('+ sign is invalid', async () => {
        const invalidCharactersForValueRegex = /^[\u0021-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E\u0080-\u00FF]+$/
        // const invalidCharactersForValueRegex = /[\!\+\(\)]+/
        Array.from(['!', '+', '(', ')']).forEach((char) => {
            console.log(`value${char}`, invalidCharactersForValueRegex.exec(`value${char}`))
            assert.equal(invalidCharactersForValueRegex.test(`value${char}`), true)
        })
    })
})