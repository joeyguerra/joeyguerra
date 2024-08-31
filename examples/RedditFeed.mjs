import assert from "assert"
import https from "https"
import test from 'node:test'
async function get(url){
    return new Promise((resolve, reject)=>{
        https.get(url, resp => {
            const buffer = []
            resp.setEncoding("utf-8")
            resp.on("data", chunk => buffer.push(chunk))
            resp.on("error", e => reject(e))
            resp.on("end", ()=>resolve(JSON.parse(buffer.join(""))))
        })
    })
}

test("Reddit", t=>{
    t.test("GET feed", async ()=>{
        const home = await get("https://www.reddit.com/r/home.json")
        console.log(home.data.children.sort((a, b)=>{
            const atime = a.data.edited || a.data.created
            const btime = b.data.edited || b.data.created
            if(atime == btime) return 0
            return atime >= btime ? 1 : -1
        }).map(post=>{
            const created = new Date(post.data.created)
            return {title: post.data.title, post: post.data, created }
        }))
    })
})