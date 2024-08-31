import { SourceTextModule } from 'node:vm'
import path from 'node:path'
import { promises as File } from 'node:fs'

const __dirname = path.dirname((new URL(import.meta.url)).pathname)
export default async (dom, delegate = async (specifier) => File.readFile(path.resolve(__dirname, specifier.replaceAll('../', './')), 'utf-8')) => {
    class Worker extends dom.window.EventTarget {
        constructor(url){
            super()
            console.log('from worker', url)
            window.fetch(url).then(resp => resp.text())
            .then(code => {
                console.log(code)
            })
            .catch(e => console.error(e))
        }
        postMessage(data){
            console.log('postmessage', data)
            this.emit('message', data)
        }
        terminate(){
            console.log('terminating')
        }
    }
    class MediaQueryList extends dom.window.EventTarget {
        #query
        constructor(query){
            super()
            this.#query = query
        }
        get matches(){
            return true
        }
        get media(){
            return this.#query
        }
    }
    dom.window.matchMedia = query => {
        return new MediaQueryList(query)
    }
    dom.window.Worker = Worker

    const doc = dom.window.document
    let modules = {}
    for await (let script of Array.from(doc.querySelectorAll('script[type="module"]'))){
        let module = new SourceTextModule(`${script.textContent}`, {
            context: dom.getInternalVMContext()
        })

        try{
            await module.link(async (specifier, referencingModule) => {
                let parts = specifier.split('/')
                let key = parts.slice(parts.length-1)[0]
                let prop = Object.keys(modules).find(prop => prop.includes(key))
                let mod = null
                if(prop) mod = modules[specifier]
                if(mod) return mod
    //             console.log(` resolving
    // ${specifier}
    //             `)
                const text = await delegate(specifier)
                modules[specifier] = new SourceTextModule(text, {
                    context: dom.getInternalVMContext(),
                    identifier: specifier
                })
                return modules[specifier]
            })
            await module.evaluate()
        }catch(e){
            console.error(e)
        }
    }
    return modules
}
