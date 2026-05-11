---
title: "Why I'm Building Another Web Framework"
excerpt: 'The reasoning behind starting index97 and what I hope to learn.'
layout: './pages/layouts/post.html'
uri: '/blog/2024/why-another-web-framework'
published: 2024-08-31T00:00:00Z
tags: ['index97', 'framework', 'philosophy', 'learning']
---

# Why I'm Building Another Web Framework

The world doesn't need another web framework. There are already dozens of excellent options. So why am I building index97?

It's not because I think I can build something better than Next.js, SvelteKit, or Astro. It's because I have a different set of values that I want to manifest into a framework and I want to understand how those values impact how web software evolves.

## The Real Motivation

I've been building web applications for over 25 years. I've used Rails, Express, React, Blazor, WordPress, Spring Boot, and most of the modern JavaScript frameworks. Each one taught me something valuable, but they all share a common trait: **they hide complexity to make development faster**.

That's a feature, not a bug. Hiding complexity is what frameworks are supposed to do.

But after years of using abstraction layers built by others, I realized my mental model of building and evolving software for the internet is very different then those that built those frameworks. I could use these frameworks effectively, but I didn't agree with the design trade-offs they made.

I could continue to just use the frameworks. But I wanted my decisions to be tested by reality.

**Building forces you to confront every decision.** You can't gloss over the hard parts.

## What I Want to Learn

index97 is a learning project disguised as a framework. Here's what I'm exploring:

### 1. Routing Without Magic

Most frameworks use conventions that feel magical: file structure automatically becomes routes, dynamic segments are extracted from URLs, layouts nest based on directory depth.

I want routing that's completely transparent. The extension on a file determines exactly how it's handled — `.html` is served directly, `.phtml` renders with data from a `.js` handler, `.md` becomes a page from Markdown, `[slug].js` becomes a dynamic route. No hidden transformations. If it works, I'll understand exactly why. If it breaks, I'll know where to look.

### 2. Minimal Abstractions

Modern frameworks provide powerful abstractions: data fetching hooks, server components, reactive state management, optimized bundling. These are incredible achievements.

But what's the simplest thing that could possibly work? Can I build something useful with just:

- Plain async functions that return data
- Template composition
- A file tree as the router

If I can, what does that teach me about what's essential vs. what's convenience?

### 3. Platform Proximity

Bun gives you fast file I/O, built-in Markdown rendering, native YAML parsing, and a high-performance HTTP server. Most frameworks abstract over these. index97 leans into them directly.

I want to learn where that bet pays off and where it creates constraints.

### 4. Developer Experience

Why do some frameworks feel intuitive while others feel like fighting the system?

I'm exploring questions like:
- What makes routing obvious or confusing?
- How much configuration is helpful vs. overwhelming?
- When should the framework be opinionated vs. flexible?
- What error messages actually help?

### 5. Performance vs. Simplicity

Modern frameworks are obsessed with performance: code splitting, tree shaking, partial hydration, streaming SSR. These optimizations are impressive, but they add complexity.

Where's the inflection point? What performance gains matter most? Which optimizations can you skip and still have a viable framework? Serving a static file is super fast — what software design leverages that fact?

## What Success Looks Like

index97 doesn't need to compete with production frameworks. Success looks like this:

- **I understand routing deeply**: I can explain every step from URL to response without handwaving
- **I can teach others**: The code is simple enough that someone could read it and learn from it
- **It works for real projects**: I can build actual sites with it (like this blog) and it doesn't feel painful
- **I learn the constraints**: I discover why frameworks make the trade-offs they do

If index97 helps someone else learn how frameworks work, that's a bonus. But the primary beneficiary is me.

## Why "index97"?

The name is a reminder of what the web was before it got complicated. `index.html` is where every site starts. 1997 is when the web was still mostly files in folders — no build steps, no bundlers, no framework config. index97 is an attempt to get back to that simplicity while keeping what actually matters: server-side rendering, dynamic data, and a runtime that's fast enough to not think about.

## What's Different About This Approach?

Most frameworks are built to solve production problems: scale, performance, developer productivity, team coordination. They're designed for real businesses with real constraints.

index97 is built to solve a learning problem: **What's the simplest mental model for a web framework that runs on Bun?**

That means:
- Explicit over implicit
- Transparency over convenience
- Education over optimization (but it turns out that it's fast)

If it turns out these priorities also make for a good developer experience, that's worth exploring. But the primary goal is learning.

## The Journey So Far

I started coding index97 in late August 2024, but the ideas have been brewing since 2009. Every time I hit a confusing framework behavior, I'd think: "How would I design this?"

Now I'm finding out.

Early lessons:
- Routing is harder than it looks (URL normalization, query parsing, static vs. dynamic pages)
- Template composition has subtle edge cases (variable scope, layout nesting, async rendering)
- Error handling needs design from day one, not bolted on later

Github Repo: [index97](https://github.com/devchitchat/index97)
