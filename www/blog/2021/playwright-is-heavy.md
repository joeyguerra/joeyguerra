---
layout: layouts/post.html
title: Publish to Artifactory job is failing after adding Playwright
summary: |
    I'm generating PDFs of purchase orders in dotnet with Playwright. The publish to Artifactory pipeline job starting failing with no indication why.
should_publish: yes
published: 2021-09-28T18:45:00.000Z
---

# Publish to Artifactory job is failing after adding Playwright.

Delete all the platform specific Node.js executables from the dist/ folder to reduce the package size.