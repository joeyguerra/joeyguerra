---
layout: './pages/layouts/post.html'
title: 'index97 Project Kickoff'
excerpt: 'Why I am building index97, a Bun-native web framework - and how the journey really started back in 2009.'
canonical: 'https://joeyguerra.com/blog/2024/index97-project-kickoff'
published: 2024-09-22T00:00:00Z
uri: '/blog/2024/index97-project-kickoff'
tags: ['index97', 'framework', 'architecture', 'dx', 'history']
---

# index97 Project Kickoff

Technically, the project kicked off in the 22nd week of September 2024, but the ideas and desire have been building since 2009.

I don't want a framework that replaces my thinking. I want one that supports it. Over the years I've noticed most modern frameworks make it hard to answer simple questions: what code runs, in what order, with what inputs, and why?

Too much hidden machinery. Too many conventions dressed up as magic. And a cognitive cost that grows faster than the benefits.

index97 starts from a simpler premise: stay close to the platform, keep concepts honest, and let developers do small things that compose into big things. No lock-in. No opaque lifecycles. No clever tricks that compromise clarity.

## Origins: 2009–2024

The desire for this approach goes back to 2009. I was building systems where correctness and clarity mattered more than novelty - integrations, content negotiation, boundary APIs, and UI layers that weren't allowed to break on Friday nights. Every time a framework traded explicitness for magic, it made incident response and maintenance harder.

Across jobs and side projects, I kept sketching the same patterns: explicit routing, clear rendering steps, and the ability to see what's happening - not guess. Those sketches turned into utilities. The utilities turned into conventions. In September 2024, they finally turned into a project with a name.

## Goals

- **Bun-native**: built on Bun's fast file I/O, built-in Markdown rendering, and native HTTP server
- **File-based routing with no config**: drop a file in `pages/`, get a route - the extension determines how it's handled
- **Server-side rendering first**: plain `.html`, templated `.phtml`, handler-backed `.js`, or content `.md` - pick what fits
- **Zero configuration**: `createServer({ pagesDir: './pages' })` is the entire setup
- **Transparent behavior** you can read and understand in an afternoon

## Principles

- Minimize abstraction between your code and the platform
- Prefer explicit data flow over hidden lifecycles
- Make failure modes easy to see and recover from
- Adopt incrementally - use only what you need
- Optimize for clarity, not cleverness

## What's Already Working

- **Extension-driven routing**: `.html` serves directly, `.phtml` renders with handler data, `.js` exports named HTTP method functions (`GET`, `POST`, `DELETE`…), `.md` renders from Markdown
- **Dynamic routes**: bracket syntax (`[slug].js`) maps to URL parameters with no extra config
- **Layout system**: `_layout.html` wraps pages by directory proximity; `_layout.js` supplies shared data (session, nav) to every page beneath it
- **Template engine**: `{{name}}`, `{{{raw}}}`, `{{#if}}`, `{{#each}}`, `<include>`, and named slots via `<template data-slot="…">`
- **Form method rewriting**: PUT, PATCH, DELETE forms work without JavaScript
- **HMR in development**: edit any file, the browser updates instantly
- **Static site generation**: `bunx index97 build` renders all routes to `dist/`

Github Repo: [index97](https://github.com/devchitchat/index97)
