# Hi there 👋 I'm Joey Guerra

- 🔭 I'm currently working on ... startup business, a custom billing platform & maintaing [Hubot](https://github.com/hubotio)
- 🌱 I'm currently learning ... Entrepreneurship and Marketing
- 👯 I'm looking to collaborate on ... scaling businesses with tech
- 🤔 I'm looking for help with ... Finding problems I love
- 💬 Ask me about ... event sourcing, modeling, engineering and business
- 📫 How to reach me: ... [@joeyguerra@mastodon.social](https://mastodon.social/@joeyguerra), [in:joeyguerra](https://www.linkedin.com/in/joeyguerra/)
- 😄 Pronouns: ... he/him
- ⚡ Fun fact: ... I worked at NASA/JSC on International Space Station EVA hardware - module handrails, EVA helmet cams, saftey tethers, developed EVA workspace instructions, certfication testing for thermal environments of EVA manual deployment of solar panels for the Z1 Truss Structure
- ⚡ Another fun fact: ... I pole vaulted for The University of Texas @ Austin 1991-1995 (17-4 1/2) 5.3 m

# Local Dev For This Website

```sh
npm i
npm run dev
```

# Deploy To Local K8s

## First Time K8s Needs Some Secrets

```sh
kubectl create secret generic discord-token --from-literal=HUBOT_DISCORD_TOKEN=<replace with token>
```

## Local Build and Deploy

```sh
npm run publish
```