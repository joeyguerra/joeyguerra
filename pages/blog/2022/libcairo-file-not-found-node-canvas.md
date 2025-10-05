---
layout: './pages/layouts/post.html'
title: "Error loading shared library libcairo. No such file or directory"
excerpt: "Building alpine Docker image for NodeJS app using node canvas and getting error from libcairo. The lesson learned is libcairo depends on the installed packages still being in the image and I wasn't including them."
published: 2022-09-11
uri: '/blog/2022/libcairo-file-not-found-node-canvas.html'
tags: ['whyprogrammingissohard']
---
# Error loading shared library libcairo.so.2: No such file or directory

I created a build layer in my Dockerfile but didn't apk add the required packages to the app layer. And so libcairo couldn't find the files it depends on.

## Broken Version

```bash
FROM node:alpine3.16 as build
WORKDIR /app
RUN apk add --update --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    libtool
COPY . .
RUN npm ci


FROM node:alpine3.16
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["npm", "start"]
```

## Working Version

```bash
FROM node:alpine3.16 as build
WORKDIR /app
RUN apk add --update --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    libtool
COPY . .
RUN npm ci
ENTRYPOINT ["npm", "start"]
```
