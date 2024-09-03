
const parseFromUrl = text => {
    let fullUrl = text.toString()
    let url = {
        hostname: null,
        port: 0,
        password: null,
        socket: {
            tls: false
        },
        user: null
    }

    if(fullUrl.indexOf('@') > -1) {
        const [userAndPassword, hostnameAndPort] = fullUrl.split('@')
        url = userAndPassword.split('@').reduce((acc, current, i)=>{
            if(i == 0) {
                const [user, password] = current.split(':')
                acc.user = user
                acc.password = password
            }
            return acc
        }, url)
        fullUrl = hostnameAndPort
    }

    return fullUrl.split(',').reduce((acc, current, i)=>{
        if(i == 0) {
            acc.hostname = current.split(':')[0]
            acc.port = parseInt(current.split(':')[1])
            return acc
        }
        const [key, value] = current.split('=')
        if(key == 'ssl') {
            acc.socket.tls = (value == 'true')
            return acc
        }
        acc[key] = value
        return acc
    }, url)
}
const mapToClientOptions = (redisConnectionUrl, rejectUnauthorized = false) => {
    const url = []
    let options = {}
    if(redisConnectionUrl.socket.tls) {
        url.push('rediss://')
        options.socket = {
            tls: true,
            rejectUnauthorized: rejectUnauthorized
        }
    } else {
        url.push('redis://')
    }
    
    if(redisConnectionUrl.user) url.push(`${redisConnectionUrl.user}${redisConnectionUrl.password ? `:${redisConnectionUrl.password}` : ''}@`)
    url.push(`${redisConnectionUrl.hostname}:${redisConnectionUrl.port > 0 ? redisConnectionUrl.port : 6379}`)
    options.url = url.join('')
    return options
}

export {
    parseFromUrl,
    mapToClientOptions
}