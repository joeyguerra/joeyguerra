import url from "url"
import querystring from "querystring"
import fs from "fs"
import path from "path"
import https from "https"
import jwtVerify from "jose/jwt/verify"
import parseJwk from "jose/jwk/parse"


class SignInResponseFromAuth0 {
    constructor(obj = {
        access_token: "",
        id_token: "",
        scope: "",
        expires_in: 0,
        token_type: "Bearer"
    }){
        this.AccessToken = obj.access_token
        this.IdToken = obj.id_token
        this.Scope = obj.scope
        this.ExpiresIn = obj.expires_in
        this.TokenType = obj.token_type
    }
}

class SignInResponseErrorFromAuth0 {
    constructor(obj = {
        error: "",
        error_description: ""
    }){
        this.Error = obj.error
        this.Description = obj.error_description
    }
}

const jwks = {
    async get(domain){
        return new Promise((resolve, reject)=>{
            https.get(`https://${domain}/.well-known/jwks.json`, resp => {
                const buffer = []
                resp.setEncoding("utf-8")
                resp.on("data", chunk => buffer.push(chunk))
                resp.on("error", e => reject(e))
                resp.on("end", ()=>resolve(JSON.parse(buffer.join(""))))
            })
        })
    }
}

const sampleTokenResponse = {
    access_token: '',
    id_token: '..-------',
    scope: 'openid profile email',
    expires_in: 86400,
    token_type: 'Bearer'
}

const profile = {
    given_name: "Joey",
    family_name: "Guerra",
    nickname: "joey g",
    name: "Joey Guerra",
    picture: "https://lh3.googleusercontent.com/a-/AOh14GgtGU4mETep6fmAPShwvVvNCniLW0GHdeEfhswQfA=s96-c",
    locale: "en",
    updated_at: "2020-12-12T19:32:05.291Z",
    email: "test@test.com",
    email_verified: "true",
    iss: "https://devchitchat.auth0.com/",
    sub: "google-oauth2|",
    aud: "",
    iat: "",
    exp: "1607837525"
}

