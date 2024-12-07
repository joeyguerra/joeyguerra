# Steps to Creating a DevOps Culture in an Organization

> Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations.
> M. Conway

I started out writing a verbose post about how to create a DevOps culture in an enterprise. After sleeping on it, I realized that people really need tactical suggestions on how to create a DevOps culture, not just a description. So here's a DevOps Culture todo list.

## A DevOps Culture Todo List

- Identify DevOps culture characteristics
  - Respect
  - Trust
  - Healthy attitude about failure
  - Avoiding blame
- Email everyone the list, publicly declaring that we are a DevOps culture
- Clearly communicate the characteristics in on-boarding and new hire orientation programs
- Make sure Operations Engineers have access to production environments, so that they can work with Developers to build a deployment strategy
- Support your teams working on a deployment strategy during sprints (assuming you work in manageable iterations), typically part of our 20% "Job Jar", like a cookie jar but meant for working on technical debt and tools
- Give the team this list of things for them to build and setup
  - Automated infrastructure
  - Shared version control
  - One step build and deploy
  - Feature flags
  - Shared metrics
  - IRC and IM robots, tools to communicate with each other and command bots to execute tasks, yes you have to have this!
- Let team build the tools they need to deploy and collaborate

You also might want to take a look at the [history of the DevOps](http://itrevolution.com/the-history-of-devops/) term to get some perspective.

And then watch the [presentation](https://www.youtube.com/watch?v=LdOe18KhtT4) of a team that did it.

And a presentation I gave about [a DevOps team](http://www.devopslive.org/devops-at-gamestop/) that I was a part of.

One of my goals with this post is to discourage you from creating a team called DevOps. Unless your new DevOps team consists of Developers, Operations and QA and are together responsible for delivery, I think creating a separate team is a byproduct of not knowing what tactics to execute that results in a DevOps culture. For that reason, I created a todo list that you can execute which I believe will result in a DevOps culture. Good luck.

<script server>
  export default {
    layout: './layouts/post.html',
    title: 'Steps to Creating a DevOps Culture in an Organization',
    excerpt: "I started out writing a verbose post about how to create a DevOps culture in an enterprise. After sleeping on it, I realized that people really need tactical suggestions on how to create a DevOps culture, not just a description. So here's a DevOps Culture todo list.",
    shouldPublish: true,
    uri: '/blog/2014/devops.html',
    published: new Date('2014-05-01T16:43:08.111Z'),
    tags: ['devops'],
    image: ''
  }
</script>