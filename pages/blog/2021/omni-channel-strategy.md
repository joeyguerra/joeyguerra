# An Omni-channel Technology Strategy

<img class="full-width" src="https://www.joeyguerra.com/imgs/desk.jpeg" alt="My desk" />

## Problem

Omni-channel is different for every company. It depends on the company's culture, existing systems, supply chain, people, practices, and customers.

The company needs to know when a customer is browsing the site on a phone and visiting the store afterwards, so the system can determine the shopping stage and anticipate what the customer will *want* to do next.

Consistent UIs build trust, credibility and confidence. Store branding and messaging matches website and mobile app. Identifying what should be consistent should be determined by the company's departments/teams. The customer experts.

## Vision

Reduce the barriers between customers and business functionalities, empower customers to purchase products on their terms.

Pull complexity back into the domain teams that manage it well, expose services modeling core business functionalities so development teams can quickly empower customers to interact with the business.

## Questions

- How long have the teams been together? Do they get along? Work well together?
- Do you have a UX organization?
- Do you have a Product Management organization?
- What is the contractor/associate makeup of your operations team? Reliability Engineering?
- Do you have customer feedback mechanisms?
- How often do you review and approve budgets and outcomes?
- What are the high level budget buckets? Are they project vs aligned to an objective/outcome? Is this project getting it's own budget? If so, do the stake holders feel like they control the budgets, decide how its spent?
- Do you want your teams to have "building software" as a core competency? Or would you rather leverage external vendors for building software?

## Objective

Enable omni-channel, self-service capabilities for customers.

## Strategy

Enable teams to continuously build, operate, scale and maintain services modeling core business capabilities and processes. Reduce barriers between business functionality and customers purchasing and receiving products quickly and easily.

Identify domains. Arguably the hardest and most important activity which will have long lasting affects on the businesses ability to create customer value.

Pick key domain experts from the organization to form domain aligned teams. Add key network, security and operations engineers to the teams. Find engineering coaches and embed them with the teams to guide a simple process.

Let the whole team build a Continuous Integration system and process. They can spend a month vetting out different CI tools, or just pick one and go with it. But empower the team to choose. This establishes a DevOps culture that unlocks collaboration.

Identify a CI champion and empower them to build a team that focuses on integrating with the Enterprise Compliance Systems, Logging aggregation and visualization, Artifact repositories, and a central hub for storing and viewing application test results for auditing purposes.

Make "doing the right thing" sustainable.

Identify Software Engineering Champions on each team who are accountable for engineers practicing Test Driven Development, Reliability Engineering, and the SOLID Principles. Provide a forum for the team to have design dialogues about the systems they are building along with reviewing the performance of apps.

Build single sources of record for domains. At the same time, start building a mobile, responsive website utilizing new domain services as a feedback mechanism to drive API web service contracts.

## Goals

- Reduce the # of times per day customers ask Store Associates where to find an item they are searching for by some % every ##
- Improve inventory accuracy by some % every ##
- Increase cross team collaboration by % every ##
- Increase mobile website visits by % every ##
- Improve process improvements by % every ##
- Incrementally improve customer satisfaction by some % every ##
- Have high team satisfaction

## Measures

- Customer satisfaction scores
- Feature rejection rate (e.g. bugs)
- Team member work satisfaction
- &num; of public channels on chat
- &num; of public messages sent
- &num; of identifiable team channels on chat
- &num; of team retrospective action items resolved or not, every month
- Lead Time for Changes
- Deployment frequency
- Change Failure Rate (CFR)
- Mean Time to Recover (MTTR)


## Key Elements

- Organize team around domains to build capabilities
- Create something that uses those services to act as a feedback mechanism for the service contracts
- Address political issues that might exist within the organization (misalignment is always the problem; do things that encourage alignment)
- Mitigate churn from change (organizational, roles, responsibilities and new technologies)
- Provide clarity on typical questions about "how" to build quality software like "how do we implement Continuous Integration?" and "what if our development teams do not know how to do modern software development"
- Finally, consider the maturity level of the organization when creating plans or change management processes so that the whole room can visualize this actually coming to fruition

