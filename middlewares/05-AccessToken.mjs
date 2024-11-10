export default async () => {

    return async (req, res) => {

        if (req.url !== '/access-token') {
            return
        }

    if(!req.params.code) {
        res.statusCode = 400
        res.write('Bad Request')
        return res.end()
    }

    let userFromDiscord = Buffer.from(req.params.state, 'base64').toString('ascii').split(';').reduce((acc, current, i)=>{
        if(i == 0) acc.redirectUrl = current
        if(i == 1) acc.state = current
        if(i == 2) acc.entrySessionId = current
        return acc
    }, {})
    
    let user = validationDuringOauthSequence.get(userFromDiscord.entrySessionId)
    if(!user || user.state != userFromDiscord.state) return res.status(401).send('Unauthorized')
    validationDuringOauthSequence.delete(user.sessionID)
    let data = {
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_REDIRECT_URL,
        code: req.params.code
    }
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    let response = await fetch(`${process.env.DISCORD_API_HOST}/oauth2/token`, {
        method: 'POST',
        headers: headers,
        body: new URLSearchParams(data)
    })

    let token = await response.json()
    if(token.error) {
        return next(new Error(token.error))
    }
    let info = await fetch(`${process.env.DISCORD_API_HOST}/users/@me`, {
        headers: {
            Authorization: `Bearer ${token.access_token}`,
            Accept: 'application/json',
            'User-Agent': `Jbot (https://jbot.joeyguerra.com, 1.0.0)`
        },
        method: 'GET'
    })
    if(info.status == 401) return res.status(401).send('Unauthorized: Access token')
    req.session.access_token = token.access_token
    req.session.user = await info.json()
    res.redirect(userFromDiscord.redirectUrl)
    }
}