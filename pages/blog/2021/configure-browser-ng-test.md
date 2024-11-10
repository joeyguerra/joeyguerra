# Use Safari Instead of Chrome with Angular (ng test)

I don't use Chrome. I'm a rebel I guess. So when building Angular apps and practicing TDD, I wanted to configure Karma to use Safari instead of Chrome.

Running `ng test` fails with "Cannot start Chrome". So I configured Karma to use Safari instead.

```zsh
npm i karma-safari-launcher -D
```

Then, update `karma.conf.js` with the following:

```
// from
browsers: ['Chrome'],

// to
browsers: ['Chrome', 'Safari'],
```

Then, run `npm test -- --browsers Safari`.

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'Use Safari Instead of Chrome with Angular (ng test)',
        excerpt: "I don't use Chrome. I'm a rebel I guess. So when building Angular apps and practicing TDD, I wanted to configure Karma to use Safari instead of Chrome.",
        shouldPublish: true,
        published: new Date('2021-03-27T11:17:00.000Z'),
        tags: ['programming is hard'],
        uri: '/blog/2021/configure-browser-ng-test.html'
    }
</script>