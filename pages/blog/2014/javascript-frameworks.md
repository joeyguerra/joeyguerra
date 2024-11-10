# The internet is filled with Javascript Frameworks

[Kijana](http://kijanawoodard.com/) just sent me an email stating, Another reason using js frameworks isn't a great investment: a new one will be released next week referring to an answer on [Quora](http://www.quora.com/), [Facebook's React vs AngularJS, A Closer Look](http://www.quora.com/Pete-Hunt/Posts/Facebooks-React-vs-AngularJS-A-Closer-Look). I agreed with the statement and ventured out to add another data point to support it.

I've long practiced implementing the [Model, View, Controller design pattern](http://en.wikipedia.org/wiki/Model–view–controller) in Javascript. And so I thought, hmmm, this would be perfect! On over to <a href="https://jsfiddle.net/joeyguerra/U4Lra/41">JSFiddle</a> where I coded up the star rating widget example in the Quora answer, implementing the [MVC design pattern](http://en.wikipedia.org/wiki/Model–view–controller) with just some good 'ol regular Javascript.

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'The internet is filled with Javascript Frameworks',
        excerpt: 'Just implement the MVC pattern in Javascript.',
        shouldPublish: true,
        uri: '/blog/2014/javascript-frameworks.html',
        published: new Date('2014-03-01T16:43:08.111Z'),
        tags: ['frameworks', 'javascript']
    }
</script>