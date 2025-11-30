---
layout: './pages/layouts/post.html'
title: 'What is an event?'
excerpt: "Not the kind with finger food and name tags. I mean the kind that runs your business - quietly, relentlessly, behind every invoice, every click and every \"oops\"."
published: 2025-10-13T21:12:00Z
uri: '/blog/2025/what-is-an-event.html'
tags: ['event', 'software', 'modeling']
---

# What is an event?

Let's talk about events.

Not the kind with finger food and name tags. I mean the kind that runs your business — quietly, relentlessly, behind every invoice, every click, and every "oops."

In software, we love to obsess over state. "What's the current status?"; "Is this order active?"; "Did the payment go through?".

But here's the thing — state is just a snapshot of the past (a point in time). It's a Polaroid in a world that's constantly changing. The real story — the movie — lives in the events.

## The Movie vs. The Snapshot

Imagine you walk into a room. There's a kid holding a gold medal. You can guess: "They must've won a race.". But you didn't see the race — the sweat, the stumble, the last-second surge.

That's what most software systems do: They store the medal and forget the race.

Event-based systems say:
> Forget the snapshot — give me the tape (think VHS tape here).

## So What Is an Event?

An event is a fact about something that already happened — a moment in time that changed the world (or at least your business).

It's always written in the past tense:
- OrderWasPlaced
- InvoiceWasSent
- PaymentWasReceived
- UserLostPasswordForTheThirdTimeThisWeek

Events are immutable (you can't change them) — once they happen, you can't un-happen them; you can only react.

## Event Sourcing: The Ledger of Truth

If you think of your app like an accountant would, your database doesn't just hold balances — it holds transactions. That's what Event Sourcing is. Instead of saving "the current state," we store every event that got us here.

Your app becomes a storybook of everything that's ever happened.

```sh
AccountWasOpened
MoneyWasDeposited(amount: 100)
MoneyWasWithdrawn(amount: 25)
```

Current balance? Easy. Rewind the "tape" (it helps to think about events being stored on a tape like how we used to store videos on VHS) and replay the events. You can calculate the current account balance with: 100 - 25 = 75 (this can be thought of as a "projection"). But more importantly, you know how you got there.

State tells you *what* is.
Events tell you *how* it came to be.

## Event Modeling: Designing the Story

Now let's move from accounting to storytelling.

Event Modeling is the art of designing your system as a timeline of these events — a storyboard of the user's and the system's actions.

You start with the end in mind: "What should the user see?"

Then you work backward:
- "What events must have happened in order for that view to exist?"
- "What command triggered that event?"

It's basically Pixar for software systems.

## Why Business Owners Should Care

Because your business is a series of events. Every sale, refund, login, support ticket — all of it is the story of how your company interacts with the world. This is often obvious to business owners, but often non-obvious to people heads down building software.

When you model your software around those facts, you get clarity:
- No more mysterious "why is this record like this?" moments.
- Easier audits and debugging.
- The ability to replay history and learn from it.

It's not just good software — it's organizational memory.

## The Shift in Thinking

When you stop asking, "What's the state of things right now?"
and start asking,

> What happened to get us here?

You stop coding CRUD (Create Read Update Delete) apps and start designing living systems.

You build software that tells a story.
**A system that explains itself.**
**A business that can learn from its own past — without therapy.**

## TL;DR

An event is a record of something that happened — not a request, not a wish, not a prediction; just the truth, recorded and timestamped.

Everything else — reports, dashboards, "current status" screens — is just the highlight reel. The event log is the game itself.

Want to start thinking in events?

Start writing your system's story in past tense.
Then sit back and watch how clear the future gets.
