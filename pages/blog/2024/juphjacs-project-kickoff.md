---
layout: './pages/layouts/post.html'
title: 'Juphjacs Project Kickoff'
excerpt: 'Why I am building Juphjacs, a minimal, composable web framework - and how the journey really started back in 2009.'
canonical: 'https://joeyguerra.com/blog/2024/juphjacs-project-kickoff.html'
published: 2024-09-22
uri: '/blog/2024/juphjacs-project-kickoff.html'
tags: ['juphjacs', 'framework', 'architecture', 'dx', 'history']
---

# Juphjacs Project Kickoff

Technically, the project kicked off in the 22nd week of September 2024, but the ideas and desire have been building since 2009.

I don’t want a framework that replaces my thinking. I want one that supports it. Over the years I’ve noticed most modern frameworks make it hard to answer simple questions: what code runs, in what order, with what inputs, and why?

Too much hidden machinery. Too many conventions dressed up as magic. And a cognitive cost that grows faster than the benefits.

Juphjacs starts from a simpler premise: stay close to the platform, keep concepts honest, and let developers do small things that compose into big things. No lock-in. No opaque lifecycles. No clever tricks that compromise clarity.

## Origins: 2009–2024

The desire for this approach goes back to 2009. I was building systems where correctness and clarity mattered more than novelty - integrations, content negotiation, boundary APIs, and UI layers that weren’t allowed to break on Friday nights. Every time a framework traded explicitness for magic, it made incident response and maintenance harder.

Across jobs and side projects, I kept sketching the same patterns: small page objects, explicit routing, clear rendering steps, and the ability to see what’s happening - not guess. Those sketches turned into utilities. The utilities turned into conventions. In September 2024, they finally turned into a project with a name.

## Goals
- Fast: serve up static pages most of the time - inspired by the [C10k problem](https://en.wikipedia.org/wiki/C10k_problem)
- Minimal routing that maps URLs to files without ceremony
- Composable page objects with just enough structure
- Server-side rendering first, client-side hydration when useful
- Extensible via simple plugin hooks - no framework lock-in
- Transparent behavior you can read and understand in an afternoon

## Principles

- Minimize abstraction between your code and the platform
- Prefer explicit data flow over hidden lifecycles
- Make failure modes easy to see and recover from
- Adopt incrementally - use only what you need
- Optimize for clarity, not cleverness

## What’s already working

- File-based routing with explicit page handlers
- Page class composition with layout rendering
- Hot reload for development and simple plugins (e.g., Blog)

## What’s next

- Refining SSR and hydration boundaries
- Stabilizing plugin lifecycle hooks
- Documentation with examples and migration notes
- Developer tooling that improves feedback loops

Github Repo: [Juphjacs Code](https://github.com/joeyguerra/juphjacs)

Follow the mission: [Juphjacs - align the problem with the solution](/missions/juphjacs.html)

Back to the blog: [Mission Log](/blog/mission-log.html)