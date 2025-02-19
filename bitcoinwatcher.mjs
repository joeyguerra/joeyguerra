import { fstat } from 'fs'
import https from 'https'

const bitcoinApiUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json'

function formatMoneyWithCommas(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

setInterval(async ()=>{
    try {
        const doc = await (await fetch(bitcoinApiUrl)).json()
        process.stdout.write('\r\x1b[K')
        process.stdout.write(`${doc.time.updated} - $${formatMoneyWithCommas(doc.bpi.USD.rate_float)}\r`)
    }catch(e){
        console.error(e)
    }
}, 5 * 1000)
