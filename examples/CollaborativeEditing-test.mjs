
import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {CollaborativeEditor, Client, Offset} from '../lib/CollaborativeEditor.mjs'
import { makeKeyValueObservable, ObservableArray } from '../lib/Observable.mjs'

globalThis.window = new JSDOM(`<!doctype html><html><header></header><body><div contenteditable="true" class="about"></div></body></html>`).window
globalThis.document = window.document


describe('CollaborativeEditor', () => {
    it('should accept typing in contendeditable div and map it to the model', async () => {
        const model = makeKeyValueObservable({
            text: ''
        })
        const editor = new CollaborativeEditor(window, model, document.querySelector('.about'))
        editor.start()
        const nerf = new Client('nerf', editor, window)
        const interval = editor.startSimulator(nerf)
        const c1 = new Client('c1', editor, window)
        c1.cursorOn(editor.div.firstChild, new Offset(0, 0))
        c1.inserting('Hello, world!')
        clearInterval(interval)
        assert.strictEqual(editor.div.firstChild.innerHTML, 'Hello, world!')
    })
})