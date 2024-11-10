# Is MVC an architecture or a framework?

I wouldn't characterize it as either an architecture or a framework. MVC is a behavioral design pattern which establishes a communication pattern amongst a Model, a View and a Controller. The Model responsible for data, the View as the visualization of that data to a person and the Controller as the mediator between a user and the Model through the View, amongst an actual person and their interaction with a mouse and keyboard on a computer. [MVC](http://heim.ifi.uio.no/~trygver/themes/mvc/mvc-index.html) was invented specifically to separate concerns with the codebase, while establishing a well known comunication strategy amongst the objects.

If you think about a physical building like a school or library, MVC is analogous to the plumbing and electric wiring. Where toilets, faucets, lights and vacuum cleaners interact with water, electricity and people with them. Where as the architecture of a building, is conveyed via the style used, the materials, and the framing.

When consisdering a church, the arches are common architectural elements, but not necessarily in apartments or homes. Although they could be, it doesn't necessarily make it a church, because there's other architectural elements that together distinguishes it from a church.

As for the term framework, I think of it along the same lines as scaffolding. Where *frame* is a synonym for both framework and scaffolding.

With these definitions, reconsider the question. Would you use MVC, a pattern for communication, as an architecture? I would hope not. Lest you run into problems like the *Massive Controller* and a breakdown in system design because you still need a framework for the overall application.

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'Is MVC an architecture or a framework?',
        excerpt: "There's a lot of ideas about what MVC is and isn't. Here's my take.",
        shouldPublish: true,
        uri: '/blug/2019/mvc-architecture-framework.html',
        published: new Date('2019-08-01T16:43:08.111Z'),
        tags: ['mvc', 'architecture']
    }
</script>