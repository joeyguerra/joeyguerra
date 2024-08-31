---
layout: layouts/post.html
title: The Difference Between SOLID and Design Patterns
summary: So with the talk of learning a design pattern and not trying to shoehorn it into everything, is SOLID one of those things where its use case is specific to a task or is it generally just something to follow?
should_publish: yes
published: 2020-04-08T17:59:00.000Z
---

# The Difference Between SOLID and Design Patterns

So with the talk of learning a design pattern and not trying to shoehorn it into everything, is [SOLID](https://en.wikipedia.org/wiki/SOLID) one of those things where its use case is specific to a task or is it generally just something to follow?

KW: there's a natural ebb and flow to SOLID. I would describe it as guardrails. e.g. Single Responsibility. You could get insanely pedantic about the definition and drive yourself crazy resulting in an muddled code base.

KW: on the flip side, you can easily recognize that a single function that is 500 lines longs and does 20 things is "probably too big".

CW: Ok. I guess my follow up would be how you define something as guardrails vs an actual design pattern?

JG: a design pattern is just that, a pattern that's apparent across lots of different solutions.

KW: [SOLID](https://en.wikipedia.org/wiki/SOLID) is a set of "principles"; the design patterns were laid out originally in "the gang of four book".

KW: The key insight on design patterns is that they are emergent. The authors didn't, LOL, "design" the design patterns. Rather they discovered and documented them.

JG: Use patterns as a tool to solve the problems that they have been known to solve.

JG: Principles are more for creating “aspects”, characteristics that you want your software to exhibit.

KW: On [SOLID](https://en.wikipedia.org/wiki/SOLID), [Single Responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle) is more vague than say Liskov Substitution. I'd say that gives it more power, but more ability to be abused. Peter Parker and so forth... 

JG: So always be on the look out for when the software doesn't have those characteristics, so that you can then use [SOLID](https://en.wikipedia.org/wiki/SOLID) to build in those characteristics.

KW: Yeah. For instance, once you understand [Liskov](https://en.wikipedia.org/wiki/Liskov_substitution_principle) abuses, you start seeing them all over the place and realize people are just blindly coding to "get stuff done" without recognizing the "future bugs" they are creating.

JG: or the actual “structure” (e.g. communication strategies amongst the objects) that's created in the software.

KW: e.g. in a derived class, `override Whatever....{ throw new NotImplementedException() }` If you substitute this implementation, your app goes BOOM. Bad design.

JG: I feel like that's been the hardest thing for me to understand and visualize. While we want software to be soft, it's not. It takes mastery to gain the intuition for what code is creating rigidity and which is not.
