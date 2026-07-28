---
layout: './pages/layouts/post.html'
title: "Why Is Test Driven Development (TDD) So Hard: Revisited"
excerpt: "It is lack of knowledge and competing priorities. You have to train with the tooling and practice writing testable code if you want it to become easier."
published: 2020-03-20T17:49:00-06:00
uri: '/blog/2020/why-is-tdd-so-hard'
tags: ['tdd', 'testing', 'software-engineering']
---
# Why Is Test Driven Development (TDD) So Hard: Revisited

*TLDR; It is **lack of knowledge** and **competing priorities**. Since the first rule of TDD is to write a failing test, we're writing code at the point of least knowledge. We often don't fully understand the problem. We don't know how to solve the problem. We don't yet know how to use the technology to solve the problem. The list goes on and on. You have to **train** with the tooling and **practice** writing testable code if you want it to become easier.*

## Benefits from practicing TDD

Practicing TDD builds up a suite of tests that can be used as guardrails when changing code. We dread the scenario where changing one area of the code, only to later find out in production that it broke another part of the application. That's super frustrating for everyone involved. The developer feels like a jack ass, the other stake holders question the professionalism of the developers, even though EVERYONE contributed to the outcome.

- Quick feedback - Speed, Correctness
- Less Bugs - Quality, Correctness
- Proof of functionality - Quality
- Confidence to fearlessly refactor - Quality
- Examples of how to use the software for onboarding and understanding the code - Speed, Morale
- A thinking tool to develop solutions faster - Design
- Saved time with automated deployment validation - Responsive, Speed
- Safety net when making changes - Quality, Responsive

## We don't have time

> For me I get the sense that I'm wasting time when I should be exploring the capabilities of the technology (which is different from exploring the domain).

The idea of not having time came up throughout the conversations in different variations. Some felt like they were wasting time when they should be exploring the capabilities of technologies. While others mentioned pressure from deadlines and conflicting messages from managers like dictating that "you must do TDD" while at the same time asking "why aren't you done yet?". Even though there seems to be agreement with the benefits listed above, it is very apparent that practicing the TDD process is not easy and there's many contributing factors. Alas, the struggle is real.

## It's the wrong time

> We're writing tests at the point of least knowledge.

The first rule of TDD is to write a failing test. So right off the bat, we're writing code and tests at the point where we're having to guess the most. Left unchecked by other practices, it results in creating barriers to change, not helping us change faster.

What you have to do is come in with the mindset that you'll delete tests too. Don't just write them and expect that they'll live forever. Use the tooling to explore the problem and technology at the same time. The key here is short red-green-refactoring cycles. Which reminds me, [Microsoft got TDD completely wrong too at some point](https://www.jamesshore.com/Blog/Microsoft-Gets-TDD-Completely-Wrong.html). They left out the refactoring step as part of the TDD process. This includes deleting and changing tests as the design evolves, as you begin to acquire more knowledge. So remember, TDD is a process that helps you think by answering questions with working software. Practice [Red->Green->Refactoring](https://www.jamesshore.com/Blog/Red-Green-Refactor.html). Better yet, double down and make refactoring part of your culture. It'll help keep your code clean.

### Tight coupling

How do we write testable software? What does Software Design look like?

- Objects that initiate network calls: Pass them in via the constructor or method/function arguments so that you can write simple test doubles
- Dependencies being set as properties: If you do this, combine it with passing in dependencies via the constructor
- Imported libraries that cross boundaries directly referenced in classes and modules whose purpose is to model domain or business processes and logic: Don't do that, pass them in via function or constructor arguments
- Directly referencing the object that crosses boundaries: Try utilizing message based integrations like pub/sub, observer pattern, event driven, delegation patterns

Tight coupling makes things hard to test. Instead, consider designing the software so you can write simple test doubles. Classes and modules that don't exhibit a **recognizable pattern** or **design** are an indication of tight coupling. Dependencies that cross **process boundaries** litter the codebase with different **communication patterns**. One class just references an HTTPClient library, importing it directly, making it hard to test without initiating a network request. The class has multiple **collaborating objects**, some passed in via the **constructor**, some just referenced as **instance properties**. There's no discernible **object communication strategy or pattern**. In order for you to realistically practice TDD in this codebase, you'd have to be one of the people who created it in the first place (i.e. knows it really well) AND good at the TDD toolchain (i.e. knows TDD tooling for the given ecosystem). And therein lies the problem.

## Lots of tests tightly coupled to low-level implementation

> Generating lots of tests creates a trend where the overall codebase is harder to change because now we have 3 to 4 times more code impacted by a single change.

**What would happen if everyone practiced TDD?** There would be more tests, for sure. In conjunction with the fact that we're writing these tests at the point of least knowledge, often times creating tightly coupled test code to production code, results in a fragile design. Just changing one thing can require having to update many tests. This is the area where I think having **software design skills** can help. But it requires experience, which requires practice. However, even if you have people with software design skills who keep the software **soft**, what happens when you have new people join the team? Especially with varying skill levels? It takes effort to onboard them to the point where they also have software design skills. It ends up feeling like a constant battle with **entropy**. This is another reason why I think TDD is so hard. Note, not so much TDD itself, but rather it's externalities.

## Forget it, just don't do TDD

Alas, I'm no help to you, am I? You probably came here for answers and all I've provided are validations as to why TDD is hard. Well, I take that back. You could read between the lines, pick up on certain clues that could be answers to some of the questions you have about how to start practicing TDD. I mean, I tried to be direct with the TLDR; up above. I bolded some things that I thought were important. And really, I think when it comes down to it, you just gotta **train**, **practice**, and **get good**. I'd start with the tooling.

I'd avoid including a mocking framework and design the code to allow you to build your own [Test Doubles](https://www.martinfowler.com/bliki/TestDouble.html). Setup a pipeline that continuously runs tests and notifies you of failures. Get proficient with containers. Find a web service test double like [WireMock-Net](https://github.com/WireMock-Net/WireMock.Net), [WireMock (Java)](http://wiremock.org), and [Mountebank](http://www.mbtest.org/docs/gettingStarted). Try to isolate the application process under test, but in a way where you can run it normally. That way you can start testing your existing apps from the outside in. Build up your toolbox so that you can apply your skills in a surgical way, solving each problem as it rears it's ugly head. I know you can do it. I have faith in you.

## Related articles

- [Class Too Large](https://martinfowler.com/articles/class-too-large.html)
