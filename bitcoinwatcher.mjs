import { fstat } from "fs";
import https from "https";
import HttpAsync from "./lib/HttpAsync.mjs";

const bitcoinApiUrl = "https://api.coindesk.com/v1/bpi/currentprice.json";

setInterval(async ()=>{
    try {
        const data = await HttpAsync.get(bitcoinApiUrl);
        const doc = JSON.parse(data);
        
        console.log(`${doc.time.updated} - $${doc.bpi.USD.rate_float}`);
    }catch(e){
        console.error(e);
    }
}, 5000);
