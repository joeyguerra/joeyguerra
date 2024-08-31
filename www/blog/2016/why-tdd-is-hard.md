---
layout: layouts/post.html
title: Why people say Test Driven Design (TDD) is hard
summary: |
 I've been working with my team to practice Test Driven Design (TDD) for about 2 years. They just started REALLY doing it about 4 weeks ago after I finally gave them the permission they needed to do it. And even now, they don't feel comfortable because it takes them longer to finish development. Below is my story of how I kick started the team practicing TDD and my observations of what I think are keeping the majority of Software Engineers from following the practice.
should_publish: yes
published: 2016-03-16T16:43:08.111Z
---
# Why people say Test Driven Design (TDD) is hard

I've been working with my team to practice Test Driven Design (TDD) for about 2 years. They just started REALLY doing it about 4 weeks ago after I finally gave them the permission they needed to do it. And even now, they don't feel comfortable because it takes them longer to finish development. Below is my story of how I kick started the team practicing TDD and my observations of what I think are keeping the majority of Software Engineers from following the practice.

We've been talking about TDD for a long time now. But we never practiced it. My approach was to incorporate TDD in our daily discussions and set expectations that the team should be practicing it. But they just didn't or couldn't do it. Quite frankly, I was frustrated with myself because what I thought would get the team practicing TDD, didn't. I was a little fed up. So I decided to take a different approach.

One of our interns was hired by another team at my site but we decided to move him back to my team. He's green, so the next iteration I sat with him and guided him through the process of TDD. Honestly, I thought it was going to be quick. So he created a new Java Class and JUnit test, executed it and off we started.

The user story was to disable the Add to Cart button on the Product Information Page (PIP) if the product was out of stock or if the store had limited quantity. No biggie. Just create an attribute that the code can check in order to enable or disable the button. So I thought.

## The First and Main Road Block To TDD: But the test is so simple

And so came the first road block to practicing TDD (which would invariably be the main road block). We spent the first few minutes getting him past his struggle that he was writing a test for something so simple. And we NEVER got past it. No matter how many times I restarted his efforts to writing the unit test, he would second guess himself. Still questioning the value of writing a test for what appeared to him to be such a simple, no brainer functionality.

Passed that Road Block: Oh crap, I have to refactor a butt load of code just to make it testable!
Once he wrote that first simple test, he started to see the hidden complexity behind checking that 1 attribute. Just setting up the 1 unit test took understanding a domain object that had at least 5 other object dependencies. He spent 3 days just to get a good understanding of the domain model that he was working with.

Just a few days in and he already needed help from at least 2 of the other experienced developers. Day 4 I came to the office to see him and 2 other developers pairing at his workstation as they churned through another few days of refactoring just to get the code unit testable. But this was when I finally realized how to communicate what tends to block other developers from practicing TDD.

## Eureka

We stop ourselves from practicing TDD because we can't get past the thought that the test is so simple, we don't see the value in it. The complexity of it is actually hidden from our view. We don't see it initially. We just see the test that checks a boolean value. And it just looks so simple, "surely it's not worth doing this". And so we don't. We don't create the unit test. We jump straight into just modifying the code and making it work.

The next iteration I asked the team to mob the next sprint and force each other to practice TDD. I dropped in on the mob programming sessions and I saw again that same hesitation from other developers. That's when I was convinced I'd found the culprit. I told the team to create the JUnit test and once again I got the same kind of push back and questioning of the value of the test. It's just such a simple thing. Are we really just going to test that the boolean is true and false? Yes. Yes you are. But prepare yourself for in there, there be dragons.

## The Next Hurdle: It's Going To Feel Slooooow

Once the team got passed that initial "but it's so simple" feeling, the next hurdle set in. TDD can be a tedious process to follow, especially when working within a legacy code base. 2 weeks of mobbing together takes a lot of energy and some of the team members expressed concern that the process slowed them down. Something that usually took less than a day to complete, is now taking a week. Now comes the hard part. Getting everyone on the team, especially the non developers, to take this journey with us. They have to understand too that following TDD builds in Quality Assurance (QA). So we all have to now look at the time it takes to develop stories and realize that it includes all the time that it used to take for the separate QA process in addition to developing it. People's expectations have to be reset and they have to remember that the time it takes to follow TDD now includes all the other time we spent in the QA phase of the process, which we should now reduce as it's been shifted to the development process.

So if you're wanting to practice TDD and you're having trouble, just push through it. Force yourself to create the unit test. Just do it. Don't think. Get yourself past that feeling. Then do it again. Keep going. You'll get it.
