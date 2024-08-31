import assert from "assert";
import HttpAsync from "../lib/HttpAsync.mjs";
import test from 'node:test';

test("HttpAsync", t=>{
    t.test("Make a get request", async ()=>{
        try {
            const data = await HttpAsync.get("https://api.coindesk.com/v1/bpi/currentprice.json");
            const doc = JSON.parse(data);
            assert.ok(doc.bpi.USD);
        }catch(e){
            assert.ok(false, e);
        }
    })
})