## Key Technology Practices For Responsive Delivery

### Objective

Build [cloud native](https://12factor.net), scalable, web services in front of single sources of record. Leverage the HTTP protocol to communicate amongst services. Be deliberate when building asynchronous and synchronous style communications.

### Developer Enablement Requirements (Make Doing The Right Thing Easy)

- Platform as a Service - enable teams to deploy apps that can be demoed, tested, accessed from within the company network
- Monitoring (system metrics, graphs)
- Log aggregation (historical data, graphs, etc)
- Dependable, reliable deployment strategy - Continuous Integration tooling
- Single code library that integrate with Enterprise wide compliance systems

### Underlying Architectural Principles

- Collaborate
- Priority alignment (and just alignment)
- Build feedback loops
- Learn by doing
- [12 factor apps](https://12factor.net)
- Layered access control (network, sub nets, ldap, api keys, certs, service accounts)
- Make information publicly discoverable and available (make the work visible)
- Make services discoverable programmatically along with their locations
- Create and publish Service Level Agreements between services and teams
- Information radars (make information discoverable)
- Information radiators (make information available)
- Enable compliance auditing
- Encourage technology diversity by clearly defining standards, interfaces and the process to change them
- Understand the business domains
- Identify business domain boundaries
- When sharing data across boundaries, only share data that has the least number of reasons to change
- Build in Quality, Reliability and Security into the development process (SLDC)
- Rotate, Repave, Repair (Rotate datacenter credentials often. Repave every server and application in the datacenter from a known good state often. Repair vulnerable operating systems and application stacks consistently within hours of patch availability. caveat, if you have to run your own servers)
- API first UI design, computers should be able to easily interact with services
- Customer feedback as a first class citizen into prioritization and development

### Engineering practices

- ChatOps (Communication, collaboration, alerts, use case alignment, chat)
- Pair Programming (creates a feedback loop to the Design Process)
- Test (First) Driven Development (Drive code design by using tooling that enables a fast feedback loop amongst code, design and programmer)
- Continuous Delivery (team alignment, feature prioritization, backlog refinement sessions, release planning, Service Level Objectives, team retrospectives, bubble up retro feedback to VPs)
- Continuous Building (code compilation, test execution, code scanning for static analysis, security focused code scanning) 
- Continuous Integration (fast feedback loop with system dependencies)
- Continuous Performance Testing
- Continuous Penetration Testing
- Continuous Deployment
- Automated Acceptance Tests (Continuous Testing, Browser tests, quick and easy release validation, fast feedback loop, User Experience Monitoring)
- Centralized Log aggregation (compliance auditing, change tracking, troubleshooting)
- Application Monitoring
- Routine system level team discussion
- Routine reliability team discussion
- Routine code refactoring team discussion
- Github Pull Request process for code change integration into production
- Reliability Engineering (Hystrix, Circuit Breaking, Timeouts, correct HTTP status code responses, bot detection) 

### Team / Organizational Dynamics

> Should include aligning on customer messaging, goals, objectives, and design across each channel and device

> It is less of a headache down the road when you get people excited in the beginning

> Need up-to-date and accurate product information at every turn

> With omni-channel, it's all about making the customer's life as easy as possible

> A customer values the ability to be in constant contact with a company through multiple avenues at the same time

> Seamless and effortless, high-quality customer experiences that occur within and between contact channels

> Let the customer dictate how a transaction occurs

> Assembled commerce

> Analytics to make the customer experience more seamless

> The Network Team is essential to enabling system communications; Quality, Security and Reliability must be baked into the development process


https://blog.hubspot.com/marketing/omni-channel-user-experience-examples

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'An Omni-channel Technology Strategy',
        excerpt: 'I went through an excercise to develop a technology strategy for a fictional retail company which merged 2 IT teams.',
        shouldPublish: true,
        published: new Date('2021-07-24T17:09:00.000Z'),
        image: '/desk.jpeg',
        tags: ['strategy', 'architecture'],
        uri: '/blog/2021/omni-channel-strategy.html'
    }
</script>