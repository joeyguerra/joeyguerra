# I Want to Increase My Output by 10, 100, 1000

I want to capture and share my journey about how I increase my work output as a software engineer by multiples of 10, 100, 1000.

This has been years in the making. I'm ready to do it now. I'm talking about taking my skills to the next level. I'm a good software engineer. I have confidence that I can build software that works, software that's soft, software that generates revenue. Now it's time for me to learn how to increase my output by multiples of 10, 100, 1000. Actually, this might be a little overdue. But better late then never.

First of, here's my perspective, presented with experiences that I've had which validated key learnings that have shaped how I work, my opinions and ideas on building good software.

At the time I started this particular journey, I had been building software on, for, and with the internet for about 12 years. In 2002, I created an Object-relational Mapping (ORM) library in C# as part of migrating a legacy COM and ASP commerce web site to the new .Net framework. The company that I worked for at that time bought a company based in New York. I lead and drove integrating their system and migrating their customers to our system. The folks from that company said it would take at least 6 weeks to integrate their system. I did it in 3.

Validation data point: I can build software and change systems successfully.

OS X was released and I'd been studying design patterns and the Cocoa framework. I read about Cocoa's pub/sub facility called NotificationCenter and implemented it in a new browser based ad-hoc reporting application that I was hired to build into the company's flagship product for legal matter management. It was 2005, Ajax was the hot term of the year and iFrames were still heavily used. The pub/sub implementation on the client side established a clean communication strategy across the iFrame documents and the ad-hoc reporting app was a big success with customers. I spoke with a colleague who was still working on that product 5 years later. I asked her about the code and design that I had put into place and whether it stood the test of time. She said it allowed them to continue improvements and bug fixes at a fast, sustainable pace. It was still easy to work with and understand.

Validation data point: I can design software that remains soft.

2008 seemed to be a really hot year for online dating sites. I was working at a subscription based dating site which had a video + text based chat system where members could see each other while participating in a text chat room. It was built on the Adobe Flash stack, which was going out of style. So the president of the company decided to reduce our dependence on Flash by building a HTML and Javascript based chat system. I wasn't initially part of the team building it. I was brought in later to research a memory leak happening on the browser after only a few minutes in the chat room. After identifying the reason for the memory leak, I was asked to fix it. The front end developer working on the project was let go. I created a design that didn't leak. The back end developer soon left as he saw the writing on the wall, and 2 other developers joined me to build out the system. We completed it, launched it, identified and fix performance issues, then deployed it again successfully.

Validation data point: I can lead a team, taking what was a failing project, bringing it back to life and successfully deliver it.

Validation data point: I also learned that communication is key to successfully delivering a project and that n (n-1) / 2 = communication paths, where n is the number of people. Adding a 4th person to help with bugs and add features, doubled the communication paths and slowed us down.

By this time, I had the confidence to take control of my career, demand a higher pay and a job with more responsibility. I was confident that I could lead a team and projects. I set out to find an employer that I could convince the same. I did and lead a team that included a 3rd party vendor, replacing an aging subscription management system with about 20 million subscribers. My team introduced a new technology and software pattern into a fortune 500 corporation (not an easy feat). The new system was built with a messaging design and architecture. It was deployed incrementally into production, running in parallel with the existing system. We tested it's performance with live data. We went live without a hitch. There were a few bugs and issues, but nothing big. It was amazing.

Validation data point: A distributed messaging architecture is a design that results in soft systems that can be modified with controlled risk.

Validation data point: A messaging architecture enabled me to control costs and scope with the 3rd party vendor. I defined clear boundaries where their application ended and our system started. This was enlightening.

Validation data point: A consistent, dependable and repeatable deployment strategy is imperative to building software.

Validation data point: Deploy early, deploy often.

Validation data point: Git is an awesome solution for source control management and is a tool that everyone can use. Even the project manager had Git and the code on his machine. And since our deployment code was also in our Git repo, he could get server information for the implementation plan in order to submit change requests.

Validation data point: Writing good code is fun and satisfying. Guiding, training, and watching a team writing good code is 10, 100, 1000 times more fun and satisfying.

And that's where I'm at right now. I want to learn how to guide a team of developers to write good code as my strategy to increasing my output by 10, 100, 1000 times.

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: "I Want to Increase My Output by 10, 100, 1000",
        excerpt: 'I want to capture and share my journey about how I increase my work output as a software engineer by multiples of 10, 100, 1000.',
        shouldPublish: true,
        uri: '/blog/2014/increase-my-output.html',
        published: new Date('2014-01-01T17:43:08.111Z'),
        tags: ['career']
    }
</script>