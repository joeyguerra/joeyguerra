import assert from "assert"
import jwtVerify from "jose/jwt/verify"
import parseJwk from "jose/jwk/parse"
import path from "path"
import fs from "fs"
import test from 'test'

const __dirname = path.resolve()
const File = fs.promises
const jwks = {
    async get(){
        return JSON.parse(await File.readFile(path.join(__dirname, "examples/keys.json"), "utf8"))
    }
}
test("JWT Decoding", t=>{
    t.test("Should decode it", async ()=>{
        const keys = await jwks.get()
        const publicKey = await parseJwk(keys.keys[0])
        console.log(publicKey)
        const auth = {
            AccessToken: process.env.AUTH0_ACCESS_TOKEN,
            IdToken: process.env.AUTH0_ID_TOKEN,
            Scope: 'openid profile email',
            ExpiresIn: 86400,
            TokenType: 'Bearer'
        }
        const expected = "Joey Guerra"
        const actual = await jwtVerify(auth.IdToken, publicKey, {
            issuer: "https://devchitchat.auth0.com/",
            audience: process.env.AUTH0_AUDIENCE
        })
        console.log(actual)
        assert.strictEqual(actual.payload.name, expected)
    })
})