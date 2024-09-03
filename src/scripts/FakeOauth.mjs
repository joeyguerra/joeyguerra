// Description:
//   A fake oauth endpoint.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//   Used for testing oauth flows.
//
// Author:
//   Joey Guerra

import * as jose from 'jose'
import crypto from 'node:crypto'

const authorized = async token => {
    const secret = crypto.createSecretKey(process.env.JWT_SECRET)
    let didVerify = false
    try{
        const value = await jose.jwtVerify(token, secret, {
            issuer: 'com:joeyguerra:chat',
            subject: 'com:joeyguerra:hubot',
            audience: ['com:joeyguerra:passwordless'],
            typ: 'JWT',
            maxTokenAge: '86400s',
            currentDate: new Date()
        })
        didVerify = Boolean(value.payload['joeyguerra.com:chat'])
    }catch(e){
        console.warn(`${Date.now()} warn: ${e.message}`)
    }finally {
    }
    return didVerify
}
const createOneTimeLoginToken = async (jti, nowInSeconds)=>{
    const expiryInSeconds = 5*60
    return await new jose.SignJWT({'joeyguerra.com:chat': true})
        .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
        .setIssuer('com:joeyguerra:chat')
        .setSubject('com:joeyguerra:hubot')
        .setAudience(['com:joeyguerra:passwordless'])
        .setJti(jti)
        .setExpirationTime(nowInSeconds + expiryInSeconds)
        .setIssuedAt(nowInSeconds - 10)
        .sign(crypto.createSecretKey(process.env.JWT_SECRET))
}

const allowedClients = new Map()
allowedClients.set('l7ccf4f6914d764fa697aca63c7fc72c72', 'b2507c6af48d4e3190b93b987a72af64')


export default async robot => {
    const sessionExpirationInterval = setInterval(()=>{
        const nowInSeconds = Math.floor(Date.now() / 1000)
        for(const [token, session] of robot.sessions){
            if(session.expiry > nowInSeconds) continue
            robot.sessions.delete(token)
        }
    }, 1000)
    robot.sessions = new Map()
    robot.router.post('/oauth/token', async (req, resp)=>{
        if(req.query.error && req.query.error == 500){
            return resp.status(500).json({
                transactionId: crypto.randomUUID(),
                errors: [
                  {
                    code: "INTERNAL.SERVER.ERROR",
                    message: "We encountered an unexpected error and are working to resolve the issue. We apologize for any inconvenience. Please check back at a later time."
                  }
                ]
              })
        }

        if(req.query.error && req.query.error == 503){
            return resp.status(503).json({
                transactionId: crypto.randomUUID(),
                errors: [
                  {
                    code: "SERVICE.UNAVAILABLE.ERROR",
                    message: "The service is currently unavailable and we are working to resolve the issue. We apologize for any inconvenience. Please check back at a later time."
                  }
                ]
              })
        }

        const {grant_type, client_id, client_secret} = req.body
        if(!allowedClients.has(client_id) || allowedClients.get(client_id) !== client_secret){
            return resp.status(401).json({
                transactionId: crypto.randomUUID(),
                errors: [
                  {
                    code: "NOT.AUTHORIZED.ERROR",
                    message: "The given client credentials were not valid. Please modify your request and try again."
                  }
                ]
              })
        }

        const TTL = 3599
        if(grant_type != 'client_credentials') return resp.status(400).send('Invalid grant type')
        if(!client_id) return resp.status(400).json({
            transactionId: crypto.randomUUID(),
            errors: [
                {
                    code: 'BAD.REQUEST.ERROR',
                    message: 'Missing or duplicate parameters. Please modify your request and try again.'
                }
            ]
        })
        if(!client_secret) return resp.status(400).json({
            transactionId: crypto.randomUUID(),
            errors: [
                {
                    code: 'BAD.REQUEST.ERROR',
                    message: 'Missing or duplicate parameters. Please modify your request and try again.'
                }
            ]
        })
        
        const nowInSeconds = Math.floor(Date.now() / 1000) + TTL
        const token = await createOneTimeLoginToken(crypto.randomUUID(), nowInSeconds)
        const auth = {
            access_token: token,
            token_type: 'bearer',
            expires_in: TTL,
            scope: 'CXS'
        }
        robot.sessions.set(token, {
            expiry: nowInSeconds + TTL
        })
        resp.json(auth)
    })

    robot.router.get(`/oauth/authorize`, async (req, resp)=>{
        const {response_type, client_id, redirect_uri, scope, state} = req.query
        if(response_type === 'code'){
            const nowInSeconds = Math.floor(Date.now() / 1000)
            const jti = crypto.randomUUID()
            const token = await createOneTimeLoginToken(jti, nowInSeconds)
            robot.sessions.set(token, {
                jti,
                expiry: nowInSeconds + 5*60
            })
            resp.render('oauth/index', {token, redirect_uri, state})
        }else{
            resp.status(400).send('Invalid response type')
        }
    })

    robot.router.post(`/streams/:name`, async (req, resp)=>{
        const streamKey = req.params.name
        const token = req.headers.authorization.replace('Bearer ', '')
        if(!(await authorized(token))){
            return resp.status(401).send('Unauthorized')
        }
        resp.send('ok')
    })
    robot.router.post(`/registrations`, (req, resp)=>{
        const {email} = req.body
        const nowInSeconds = Math.floor(Date.now() / 1000)

        let oneTimeToken = robot.datastore.get('onetimetoken')
        if(!oneTimeToken) {
            robot.datastore.set('onetimetoken', new Map())
            oneTimeToken = robot.datastore.get('onetimetoken')
        }
        oneTimeToken.set(email, {
            token: createOneTimeLoginToken(crypto.randomUUID(), nowInSeconds),
            expiry: nowInSeconds
        })
        resp.status(201).render('registration/index', {token: robot.sessions.get(email)})
    })
}