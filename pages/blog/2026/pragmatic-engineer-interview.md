---
layout: './pages/layouts/post.html'
title: "I Asked My Coding Agent to Interview Me Like The Pragmatic Engineer Would"
excerpt: "I had my Claude Code agent play interviewer - channeling the guy who runs The Pragmatic Engineer - and ask me the pointed questions I don't usually sit with. Here's what came out: a space station, a folder that moved desk to desk, a MySQL server falling over, and why money you don't have is bad business."
published: 2026-08-15T16:00:00Z
uri: '/blog/2026/pragmatic-engineer-interview'
image: '/images/pragmatic-engineer-interview-hero.svg'
tags: ['interview', 'career', 'engineering philosophy', 'leadership', 'nasa']
---

<img src="/images/pragmatic-engineer-interview-hero.svg" alt="A blueprint-style illustration of a space station module in orbit, with a tethered astronaut and waypoint icons for a folder, a terminal, and growth">

# I Asked My Coding Agent to Interview Me Like The Pragmatic Engineer Would

I told my coding agent to pull up my personal site's repo and interview me for a blog post - playing the guy who owns and runs [The Pragmatic Engineer](https://www.pragmaticengineer.com). No script, no pre-approved questions. Just: ask me the things that publication would ask.

It came back with six questions built to find the specific story behind the generic title. Two of them assumed I'd have a clean "the moment everything changed" answer. I didn't, and said so. What came out instead was more honest than what I would've written if you'd asked me to just "write a post about my career."

Here's the transcript, cleaned up.

## Consequences Were Never Optional

**Q: Most engineers have a moment where they stopped being "someone who codes" and started being "someone who owns outcomes." What was that moment for you?**

It's blurry, but it was around 1997 to '99. I was working at Lockheed Martin on the International Space Station contract - EVA hardware and tools, thermal analysis, workspace analysis for spacewalks. In parallel, on nights and weekends, I was teaching myself to build websites and picking up small e-commerce clients on the side.

Those two things couldn't have been more different in stakes - one was literally life-critical hardware, the other was some client's shopping cart. But when something broke on the website side and a client found a bug, I remember feeling genuinely bad about it - responsible, not just "oh, a ticket." Looking back, I think that came from two places at once: spending my day job around hardware where a mistake has an astronaut on the other end of it, and just a personal trait of feeling like whatever I build is mine to make work, not just mine to write.

I don't think there was a single incident that flipped a switch. It was more that I never really had the option to think of code as separate from consequences - I learned to program in the shadow of work where consequences were about as real as they get.

## There Wasn't a Messy Incident - There Were Two Lessons

**Q: What's a production incident, migration, or decision that went sideways that you still think about - not the polished version, the actual messy one?**

With the first two questions, I'm realizing they're very pointed questions that assume a particular moment happens that flips a switch. But that honestly just hasn't happened to me. There were incidents that imparted lessons, but I don't really consider them messy.

I worked for an online dating website around 2007 and took over building the text and video chatting system from another developer, because they refused to acknowledge that what they'd built had a performance problem. After analyzing how it was designed, I decided it was an architectural design flaw and needed a redesign.

When we launched the version I built (with two other team members), the MySQL database server fell over from the traffic. We just rolled back to the previous system. It doesn't feel that "messy" to me - we diagnosed it, tried the fix, it didn't hold, we rolled back. That's the job.

The lesson I still carry from that same company is about being agile instead of doing agile. The Director of PMO designed a process built around a physical vanilla folder for every project. The folder would make its way around the different roles - requirements, design, development, QA. Its status was literally whose desk it was on. If something was missing - a requirement, a mock - the folder went to whoever needed to fill it. That resulted in moving fast while staying deliberate.

It's also where I learned about the number of communication channels in a network being n(n-1)/2, where n is the number of people on the project - which helps you understand how complexity in communication scales with headcount. These became my reference points as the industry started adopting agile methodologies like Scrum and the daily standup. They gave me a clear, simple understanding I carried into management - of how a team actually operates versus how a framework says it should.

Most of what I've learned in the rest of my career since then has been about people, organizations, Conway's Law, and how similar the physics of computing are to the physics of people in organizations.

## Simple First

**Q: What's something you believe about how software should be built that most of your peers would push back on?**

Software should be built simple first. Local-first development, assume a single processor plus SQLite - an embedded database - as opposed to jumping straight to horizontal scaling that requires a separate database service. It still surprises me how many developers reach for multi-tier architecture just to start with.

Another contrarian take: most enterprise-type problems are easily solved with JavaScript and a JavaScript runtime - no front-end framework, plain HTML and CSS. Serving a static file is so much faster than a dynamic website that has to pass data through multiple tiers before it ever reaches the user. Sure, some problems genuinely require more complicated architectures. But start simple, then bump your way into those problems and solve them as they show up. Don't start at the complicated end.

## Constraints Are a Design Tool

**Q: You're running your own p2p git/CI-CD mesh across a pod and a Mac mini instead of just using GitHub Actions and a cloud host. Convince me that isn't a waste of time in 2026.**

I'm a big believer in constraints driving good design. I lean on that principle to build good-enough solutions. How far do I have to go to convince you that spending more money than you have, when other options exist, is bad business?

## What I Want to Be Known For (I'm Still Finding Out)

**Q: joeyguerra.com is your personal brand anchor, not a company blog or a product. What are you actually trying to be known for, and is that different from what you're known for today?**

I don't know. I was hoping I could come up with the shape of an answer by building to learn.

What I do know: I'm proud of being an engineer. I love helping people. I love working on my computer, with computers, building software and systems on the internet. The feedback loop can be really fast, and I'm a bit impatient - I like that about the work. I love that I had a "good" pole vaulting career through college (17'-4"). I don't consider myself a talented athlete, but I do consider myself a hard worker, and I value work and effort. I love that I "used to work at NASA/JSC," even though I didn't build rockets or play with space vehicles as a kid.

But there's one thing that stands out when I think about what I want to be doing every day: I really love being part of people's growth journeys - helping, enabling, convincing them to be their best selves. Seeing people thrive.

I'm actually unsure what I'm known for *today*. The main public place with info on me is my LinkedIn profile, besides this site. I'd genuinely love it if my previous work colleagues told me what they think I'm known for - I'd love that feedback so I could either keep doing what I'm doing, or change it.

(So - if you've worked with me and you're reading this: tell me. I mean it.)

## What I'd Tell a 25-Year-Old Joey

**Q: If a 25-year-old version of you showed up in your DMs asking how to get where you are, what's the one piece of advice you'd give that isn't the obvious "learn to code well"?**

My step-father died when I was 24. My brother and I helped my mom sell his business so she could have income. I lived with my mom until I was about 28 to help her financially.

My gut reaction is to tell that version of me to save as much money as I could have, because money means freedom, options, and I value that.

What's funny is that at 25, I wasn't interested in coding or building software. I didn't have any strong interests at all. So maybe that's the other thing I'd tell myself: discover some interests. The money advice doesn't mean much without something you're actually trying to buy freedom *for*.

---

I went into this expecting a tidy narrative-arc post. What I got instead was two questions I had to push back on, an unresolved answer about what I want to be known for, and a formula for communication overhead I picked up from a director who tracked project status with a physical folder. That feels closer to the truth than the version with a clean origin story would have been.
