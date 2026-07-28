---
layout: './pages/layouts/post.html'
title: "How do you host a website on the Interplanetary File System and also make all the links work?"
excerpt: "IPFS is a decentralized, peer-to-peer distributed file system. I think it's super amazing, so I set out to use it for something simple like hosting my website."
published: 2020-01-26T10:00:00-06:00
uri: '/blog/2020/website-on-ipfs-and-working-links'
tags: ['ipfs', 'web']
---
# How do you host a website on the Interplanetary File System and also make all the links work?

The Interplanetary File System ([IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System)) is a software system that enables sharing files without having to upload them or host them on a centralized system. In more technical terms, IPFS is a decentralized, peer-to-peer distributed file system. I think it's super amazing, so I set out to use it for something simple like hosting my website.

My website is just a bunch of files, HTML, CSS, javascript, and images; all in a folder called public. It's generated from some templates. So I [installed IPFS](https://simpleaswater.com/installing-ipfs/) on my MacBook and opened up my website codebase with Visual Code. After generating the site, I added the public/ folder to the IPFS with `ipfs add -r public` and got this in the console.

```
added Qmdi2cjky77ctt2KN5aCzcWTtpALxH5w5k8zQZ7mSTsADx public/blog/2014
added QmU6rrS5r4tY5HzxUtG9K16CG2QBBqtTioHdYdHjuneNZn public/blog/2016
added QmRAtFSwuKJTvT3bSDnFrNZfK6xdpEkYC2KbD23RScxG6M public/blog/2017
added QmWNy14WffDRQR2HYxx4r2Hk1KLPoLJ7doY4ggTQuY8L5y public/blog/2018
added Qmd1E7RrQDpxewAbV3DQrJzTdoSK88woKbTcpwndLmPamW public/blog/2019
added QmNfppLEgxeevsaVs9ReUhpnTT3WLx7Z261TWPQMtu2Gzi public/blog/2020
added QmPJ7PYoj5LRaHm7ZnxgTqT51MnQZBeBWkiwScsC6Yv4pR public/blog
added QmUP5yLpgXtmR5Gqc3WvAAWvgZcXhdsxYZzrrYBRRhCQnT public/css
added QmYcSdhCV4CezCNdBWaknNaMorMY4GU2VdsPSP6AKbHEPr public/favicon_package_v0
added Qmav5NZHqiCm6xLGXaGEsdS2Lnbt67PURGEBJVHKDMPkxq public/favicons
added QmNyMTSGYs47jEaKoPXb8Mm6WGBEh7b9nWfFkpwFwJfaLH public/imgs
added QmbjJSkDQWNTijRKJowT69pd4SAeZzUgFYN8Y5qYVRDXs8 public
7.16 MiB / 7.18 MiB [=======================================================================================================================================]  99.72%
```

I started the IPFS daemon with `ipfs daemon` and loaded up the site in my browser by constructing a URL with the CID (QmbjJSkDQWNTijRKJowT69pd4SAeZzUgFYN8Y5qYVRDXs8) for the public folder and voila, my site loads (http://localhost:8080/ipfs/QmbjJSkDQWNTijRKJowT69pd4SAeZzUgFYN8Y5qYVRDXs8/).

I was excited until I clicked on the blog link and the page was broken. Images didn't load and it looked like the css wasn't applied. So I opened the web console and noticed a bunch of 404s. I looked at the URL bar and realized that all the paths for things like the CSS file were absolute, which resulted in an HTTP request for the CSS file that didn't include the CID. I also noticed after clicking on some of the links that they also resulted in 404s. Unfortunately, searches on the web didn't turn up any help, other than advice to make all links relative. And then I remembered something about HTML from the early days of the web.

There's an HTML element called [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) which specifies the base URL to use for all relative URLs in a document. So I just added a base element and iterated on different relative paths to find a pattern that worked consistently. As I worked through it, I realized how tedious it would be to do this for many pages so I found a pattern where all links can be relative while the base element href attribute would be the only piece that I have to set. For pages at the root level, I could add `<base href="./">` to the main layout HTML template. For the pages under the /blog/ path, I could add `<base href="../">`. And for the pages under the /blog/{year}/ path, `<base href="../../">` and this worked.

I love the idea of the decentralized web. So I'm going to continue my exploration of the technologies that make it possible so stay tuned. I'll continue to post what I learn.
