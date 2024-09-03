// Description:
//   A dictionary.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot define - show dictionary. #dictionary
//   hubot define <word> - Shows word definition if it exists in the dictionary. #dictionary
//   hubot define <word> as <definition> - add an entry to the dictionary. #dictionary
//   hubot delete <word> - deletes this word from the dictionary. #dictionary
//   hubot what does <word> mean - shows the definition of the word. #dictionary
//
// Notes:
//   Make this good
//
// Author:
//   Joey Guerra

import { v4 as uuidv4 } from 'uuid'
import File from 'node:fs/promises'

class Event {
    constructor(kind, id, occurred, recorded, who, what, originatingSystemId){
        this.envelope = {
            kind, id, occurred, recorded, who, what, originatingSystemId
        }
    }
}
class AddEvent extends Event {
    constructor(word, definition, id, occurred, recorded, who, what, originatingSystemId){
        super('https://joeyguerra.com/dictionary/add', id, occurred, recorded, who, what, originatingSystemId)
        this.word = word
        this.definition = definition
    }
}
class DeleteEvent extends Event {
    constructor(word, id, occurred, recorded, who, what, originatingSystemId){
        super('https://joeyguerra.com/dictionary/delete', id, occurred, recorded, who, what, originatingSystemId)
        this.word = word
    }
}
class Command {
    constructor(text, occurred, who, originatingSystemId){
        this.text = text
        this.occurred = occurred
        this.who = who
        this.originatingSystemId = originatingSystemId
    }
}
class Entry {
    constructor(word, definition){
        this.word = word
        this.definition = definition
    }
}
const patterns = {
    commands: /define\s?(?<word>.*) as (?<definition>.*)/i
}

const parsers = {
    add(command, delegate = {id(){return uuidv4()}, recorded(){return new Date()}}) {
        const match = /define (?<word>.*) as (?<definition>.*)/ig.exec(command.text)
        return [new AddEvent(match.groups.word, match.groups.definition, delegate.id(), command.occurred, delegate.recorded(), command.who, command.text, command.originatingSystemId)]
    },
    delete(command, delegate = {id(){return uuidv4()}, recorded(){return new Date()}}) {
        const match = /delete (?<word>.*)/ig.exec(command.text)
        return [new DeleteEvent(match.groups.word, delegate.id(), command.occurred, delegate.recorded(), command.who, command.text, command.originatingSystemId)]
    }
}

const handle = (command, delegate) => {
    const addMatch = /define (?<word>.*) as (?<definition>.*)/i.exec(command.text)?.groups
    const deleteMatch = /delete (?<deleteWord>.*)/i.exec(command.text)?.groups

    let commandName = addMatch ? 'add' :
        deleteMatch ? 'delete' : null

    if(!commandName) return []
    if(parsers[commandName]){
        return parsers[commandName](command, delegate)
    }
    return []
}

const apply = (events, initial = []) => {
    return events.reduce((acc, current)=>{
        if(current.envelope.kind == 'https://joeyguerra.com/dictionary/add'){
            const existing = acc.find(e => e.word == current.word)
            if(!existing){
                acc.push(new Entry(current.word, current.definition))
            } else {
                existing.definition = current.definition
            }
        }
        if(current.envelope.kind == 'https://joeyguerra.com/dictionary/delete'){
            acc.splice(acc.findIndex(entry => entry.word == current.word), 1)
        }
        return acc
    }, initial)
}

export {
    handle,
    apply,
    Entry,
    AddEvent,
    DeleteEvent,
    Command
}

