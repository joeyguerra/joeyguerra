---
layout: './pages/layouts/post.html'
title: "Coding and Code Review Guidelines"
excerpt: "In order to reuse code, it must pass the teams measurement of readability and discoverability."
published: 2014-08-01
uri: '/blog/2014/code-review-guidelines.html'
tags: ['review', 'code']
---

# Coding and Code Review Guidelines

In order to reuse code, it must pass the teams measurement of readability and discoverability.

If it is determined that a particular module or code is not reusable, it must be refactored into a “legacy code” area in preparation for deprecation so that it is decoupled from the rest of the codebase.

If you're making changes to an existing function, you must make a concerted effort to make it testable with a unit test case.

All code changes must be reviewed and approved for transitioning to the next environment by at least 1 other team member, preferably located in a different office in a different city to encourage collaboration.

Code reviewers must discuss and determine if it follows the SOLID principles and if not, the 2 reviewers must agree whether or not that's acceptable and appropriate at that time before it can go to the next environment.

If code is not formatted and adequately indented such that it's difficult to read, it MUST be appropriately formatted before continuing.

Consider creating a module when adding new functionality with the intent of unit testing it, making it testable with the least amount of dependencies.

Upon having to modify existing functionality where the code is not in it's own module, consider creating a new module and moving that code into it.

Variable, module, and function naming is one of the main characteristics that will make code either readable or not. It's a powerful tool to communicate and document. Consider your names carefully. Follow these guidelines when naming something:

- Reveal and communicate your intent. If you're compelled to write a comment, you haven't sufficiently revealed it's intent.
- Functions and methods should be verbs or verb phrases, unless it returns a boolean, in which case it should read like a predicate (e.g. shouldShow(), isActive());
- Variables should be nouns, unless they're booleans which should be predicates.
- Enums should be adjectives.
- Variables: the longer the scope, the longer the name of the variable.
- Variables: the shorter the scope, the shorter the variable name.
- Functions and Classes: the longer the scope, the shorter the name. The shorter the scope, the longer it should be.
  - Use short names for public APIs so they are convenient to use.
  - Long names for functions/methods that are private.
  - Avoid disinformation - saying something other than you mean. Correct it if you recognize it.
- If the meaning of a function, variable or class have changed, changed the name to reveal it's intent.
- Use pronounceable names. Read the code out load as a test. Does it sound right?
- Avoid encodings like hungarian notation in the names. E.g. Account is better than IAccount.
- Write code that a human can understand.

## Functions do 1 thing, extract till you drop

- Functions should be small, ~ 4 lines of code. Making functions small will help everyone.
- Well named functions help the developer navigate the code base.
- If a function is long, consider creating a class to put those functions. Classes hide in long functions.
- Function signatures should be small, 3 or fewer parameters.
- Do not pass booleans into functions. They're presence indicate that the function does more than 1 thing.
- No output arguments in function signatures.
- Organize methods according to step down principle (public methods at top).
- Consider replacing switch statements with polymorphism.
