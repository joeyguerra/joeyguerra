// Description:
// Popular URLs.
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
const File = fs.promises

export default robot => {

    robot.router.get('/popurls', async (req, res)=>{
        const model = JSON.parse(await File.readFile('./.data/hot.json', 'utf8'))
        res.render('popurls', {model, title: 'Hubot - PopURLs', canonical: 'https://hubot.gokaizen.io/popurls'})
    })

    const getRedit = async () => {
        let hasTtlExpired = true
        let hot = null
        const now = Date.now()
        try{
            hot = JSON.parse(await File.readFile('./.data/hot.json', 'utf8'))
            const cacheControl = hot.headers['cache-control']
            const dateCalled = Date.parse(hot.headers.date)
            const nextRequestTime = getNextRequestTime(cacheControl, dateCalled)
            hasTtlExpired = nextRequestTime < now
        }catch(e){
            console.log(e)
        }
        if(!hasTtlExpired) return hot
        const response = await fetch('https://www.reddit.com/hot.json', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
            }
        })

        hot = await response.json()
        const r = {
            data: hot,
            headers: {
                'cache-control': 'public, max-age=300',// response.headers.get('cache-control'),
                date: response.headers.get('date')
            },
            time: Date.now()
        }
        await File.writeFile('./.data/hot.json', JSON.stringify(r))
        return r
    }

    // let jobInterval = setInterval(getRedit, 1000 * 60 * 1)
    // getRedit()
  }
  