class Events extends Array {
    #observers = {}
    constructor(...args){
        super(...args)
    }
    async #changed(key, old, v){
        if(!this.#observers[key]) return
        for await (let o of this.#observers[key]){
            if(o.update){
                await o.update(key, old, v)
            }else {
                await o(key, old, v)
            }
        }
    }
    stopObserving(key, observer){
        if(!this.#observers[key]) return
        this.#observers = this.#observers.splice(this.#observers[key].findIndex(o => o === observer), 1)
    }
    observe(key, observer){
        if(!this.#observers[key]) this.#observers[key] = []
        this.#observers[key].push(observer)
    }
    push(event){
        super.push(event)
        this.#changed('push', null, event)
    }
}
const events = new Events()
;(async()=>{
    try{
        const data = await File.readFile('./.data/dictionary.ndjson', 'utf-8')
        data.split('\n').forEach(d => {
            if(d.length == 0) return
            events.push(JSON.parse(d))
        })    
    }catch(e){

    }
    events.observe('push', async (key, old, v) => {
        await File.appendFile('./.data/dictionary.ndjson', `${JSON.stringify(v)}\n`, 'utf-8')
    })    
})()

const format = entry => `* *${entry.word}* - ${entry.definition}`
export default robot => {
    robot.respond(/define$/ig, async res => {
        const guildId = res.message?.user?.message?.guildId ?? 'local-shell'
        const isInRoles = robot.adapter.isInRole ? robot.adapter.isInRole(res?.message?.user?.message?.author, robot.authorizedRoles, guildId) : true
        if(!isInRoles) return
        let dictionary = apply(events)
        if(dictionary.length == 0) return await res.reply('No words found')
        const m = dictionary.sort((a, b) => a.word > b.word ? 1 : -1).map((t, i) => {
            return format(t)
        })
        await res.reply(`${m.join('\r\n')}`)
    })
    robot.respond(/define (?!.*\s|as)(?<word>.*)/i, async res => {
        const guildId = res?.message?.user?.message?.guildId ?? 'local-shell'
        const isInRoles = robot.adapter.isInRole ? robot.adapter.isInRole(res.message.user.message.author, robot.authorizedRoles, guildId) : true
        if(!isInRoles) return
        const word = res.match.groups.word
        let dictionary = apply(events)
        if(dictionary.length == 0) return await res.reply('No words found')
        dictionary = dictionary.filter(w => w.word.indexOf(word.toUpperCase()) > -1)   
        await res.reply(`${dictionary.join('\r\n')}`)
    })
    robot.respond(/define (?<word>.*) as (?<definition>.*)/i, async res => {
        const guildId = res?.message?.user?.message?.guildId ?? 'local-shell'
        const isInRoles = robot.adapter.isInRole ? robot.adapter.isInRole(res.message.user.message.author, robot.authorizedRoles, guildId) : true
        if(!isInRoles) return
        const word = res.match.groups.word
        const text = res.message.text.replace(`${robot.name} `, '')
        const command = new Command(text, new Date(), res.message.user.name, robot.name)
        const newEvents = handle(command, {id: ()=>uuidv4(), recorded: ()=>new Date()})
        newEvents.forEach(event => events.push(event))
        let dictionary = apply(events)
        const m = dictionary.sort((a, b) => a.word > b.word ? 1 : -1).map((t, i) => {
            return format(t)
        })
        await res.reply(`${m.join('\r\n')}`)
    })
    robot.respond(/delete (?<word>.*)/i, async res => {
        const guildId = res?.message?.user?.message?.guildId ?? 'local-shell'
        const isInRoles = robot.adapter.isInRole ? robot.adapter.isInRole(res.message.user.message.author, robot.authorizedRoles, guildId) : true
        if(!isInRoles) return
        const text = res.message.text.replace(`${robot.name} `, '')
        const command = new Command(text, new Date(), res.message.user.name, robot.name)
        const newEvents = handle(command, {id: ()=>uuidv4(), recorded: ()=>new Date()})
        newEvents.forEach(event => events.push(event))
        const dictionary = apply(events)
        if(dictionary.length == 0) return await res.reply('No words found')
        const m = dictionary.sort((a, b) => a.word > b.word ? 1 : -1).map((t, i) => {
            return format(t)
        })
        await res.reply(`${m.join('\r\n')}`)
    })
    robot.respond(/what does (?<word>.*) mean/i, async res => {
        const guildId = res?.message?.user?.message?.guildId ?? 'local-shell'
        const isInRoles = robot.adapter.isInRole ? robot.adapter.isInRole(res.message.user.message.author, robot.authorizedRoles, guildId) : true
        if(!isInRoles) return
        const dictionary = apply(events)
        const {word} = res.match.groups
        const found = dictionary.filter(entry => entry.word.indexOf(word.toUpperCase()) > -1)
        .sort((a, b) => a.word > b.word ? 1 : -1)
        .map((t, i) => {
            return format(t)
        })
        if(found.length == 0) return await res.reply('No words found')
        await res.reply(`${found.join('\r\n')}`)
    })
}