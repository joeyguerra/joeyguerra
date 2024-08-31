# Hi there 👋 I'm Joey Guerra

- 🔭 I’m currently working on ... startup business, lab operations software for fixed appliance patients (Dental industry) & figuring out how [Hubot](https://github.com/hubotio) should evolve
- 🌱 I’m currently learning ... Entrepreneurship
- 👯 I’m looking to collaborate on ... Growing software engineers
- 🤔 I’m looking for help with ... Finding problems I love
- 💬 Ask me about ... Creating diverse teams, software engineering, solving buisiness problems, MVC, Reliability Engineering, distributed systems, agile software development and how you're not doing it
- 📫 How to reach me: ... [@joeyguerra@mastodon.social](https://mastodon.social/@joeyguerra), [in:joeyguerra](https://www.linkedin.com/in/joeyguerra/)
- 😄 Pronouns: ... he/him
- ⚡ Fun fact: ... I worked at NASA/JSC on International Space Station EVA hardware - module handrails, EVA helmet cams, saftey tethers, developed EVA workspace instructions, certfication testing for thermal environments of EVA manual deployment of solar panels for the Z1 Truss Structure
- ⚡ Another fun fact: ... I pole vaulted for The University of Texas @ Austin 1991-1995 (17-4 1/2) 5.3 m

# Local Dev For This Website

```sh
npm i
node --run start:local
```

# Deploy To Local K8s

```sh
docker build . -t local/jbot-website:1.0.2
kubectl create secret generic discord-token --from-literal=HUBOT_DISCORD_TOKEN=<replace with token>
kubectl apply -f charts/web/deployment.yml -n default
```