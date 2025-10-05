---
layout: './pages/layouts/post.html'
title: "Kubernetes (k8s), Cloud Foundry (CF) and Platform as a Service (PaaS) - A Dialogue"
excerpt: " A dialogue about using Kubernetes, Cloud Foundry and PaaS."
published: 2018-04-01
uri: '/blog/2018/k8s-cf-paas.html'
tags: ['k8s']
---
# Kubernetes (k8s), Cloud Foundry (CF) and Platform as a Service (PaaS) - A Dialogue

Janet [5:56 AM]
I think k8s has its time and place. If teams are mature enough they can get a lot more out of k8s than you ever could with Cloud Foundry (CF). I see a lot of companies evaluating the need of Pivotal Cloud Foundry (PCF) over CF proper and other PaaS.

Kathy [6:30 AM]
Regardless, I think there should always be an option as easy as `cf push`. k8s is just a heavier lift right now, but you could build a thing that does the same as `cf push`.

Janet [6:46 AM]
I believe that there should be a hybrid approach. For most Web and API projects, teams should start in PaaS and move to k8s when they need something more and are mature enough.

Trying to implement concepts like sidecars, traffic shaping, circuit breaking out of the gate is a bit much for teams used to legacy deployment on physical servers or Virtual Machines (VMs) for that matter. I think blue-green deployments on PaaS is a great first step.

If you skip PaaS and go straight to running applications as containers, then you are at risk of failiing addressing all the functionality that a PaaS handles. Especially in a large organization. Leveraging off-shore teams only compounds those problems.

But to say it's a waste is a bit extreme. I'm interested to hear opinions from those of you who have developed on k8s as well.

Christy [7:40 AM]
k8s raw has a learning curve that feels like Mt. Everest. Throw in Helm and that learning curve becomes Stone Mountain because smarter and more experienced k8s developers have figured out how to package the tool you want to use.

Charlie [8:15 AM]
With Google Kubernetes Engine (GKE) and Amazon Elastic Container Service for Kubernetes (AEKS) (even Elastic Container Service (ECS) after recent improvement) CF doesn't feel any easier.

For that matter Amazon Web Services (AWS) Lambda functions are steadily improving.

Rolling your own k8s is a pain, but no need to do that.

Ann [8:32 AM]
From what I've seen, one big reason, sometimes the only reason, that people will opt for trying to manage their own k8s is just to avoid vendor lock-in from using a PaaS.

Charlie [8:34 AM]
I don't buy the vendor lock-in argument — moving from GKE to AEKS isn't hard, especially if you used Terraform to setup initially.

Rolling your own k8s is only marginally smarter than building your own platform .

Ann [8:39 AM]
Preach! I feel you. The vendor lock-in argument comes up repeatedly for me though.

Charlie [8:45 AM]
My other concern is that for all the talk of avoiding vendor lock-in and the time wasted to avoid it, I feel like you almost never see anyone switch public cloud providers.

Christy [8:52 AM]
By extension, if people want to avoid vendor lock-in, they very well should be avoiding tool lock-in.

Charlie [8:52 AM]
For sure.

No frameworks, write everything from scratch.

More Data Access libraries and on-premise batch frameworks.

Lock your devs into company specific patterns and tools so they are less competitive in the job market

Jacob [9:23 AM]
I think folks believe the costs of PCF aren't worth it because it *is* expensive.

Charlie [9:25 AM]
I'm kind of on the fence — I think it was worth it just for forcing organizational change, or at least attempting it.

Jacob [9:30 AM]
I don't want to build our own PaaS.

I think we probably *can* and with k8s it won't be too bad, but still, would rather not. k8s is more elastic than PCF is though. I wish they had that part solved.

Ann [9:31 AM]
I also agree that it was worth it. The "digital transformation" aspect that PCF is really good at selling is very compelling.
