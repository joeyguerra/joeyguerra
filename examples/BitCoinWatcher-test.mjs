import HttpAsync from '../lib/HttpAsync.mjs'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import {Transform} from 'stream'
import { describe, it } from 'node:test'

const File = fs.promises
const bitcoinApiUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json'

class Price {
    constructor(obj){
        this.time = new Date(obj.time.updatedISO)
        this.symbol = obj.chartName
        this.price = obj.bpi.USD
    }
}

class TrendingReport extends Transform {
    constructor(options){
        super(options)
        this.value = ''
        this.previous = ''
        this.prices = []
        this.lastLineOfData = null
        this.previousPrice = null
        this.slopes = []
    }
    _transform(chunk, encoding, callback){
        let data = chunk.toString()
        if(this.lastLineOfData) data = this.lastLineOfData + data
        let lines = data.split('\n')
        this.lastLineOfData = ''
        lines.forEach(line => {
            try{
                let obj = JSON.parse(line)
                if(this.previousPrice) {
                    const diff = this.previousPrice.price.rate_float - obj.price.rate_float
                    const timeDiff = (new Date(this.previousPrice.time)).getTime() - (new Date(obj.time)).getTime()
                    if(timeDiff < 0){
                        this.slopes.push({time: obj.time, diff: diff/timeDiff})
                        this.previousPrice = obj
                    }
                } else {
                    this.previousPrice = obj
                }
                this.prices.push(obj)
            }catch(e){
                this.lastLineOfData += line
            }
        })
        this.push(chunk.toString())
        callback()
    }
    _flush(callback){
        if(this.lastLineOfData) {
            this.lastLineOfData.split('\n').forEach(line=>{
                try{
                    let obj = JSON.parse(line)
                    this.prices.push(obj)
                }catch(e){

                }
            })
            this.push(this.lastLineOfData)
        }
        this.lastLineOfData = null
        callback()
    }
}

const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)

describe('Is bitcoin trending up or down?', () => {
    it('Creates a log of prices', async () =>{
        const data = await HttpAsync.get(bitcoinApiUrl)
        const p = new Price(JSON.parse(data))
        File.appendFile(path.join(path.resolve(), 'examples/testLog.ndjson'), `${JSON.stringify(p)}\n`)
        assert.ok(p.price.rate_float)
    })

    it('Read the trend', (t, done) => {
        const stream = fs.createReadStream(path.join(path.resolve(), 'examples/testLog.ndjson'), {encoding: 'utf8'})
        const report = new TrendingReport({encoding: 'utf8', objectMode: true})
        stream.pipe(report)
            .on('finish', ()=>{
                console.log(report.slopes)
                assert.ok(report.prices.length > 0)
                done()
            }).on('error', e=>console.log(e))
    })
})