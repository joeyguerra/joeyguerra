// Description:
// Contract app.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

import crypto from 'node:crypto'
import fs from 'node:fs'

const CONTACTS_DIR = './.data/contacts.json'
const contacts = (()=>{
    try {
        return JSON.parse(fs.readFileSync(CONTACTS_DIR, 'utf-8'))
    }catch(e){
        return []
    }
})()

class Contact {
    constructor(obj){
        this.name = obj?.name ?? ''
        this.email = obj?.email ?? ''
        this.phone = obj?.phone ?? ''
        this.id = obj?.id ?? crypto.randomUUID()
    }
}
['SIGINT'].forEach(signal => {
    process.on(signal, () => {
        fs.writeFileSync(CONTACTS_DIR, JSON.stringify(contacts, null, 2), 'utf-8')
        process.exit(0)
    })
})

export default robot => {
    robot.router.use((req, resp, next) => {
        req.flash = (type, message) => {
            resp.cookie(`flash_${type}`, message)
        }
        next()
    })
    robot.router.use((req, resp, next) => {
        if(req.method === 'POST' && req.body._method) {
            req.originalMethod = req.method
            req.method = req.body._method
        }
        next()
    })
    robot.router.get('/contacts/:id', (req, resp) => {
        const contact = contacts.find(c => c.id == req.params.id)
        resp.render('contacts/show.html', contact)
    })

    robot.router.get('/contacts', (req, resp) => {
        const term = req.query.q?.toLowerCase()
        let output = []
        if(term){
            output = contacts.filter(c => c.name.toLowerCase().indexOf(term) > -1)
        }else {
            output = contacts
        }
        resp.render('contacts/index.html', {contacts: output, term})
    })

    robot.router.get('/contact/:id', (req, resp) => {
        const id = req.params.id
        const contact = contacts.find(c => c.id == id)
        resp.render('contacts/form.html', contact)
    })
    robot.router.put('/contact', (req, resp) => {
        const id = req.body.id
        const contact = contacts.find(c => c.id == id)
        contact.name = req.body.name
        contact.email = req.body.email
        contact.phone = req.body.phone
        req.flash('success', 'Contact updated successfully.')
        resp.redirect('/contacts')
    })
    robot.router.delete('/contact/:id', (req, resp) => {
        const id = req.params.id
        const contact = contacts.find(c => c.id == id)
        contacts.splice(contacts.indexOf(contact), 1)
        req.flash('success', 'Contact deleted successfully.')
        resp.redirect('/contacts')
    })

    robot.router.post('/contacts', (req, resp) => {
        const contact = new Contact(Object.assign(req.body, {id: crypto.randomUUID()}))
        if(contact.name.length == 0){
            return resp.render('contacts/form.html', {contact, errors: {name: 'If you want to save a contact, you need to provide a name.'}})
        }
        req.flash('success', 'Contact saved successfully.')
        contacts.push(contact)
        resp.redirect('/contacts')
    })
}
