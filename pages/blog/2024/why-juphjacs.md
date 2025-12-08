---
title: "Why I'm Building Another Web Framework"
excerpt: 'The reasoning behind starting this project and what I hope to learn.'
layout: './pages/layouts/post.html'
canonical: 'https://joeyguerra.com/blog/2024/why-juphjacs.html'
published: '2024-08-31'
tags: ['juphjacs', 'framework', 'philosophy', 'learning']
---

# Why I'm Building Another Web Framework

The world doesn't need another web framework. There are already dozens of excellent options. So why am I building Juphjacs?

It's not because I think I can build something better than Next.js, SvelteKit, or Astro. It's because I have a different set of values that I want to manifest into a framework and I want to understand how those values impact how web software evolves.

## The Real Motivation

I've been building web applications for over 25 years. I've used Rails, Express, React, Blazor, WordPress, Spring Boot, and most of the modern JavaScript frameworks. Each one taught me something valuable, but they all share a common trait: **they hide complexity to make development faster**.

That's a feature, not a bug. Hiding complexity is what frameworks are supposed to do.

But after years of using abstraction layers built by others, I realized my mental model of building and evolving software for the internet is very different then those that built those frameworks. I could use these frameworks effectively, but I didn't agree with the design trade-offs they made.

I could continue to just use the frameworks. But I wanted my decisions to be tested by reality.

**Building forces you to confront every decision.** You can't gloss over the hard parts.

## What I Want to Learn

Juphjacs is a learning project disguised as a framework. Here's what I'm exploring:

### 1. Routing Without Magic
Most frameworks use conventions that feel magical: file structure automatically becomes routes, dynamic segments are extracted from URLs, layouts nest based on directory depth.

I want to build routing that's completely transparent. No conventions. No hidden transformations. Just: "This file handles this URL." If it works, I'll understand exactly why. If it breaks, I'll know where to look.

### 2. Minimal Abstractions
Modern frameworks provide powerful abstractions: data fetching hooks, server components, reactive state management, optimized bundling. These are incredible achievements.

But what's the simplest thing that could possibly work? Can I build something useful with just:

- Page classes that handle requests (simple software design)
- Template composition
- A basic plugin system

If I can, what does that teach me about what's essential vs. what's convenience?

### 3. Plugin Architecture
Plugins are where frameworks get extensible. But how do you design a plugin system that's simple enough to understand yet flexible enough to be useful?

I want to learn:
- What lifecycle hooks actually matter
- How to avoid tight coupling between core and plugins
- Where to draw boundaries between framework code and user code

### 4. Developer Experience
Why do some frameworks feel intuitive while others feel like fighting the system?

I'm exploring questions like:
- What makes routing obvious or confusing?
- How much configuration is helpful vs. overwhelming?
- When should the framework be opinionated vs. flexible?
- What error messages actually help?

### 5. Performance vs. Simplicity
Modern frameworks are obsessed with performance: code splitting, tree shaking, partial hydration, streaming SSR. These optimizations are impressive, but they add complexity.

Where's the inflection point? What performance gains matter most? Which optimizations can you skip and still have a viable framework? Serving a static file is super fast - what software design leverages that fact?

## What Success Looks Like

Juphjacs doesn't need to compete with production frameworks. Success looks like this:

- **I understand routing deeply**: I can explain every step from URL to response without handwaving
- **I can teach others**: The code is simple enough that someone could read it and learn from it
- **It works for real projects**: I can build actual sites with it (like this blog) and it doesn't feel painful
- **I learn the constraints**: I discover why frameworks make the trade-offs they do

If Juphjacs helps someone else learn how frameworks work, that's a bonus. But the primary beneficiary is me.

## Why "Juphjacs"?

The name is intentionally flipant. It's an acronym for "Just Use Plain HTML, JavaScript, and CSS Stupid". It's a play on Keep It Simple Stupid (KISS). It's a reminder that simple design is hard and it takes effort to keep it that way.

## What's Different About This Approach?

Innovation happens in a learning environment where people are curious and trying to understand.

Most frameworks are built to solve production problems: scale, performance, developer productivity, team coordination. They're designed for real businesses with real constraints.

Juphjacs is built to solve a learning problem: **What's the simplest mental model for a web framework?**

That means:
- Explicit over implicit
- Transparency over convenience
- Education over optimization (but it turns out that it's fast)

If it turns out these priorities also make for a good developer experience, that's worth exploring. But the primary goal is learning.

## The Journey So Far

I started coding Juphjacs in late August 2024, but the ideas have been brewing since 2009. Every time I hit a confusing framework behavior, I'd think: "How would I design this?"

Now I'm finding out.

Early lessons:
- Routing is harder than it looks (URL normalization, query parsing, static vs. dynamic pages)
- Template composition has subtle edge cases (variable scope, layout nesting, async rendering)
- Error handling needs design from day one, not bolted on later

## What's Next

Over the coming months, I'll be:
- Refining the routing system
- Building out the plugin architecture
- Documenting patterns and anti-patterns
- Using Juphjacs to build real projects (including this blog)
- Writing about what I learn

If you're interested in how frameworks work under the hood, follow along. I'll be sharing the messy parts, not just the polished outcomes.

Follow the mission: [Juphjacs Web Framework](/missions/juphjacs.html)

Back to the blog: [Mission Log](/blog/mission-log.html)
