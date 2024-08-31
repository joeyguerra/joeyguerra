export default async robot => {
    robot.respond(/(cloudflare|cf)/i, async res => {
        let output = `# Setting up a static site with Cloudflare
1. Register domain
2. Create new repo in github
3. Enable Github Pages with Github Actions
4. npx hubot --create .
5. Git push
6. In Cloudflare, add 2 CNAMES: @ and www pointing to your github org (e.g. joeyguerra.github.io)
7. In Cloudflare, go to SSL/TLS and enable Full
`
        await res.reply(output)
    })
}