const __dirname = path.resolve()
const file = fs.promises
;(async ()=>{
    const env = await file.readFile(path.join(__dirname, "./.env"), "utf8")
    let config = {}
    env.split(/\n/).forEach(line=>{
        let kv = line.split("=")
        if(kv.length > 1){
            config[kv[0].trim()] = kv[1].replace(/^\"/, "").replace(/\"$/, "")
        }
    })
    const state = ""
    const login2 = (req, resp) => {
        resp.writeHead(302, {"Location": `https://devchitchat.auth0.com/authorize?response_type=code&client_id=${config.AUTH0_CLIENT_ID}&redirect_uri=${config.AUTH0_CALLBACK_URL}&state=${state}`})
    }
    const login = async (req, resp) => {
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        qs.client_id = config.AUTH0_CLIENT_ID
        const handler = {
            async GET (req, resp) {
                const data = await file.readFile(path.join(__dirname, "login.html"), "utf8")
                resp.writeHead(200, {"Content-Type": "text/html"})
                resp.write(data)
            },
            async POST(req, resp){
                const buffer = []
                const executer = new Promise((resolve, reject)=>{
                    req.on("data", chunk => buffer.push(chunk.toString()))
                    req.on("error", e => {
                        reject(e)
                    })
                    req.on("end", ()=> {
                        const body = buffer.join("").split("&").reduce((p, c)=>{
                            let kv = c.split("=")
                            p[decodeURIComponent(kv[0].trim())] = decodeURIComponent(kv[1])
                            return p
                        }, {email: "", password: ""})
                        resolve(body)
                    })
                })
                const body = await executer
                switch(body.email){
                    case("test@test.com"):
                        resp.writeHead(302, {"Location": `${qs.redirect_uri}?${querystring.stringify(qs)}`})
                        break
                    default:
                        resp.writeHead(401)
                        break
                }
            }    
        }
        await handler[req.method](req, resp)
    }
    const userInfo = (req, resp) => {
        resp.write(JSON.stringify(profile))
    }
    const callbackMock = async (req, resp) => {
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        qs.client_id = config.AUTH0_CLIENT_ID
        resp.writeHead(302, {"Location": `${qs.redirect_uri}?${querystring.stringify(qs)}`})
    }
    const callback = async (req, resp) => {
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        const data = JSON.stringify({
            grant_type: "authorization_code",
            client_id: config.AUTH0_CLIENT_ID,
            client_secret: config.AUTH0_CLIENT_SECRET,
            realm: "email",
            code: qs.code,
            scope: "openid profile email",
            redirect_uri: "https://localhost:3000/"
        })
        const options = {
            hostname: config.AUTH0_DOMAIN,
            port: 443,
            path: "/oauth/token",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length
            }
        }
        const keys = await jwks.get(config.AUTH0_DOMAIN)
        const publicKey = await parseJwk(keys.keys[0])
        const {buffer, response} = await new Promise((resolve, reject)=>{
            const request = https.request(options, response => {
                const buffer = []
                response.setEncoding("utf8")
                response.on("data", chunk =>buffer.push(chunk) )
                response.on("error", err => reject({err, response}))
                response.on("end", ()=> resolve({buffer, response}))
            })
            request.write(data)
            request.end()
        })
        let authResponse = null
        if(response.statusCode > 299) authResponse = new SignInResponseErrorFromAuth0(JSON.parse(buffer.join("")))
        else authResponse = new SignInResponseFromAuth0(JSON.parse(buffer.join("")))
        if(authResponse instanceof SignInResponseFromAuth0){
            const verification = await jwtVerify(authResponse.IdToken, publicKey, {
                issuer: "https://devchitchat.auth0.com/",
                audience: ""
            })
            resp.write(JSON.stringify(verification.payload))
        } else {
            resp.writeHead(response.statusCode)
            resp.write(authResponse.Error)
        }
    }
    const token = async (req, resp) => {
        const buffer = []
        console.log("oauth/token called")
        const executer = new Promise((resolve, reject)=>{
            req.on("data", chunk => buffer.push(chunk.toString()))
            req.on("error", e => {
                reject(e)
            })
            req.on("end", ()=> {
                const body = buffer.join("").split("&").reduce((p, c)=>{
                    let kv = c.split("=")
                    p[decodeURIComponent(kv[0].trim())] = decodeURIComponent(kv[1])
                    return p
                }, {email: "", password: ""})
                resolve(body)
            })
        })
        const body = await executer
        resp.writeHead(200, {"Content-Type": "application/json"})
        resp.write(JSON.stringify(sampleTokenResponse))
    }
    const authorize = (req, resp) => {
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        //resp.writeHead(302, {"Location": `https://localhost:3000/callbackMock?code=sometestcode&redirect_uri=${qs.redirect_uri}`})
        resp.writeHead(302, {"Location": `https://localhost:3000/login?${uri.query}`})
    }
    const logout = (req, resp) => {
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        resp.writeHead(302, {"Location": `${qs.returnTo}`})
    }
    const listener = async (req, resp)=>{
        const uri = url.parse(req.url)
        const qs = querystring.parse(uri.query)
        if(uri.pathname.indexOf("login") > -1) {
            await login(req, resp)
        } else if(uri.pathname.indexOf("callbackMock") > -1) {
            await callbackMock(req, resp)
        } else if(uri.pathname.indexOf("callback") > -1){
            await callback(req, resp)
        } else if(uri.pathname.indexOf("userInfo") > -1){
            userInfo(req, resp)
        } else if(uri.pathname.indexOf("authorize") > -1) {
            authorize(req, resp)
        } else if(uri.pathname.indexOf("v2/logout") > -1) {
            logout(req, resp)
        } else if(uri.pathname.indexOf("oauth/token") > -1 ) {
            await token(req, resp)
        }
        resp.end()
    }
    // need to generate server.key and cert files.
    const key = await file.readFile(path.join(__dirname, "server.key"), "utf-8")
    const cert = await file.readFile(path.join(__dirname, "server.cert"), "utf-8")
    const server = https.createServer({
        key,
        cert
    }, listener)
    server.listen(process.env.PORT || 3000)
})()