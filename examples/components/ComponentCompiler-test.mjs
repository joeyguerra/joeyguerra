import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { promises as File } from 'node:fs'
import path from 'node:path'
import { makeDomFromFile, makeDomFromString, fill } from '../MakeDomFromFile.mjs'
import loadModules from '../ModuleLoader.mjs'
import handlebars from 'handlebars'

const moduleURL = new URL(import.meta.url)
const __dirname = path.dirname(moduleURL.pathname)

handlebars.registerPartial('pages/layouts/index.html', await File.readFile(path.resolve(__dirname, '../../www/pages/layouts/index.html'), 'utf-8'))
handlebars.registerPartial('pages/layouts/app.html', await File.readFile(path.resolve(__dirname, '../../www/pages/layouts/app.html'), 'utf-8'))

describe('Build a component into a single file', () => {
    let dom = null
    beforeEach(async () => {
        dom = await makeDomFromFile(path.join(__dirname, 'search.html'))
        await loadModules(dom, async (specifier) => File.readFile(path.resolve(__dirname.replace('/examples/components', '/www/'), specifier.replaceAll('../', './')), 'utf-8'))
    })
    afterEach(() => {
        dom.window.close()
    })
    it('should have a search field', async () => {
        const { searchTerm } = dom.window
        searchTerm.fill('Patient 9')
        assert.ok(dom, 'Should make a dom')
        assert.deepEqual(searchTerm.value, 'Patient 9')
        dom.window.close()
    })
})

describe('Contacts', () => {
    let dom = null
    beforeEach(async () => {
        const contacts = [
            { id: '1', name: 'Patient 1', email: 'test@test.com', phone: '555-555-5555' },
            { id: '2', name: 'Patient 2', email: 'jory@test.com', phone: '555-555-5555' },
            { id: '3', name: 'Patient 3', email: 'p3@test.com', phone: '555-555-5555' },
            { id: '4', name: 'Patient 4', email: 'p4@test.com', phone: '555-555-5555' },
        ]
        const html = await File.readFile(path.resolve(__dirname, '../../templates/contacts/index.html'), 'utf-8')
        const output = handlebars.compile(html)({contacts})
        dom = await makeDomFromString(output)
        await loadModules(dom, async (specifier) => File.readFile(path.resolve(__dirname.replace('/examples/components', '/www/'), specifier.replaceAll('../', './')), 'utf-8'))
    })
    afterEach(() => {
        dom.window.close()
    })
    it('Should have a list of contacts', async () => {
        const { search } = dom.window
        const $ = dom.window.document
        search.fill('Patient 2')
        assert.deepEqual($.querySelectorAll('tbody tr:not(.template)').length, 1)
        assert.deepEqual($.querySelector('tbody tr:not(.template) td:nth-child(1)').textContent, 'Patient 2')
    })
})

describe('Todos', () => {
    let dom = null
    beforeEach(async () => {
        const html = await File.readFile(path.resolve(__dirname, '../../www/pages/todos.html'), 'utf-8')
        const output = handlebars.compile(html)({})
        dom = await makeDomFromString(output)
        await loadModules(dom, async (specifier) => File.readFile(path.resolve(__dirname.replace('/examples/components', '/www/'), specifier.replaceAll('../', './')), 'utf-8'))
    })
    afterEach(() => {
        dom.window.close()
    })
    it('Should let you add todos by entering text and hiting the Enter key', async () => {
        const textbox = dom.window['new-todo']
        const form = dom.window.header
        const todoList = dom.window['todo-list']
        textbox.fill('Todo 1')
        form.submit()
        textbox.fill('Todo 2')
        form.submit()
        assert.deepEqual(todoList.querySelectorAll('li').length, 2)
        Array.from(todoList.querySelectorAll('li label')).forEach((l, i) => assert.deepEqual(l.textContent, `Todo ${i + 1}`))
    })
    it('Should mark a todo as complete when you click the checkbox', async () => {
        const textbox = dom.window['new-todo']
        const form = dom.window.header
        const todoList = dom.window['todo-list']
        textbox.fill('Todo 1')
        form.submit()
        textbox.fill('Todo 2')
        form.submit()
        const [first, second] = Array.from(todoList.querySelectorAll('li'))
        assert.deepEqual(first.querySelector('input').checked, false)
        assert.deepEqual(second.querySelector('input').checked, false)
        first.querySelector('input').click()
        assert.deepEqual(first.querySelector('input').checked, true)
        assert.deepEqual(second.querySelector('input').checked, false)
    })
    it('Should let you delete a todo by clicking the X', async () => {
        const textbox = dom.window['new-todo']
        const form = dom.window.header
        const todoList = dom.window['todo-list']
        textbox.fill('Todo 1')
        form.submit()
        textbox.fill('Todo 2')
        form.submit()
        const [first, second] = Array.from(todoList.querySelectorAll('li'))
        assert.deepEqual(first.querySelector('input').checked, false)
        assert.deepEqual(second.querySelector('input').checked, false)
        first.querySelector('button').click()
        assert.deepEqual(todoList.querySelectorAll('li').length, 1)
        assert.deepEqual(todoList.querySelector('li label').textContent, 'Todo 2')
    })
    it('Should let you edit a todo by double clicking the label', async () => {
        const textbox = dom.window['new-todo']
        const form = dom.window.header
        const todoList = dom.window['todo-list']
        textbox.fill('Todo 1')
        form.submit()
        textbox.fill('Todo 2')
        form.submit()
        const [first, second] = Array.from(todoList.querySelectorAll('li'))
        assert.deepEqual(first.querySelector('input').checked, false)
        assert.deepEqual(second.querySelector('input').checked, false)
        first.querySelector('label').dispatchEvent(new dom.window.MouseEvent('dblclick'))
        assert.deepEqual(first.classList.contains('editing'), true)
        assert.deepEqual(first.querySelector('input.edit').value, 'Todo 1')
        console.log('further along 1', first.querySelector('input.edit'))
        fill(first.querySelector('input.edit'), 'Todo 1 Updated', dom)
        const keydownEvent = new dom.window.KeyboardEvent('keydown', { keyCode: 13, bubbles: true })
        first.querySelector('input.edit').dispatchEvent(keydownEvent)
        // const keyupEvent = dom.window.document.createEvent('Events')
        // keyupEvent.initEvent('keydown', true, true)
        // keyupEvent.keyCode = 13
        // keyupEvent.key = 'Enter'
        // first.querySelector('input.edit').dispatchEvent(keyupEvent)
        // console.log(keyupEvent)
        first.querySelector('input.edit').dispatchEvent(new dom.window.KeyboardEvent('keyup', { keyCode: 13, bubbles: true }))
        assert.deepEqual(first.querySelector('label').textContent, 'Todo 1 Updated')
    })
})