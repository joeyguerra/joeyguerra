// Description:
// Segment a photo into a grid of smaller photos.
//
// Dependencies:
//
// Commands:
//   hubot inbox - read inbox.
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

import tls from 'node:tls'
import assert from 'node:assert/strict'

class EmailClient {
    constructor(username, password, host) {
        this.username = username
        this.password = password
        this.host = host
        this.client = null
        this.buffer = ''
        this.tagCounter = 1
    }
    connect(callback) {
        const options = {
            host: this.host,
            port: 993,
            rejectUnauthorized: false
        }

        this.client = tls.connect(options, () => {
            console.log('Connected to IMAP server')
            callback(this.client)
            this.send(`a1 LOGIN "${this.username}" "${this.password}"`)
        })
        this.client.on('data', (data) => {
            this.buffer += data.toString()
            if (this.buffer.includes('\r\n')) {
                this.parseResponse(this.buffer)
                this.buffer = ''
            }
        })
        this.client.on('error', (err) => {
            console.error('Error:', err)
            callback(err)
        })
        this.client.on('end', () => {
            console.log('Connection closed')
        })
    }
    send(cmd) {
        console.log('C:', cmd)
        this.client.write(cmd + '\r\n')
    }
    nextTag() {
        return 'a' + (this.tagCounter++)
    }
    parseResponse(data) {
        const lines = data.toString().split('\r\n').filter(Boolean)
        for (const line of lines) {
            console.log('S:', line)
            if (line.includes('FETCH')) {
                const match = line.match(/Subject: (.*)/i)
                if (match) {
                    console.log('Parsed Subject:', match[1])
                }
            }
        }
        if (data.includes('LOGIN completed')) {
            const tag = this.nextTag()
            this.send(`${tag} SELECT INBOX`)
        }
        if (data.includes('SELECT completed')) {
            const tag = this.nextTag()
            this.send(`${tag} SEARCH ALL`)
        }
        if (data.includes('* SEARCH')) {
            const messageIds = data.match(/\* SEARCH (.*)/)?.[1]
            if (messageIds) {
                const firstMsg = messageIds.split(' ')[0]
                const tag = this.nextTag()
                this.send(`${tag} FETCH ${firstMsg} (BODY[HEADER.FIELDS (SUBJECT FROM)])`)
            }
        }
        if (data.includes('FETCH') && data.includes('Subject')) {
            const tag = this.nextTag()
            this.send(`${tag} LOGOUT`)
        }
    }
}

export default async robot => {
    const username = robot?.config?.HUBOT_EMAIL_USERNAME
    const password = robot?.config?.HUBOT_EMAIL_PASSWORD
    const emailHost = robot?.config?.HUBOT_EMAIL_HOST
    assert.ok(username, 'HUBOT_EMAIL_USERNAME is not set')
    assert.ok(password, 'HUBOT_EMAIL_PASSWORD is not set')
    assert.ok(emailHost, 'HUBOT_EMAIL_HOST is not set')
    const emailClient = new EmailClient(username, password, emailHost)
    // emailClient.connect(() => robot.logger.info('Email client connected'))
    robot.respond(/email (.*)/i, async msg => {
        const command = msg.match[1]
        if (command) {
            emailClient.send(command)
        } else {
            msg.send('Please provide an email address.')
        }

    })
}
