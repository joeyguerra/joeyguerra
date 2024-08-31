import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('testing message passing', () => {
    it('should pass a message', async ()=>{
        const receiver = {
            async exec(m){
                this.didReceiveMessage = true
                return m
            },
            didReceiveMessage: false
        }
        
        const sender = {
            async send(r, m){
                return await r.exec(m)
            }
        }

        await sender.send(receiver, 'some message')
        assert.deepEqual(receiver.didReceiveMessage, true)
    })
})