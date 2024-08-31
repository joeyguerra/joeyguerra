// Description:
// Businesses for sale.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

import { getNextRequestTime } from '../../lib/CacheControl.mjs'
import fs from 'fs'
import {load as cheerio} from 'cheerio'
const File = fs.promises

export default robot => {

    robot.router.get('/biz', async (req, res)=>{
        const model = JSON.parse(await File.readFile('./.data/biz.json', 'utf8'))
        res.render('biz', {model, title: 'Hubot - Businesses For Sale', canonical: 'https://hubot.joeyguerra.com/biz'})
    })

    const get = async () => {
        let hasTtlExpired = true
        const now = Date.now()
        let $ = null
        let json = null
        try{
            json = JSON.parse(await File.readFile('./.data/biz.json', 'utf8'))
            const cacheControl = json['cache-control']
            const dateCalled = json['date']
            const nextRequestTime = getNextRequestTime(cacheControl, dateCalled)
            hasTtlExpired = nextRequestTime < now
        }catch(e){
            console.log(e)
        }
        if(!hasTtlExpired) return json
        const response = await fetch('https://www.bizbuysell.com/texas/coppell-businesses-for-sale/')
        const data = await response.text()
        $ = cheerio(data)
        let obj = JSON.parse($('script[data-stype="searchResultsPage"]').text())
        obj['cache-control'] = response.headers.get('cache-control')
        obj['date'] = response.headers.get('date')
        await File.writeFile('./.data/biz.json', JSON.stringify(obj, null, 2), 'utf8')
        return obj
    }

    // let jobInterval = setInterval(get, 1000 * 60 * 1)
    // get()
  }
  