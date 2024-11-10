# I Have 2 Mac Minis or How I Quickly Deploy Apps in a Cloud Native Way

I love computer programming. But let's face it, it's complicated. It's not just about programming, it's also about running an applicationa and doing something, sending messages, moving data, seeing data, there's lots to it.

This is a story of a computer programmer who found himself in possession of 2 Mac Minis and wanted to build some apps and deploy them somewhere other than his laptop.

It's 2018, so my first thought was to use Docker. But then I wanted to run 2 services, so then came Docker Compose. But I have 2 Machines. In comes Docker Swarm. Then I'm like, but everyone is using Kubernetes. In comes `minikube` (dangit, only works on a single machine). What about `kubadm`, well, yeah, ok, let's see how to set up k8s manually.

(next day on chat) - Hey, can anyone help me setup k8s on my 2 mac minis?

why are you doing that?

because i want to deploy apps and i have 2 mac minis and want to learn k8s.

don't do that.

i want to.

ok, try Nomad instead. `https://www.nomadproject.io/guides/cluster/manual.html`

how do i install Nomad?

`https://brewinstall.org/Install-nomad-on-Mac-with-Brew/`

Turn on Remote Login on a Mac Mini.

Note: 1.2.3.4 should be replaced with the machines IP address. In my situation, each machine joined a guest WIFI network and was assigned a local IP, 10.

Machine 1: 10.0.0.1
Machine 2: 10.0.0.2
Local Laptop

## From Local Laptop: Setup Machine 1

```bash
ssh someusername@10.0.0.1
brew install consul
brew install nomad
consul agent -bind 10.0.0.1 -data-dir /Users/Shared/opt/consul/data_dir/ -node node1 -bootstrap-expect 2 -server -ui -client 10.0.0.1 &
```

## From Local Laptop: Setup Machine 2

```bash
ssh someusername@10.0.0.2
brew install consul
brew install nomad
consul agent -bind 10.0.0.2 -data-dir /Users/Shared/opt/consul/data_dir/ -node node2 -bootstrap-expect 2 -server -ui -client 10.0.0.2 &
consul join 10.0.0.1
```

## Check

```bash
consul members
consul info
```

## Run Nomad as both Server and Client

```bash
#Nomad Config File: /Users/Shared/opt/nomad.d/both.hcl
data_dir = "/Users/Shared/opt/nomad.d"

server {
    enabled = true
    bootstrap_expect = 2
}

client {
    enabled = true
}

```

```bash
#!/bin/bash
# shell script that can be used to start nomad
config_file=/Users/Shared/opt/nomad.d/both.hcl
nomad agent -config $config_file_path
```

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'I have 2 Mac Minis',
        excerpt: 'And I want to create a cluster so that I can deploy some apps to them.',
        shouldPublish: true,
        uri: '/blug/2018/i-have-2-mac-minis.html',
        published: new Date('2018-02-01T16:43:08.111Z'),
        tags: ['experimenting', 'local']
    }
</script>