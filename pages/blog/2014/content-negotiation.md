---
layout: './pages/layouts/post.html'
title: "Content Negotiation in Node JS, augmenting Express JS"
excerpt: "tldr; Building websites with content negotiation in mind gives you flexibility."
published: 2014-07-01
uri: '/blog/2014/content-negotiation.html'
tags: ['rest']
image: ''
---

# Content Negotiation in Node JS, augmenting Express JS

[Others](http://stackoverflow.com/questions/10958063/set-up-rest-routes-in-express-js-for-ajax-only-to-use-with-backbone) [have](https://github.com/visionmedia/express/blob/master/examples/content-negotiation/index.js) [written](http://kijanawoodard.com/asp-net-mvc-content-negotiation) about [content negotiation](http://en.wikipedia.org/wiki/Content_negotiation). It's use, implementation, purpose. I think they are all valid. But I feel like I'm alone when it comes to an idea that seems so simple and powerful to me. I'm quite surprised that others aren't in alignment with me on this, or if they are, I haven't connected with them. I feel like every web site should be built to negotiate content and respond with the requested representation for a resource. I picked those words carefully. So I'm going to write it again in a block quote.

> Every web site should respond with the requested representation for a resource. Let's cut through the chase. This is what I mean.

- index.xml (deleted old code)
- index.json (deleted old code)
- index.phtml (deleted old code)
- index.html (deleted old code)
- [www.reddit.com/controversial.xml](http://www.reddit.com/controversial.xml)

See what I did there? I requested a specific representation in every link. XML, JSON, pHTML (Partial HTML or HTML fragment). I said, "I want the index for blog.joeyguerra.com", but please...give it to me in...oh, HTML. Crap! I don't want the full document, how 'bout pHTML. Oh, wait, I need JSON because I want to show it on another page. Whew, thanks. Because I'm building out a web site and sometimes I just want the same resource but in a different representation. I might just want it in JSON so I can make an AJAX request and display a login form anytime you click on the login link ANYWHERE on my site. Especially after I've already built the site and this is an afterthought. Or some other product team just wants to show the product info in their app, but they just want the partial HTML just as it is in the full HTML document. What was that you said? You want to use your RSS reader to view my site? Ok, no worries, just go to index.rss (old code) and you'll get what you asked for.

It's so clear to me that this a great way to build a web site. I'm not saying it's the only way, but if you're going to build web sites, this is a great feature to include by default...as a first class citizen.

Ok, you're ready to do it. I've convinced you. You've come to the dark side. Yayayayayayayaya! Now what? Well, there's a few concepts that stand out when I built this functionality. I'll just list them.

- Content Negotiation
- Encapsulate what varies: Views change A LOT, so encapsulate the views from the routing logic

Ok, just 2. But they're key. First one is Content Negotiation. Your site should negotiate with the client what content to respond with. In my mind, this really means what representation to respond with. Content can really be anything from an image type like GIF or PNG, to HTML or JSON. But I'm not really talking about what image type the client can accept. While that might be cool to say oh, you want an image? What type can you accept? a GIF, ok here's the image as a GIF. Cuz that is cool. But I find that representations like HTML, JSON, XML, and pHTML are more useful to me as a web developer.

Second is the idea that views change A LOT. What I mean is that in a web sites life, the views are the things that change more often than the server side code and logic. There's a book called [Head First Design Patterns](http://www.headfirstlabs.com/books/hfdp/) where I first read the notion to "encapsulate what varies". Working at True (old dating web site) at the time, that really rang true to me because we changed the sign up pages and payment pages ALL THE FREAKIN' TIME! So much so that I came to believe that views are throw away and I ventured out to find a way to encapsulate the views from the rest of the code base because I knew we were going to build new ones every week and throw them away.

Ok, so I lured you here to find out how to do content negotiation in Node JS and I suggested that I augmented [Express JS](https://github.com/visionmedia/express/blob/master/examples/content-negotiation/index.js) while doing it. But Express JS already has the facility to do this, you say. And so it does. In your Express JS routing logic, you can write code like:

```javascript
app.get('/', function(req, res, next){
    res.format({
        html: function(){
            res.send("<ul>" + users.map(function(user){
                return "<li>" + user.name + "</li>";
            }).join('') + "</ul>");
        },
        text: function(){
            res.send(users.map(function(user){
                return ' - ' + user.name + '\\n';
            }).join(''));
        },
        json: function(){
            res.json(users);
        }
    })
});
```

And it works. It's deliberate. The intent is clear. My problem is that the content negotiation code happens in the routing logic. I don't want it there. It's not following the [Single Responsibility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle). The routing logic is supposed to get a list of users. Not get a list of users AND format it. So while I have the flexibility to change the resource for each representation, I have to modify routing code to do it. The view has not been encapsulated away as something that varies often. So my gut is telling me not to do this.

What I really want is the content negotiation to happen elsewhere. What I really want in my routing logic is to just respond with a list of users. And I want the code that determines the representation down stream of the request pipeline. How 'bout I have code like:

```javascript
app.get('/', function(req, res, next){
    res.send(users);
});
```

That would be awesome! But I haven't been able to get it to just that; I got close though.

```javascript
app.get('/', function(req, res, next){
    res.represent('user/index', users, self, next);
});
```

I added a method to Express JS's response object (app.response.represent) called represent which I then wrote code to negotiate content, pick the view with the negotiated content's file extension and render that. I'm still whittling away at it's organization, but it works!

The code base is made up of resources and views. There's a resources folder that gets loaded upon application boot which loads all the routing code. Each resource's routing code calls response.represent with a view folder and file (without the file extension), a resource model object, an object that represents the resource and the next callback. The views folder contains a layouts folder that contains the layout files for each representation (default.html, default.xml, etc.). The represent method determines what file extension to use when looking up a layout and view, via content negotiation, finds the layout and view and renders it, responding to the client with the output, in addition to setting the correct content type that it's responding with.

I hope this idea rings true to you. I'd love feedback, good and bad. I want to take this idea and make it better. So head on over to the repo, fork it, take a look, use it, yell at it. It's all good.

Thanks for reading.
