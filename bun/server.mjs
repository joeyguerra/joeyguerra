import { serve } from 'bun'
import { Database } from 'bun:sqlite'
import { htmlRewriter } from './TemplatingEngine.mjs'

// Initialize SQLite database
const dbPath = 'users.db'
const dbExists = Bun.file(dbPath).exists()
if (!dbExists) {
  Bun.write(dbPath, '')
}

const db = new Database(dbPath)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `)

// Insert sample data if the table is empty
if (db.query('SELECT COUNT(1) as Count FROM users').get().Count === 0) {

  db.exec(`
    INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@joeyguerra.com'),
    ('Bob', 'bob@joeyguerra.com'),
    ('Charlie', 'charlie@joeyguerra.com')
    `)
}

class HtmlResponse extends Response {
    constructor(body, init) {
        super(body, init)
        this.headers.set('Content-Type', 'text/html')
    }
}

const server = serve({
  port: 3000,
  routes: {
    "/": {
        async GET() {
            return new Response('Welcome to Bun!')
        }
    },
    "/users": {
        async GET(req) {
            const users = db.query(`SELECT * FROM users LIMIT 10`).all()
            const rewriter = htmlRewriter({
                '#users': users.map(user => `<li>${user.name} (${user.email})</li>`).join(''),
            })
            const html = `
                <html>
                    <head>
                        <title>Users</title>
                        <link rel="stylesheet" href="/css/styles.css">
                    </head>
                    <body>
                        <h1>Users</h1>
                        <ul id="users"></ul>
                    </body>
                </html>
            `
            return await rewriter.transform(new HtmlResponse(html, {
                headers: {
                    'Content-Type': 'text/html',
                },
            }))
        }
    },
  },
})

console.log(`Listening on localhost:${server.port}`)