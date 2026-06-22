# DOM Factories

DOM Factories is a minimal JavaScript/TypeScript library that provides functions to significantly reduce boilerplate code for dynamically creating and manipulating HTML, SVG, and MathML on the client side.

Unlike React, **DOM Factories** does not require complex installation and is significantly more efficient, as it adds nothing on top of the DOM API but nestable factory functions that wrap the repetitive parts for creating elements:

```javascript
const card = div(
    h2("Hallo Welt!"),
    p("Das ist ein Absatz.")
);
```

There is also an additional method `set` on every element that sets attributes and returns the element itself, so it can be passed on immediately. A second method, `on`, binds event listeners the same way while remaining chainable:

```javascript
const notification = div(
    span("Your changes have been saved.")
).set({ id: "notification", class: "notification", role: "status" });

notification.on.click(() => notification.remove());

document.body.appendChild(notification);
```

That's all, and actually sufficient to make working with the DOM API much more convenient without resorting to fat, slow, and unnecessarily complicated frameworks.

For all HTML elements, predefined functions are already provided, which have exactly the same name as the HTML elements they create (with the sole exception of `var`, which is called `variable` instead).

Attribute and event-handling details, as well as the complete function list are documented in [REFERENCE.md](https://github.com/ts-series/dom-factories/blob/main/REFERENCE.md). 

## Quod Erat Demonstrandum

To demonstrate the simplicity of this library, the following example is given:

```javascript
// Create the header with a title
const headerElement = header(
    h1('My Simple Website')
);

// Create a navigation bar
const navElement = nav(
    ul(
        li(a("#", "Home")),
        li(a("#about", "About")),
        li(a("#contact", "Contact"))
    )
);

// Create main content
const mainContent = main(
    section(
        h2('Welcome to My Website'),
        p('This is a simple single-page website created using JavaScript and the custom DSL.')
    ),
    section(
        h2('About'),
        p('This section provides information about the website and its purpose.')
    ).set({ id: "about" }),
    section(
        h2('Contact'),
        p('This section will contain contact information.')
    ).set({ id: "contact" })
);

// Create footer
const footerElement = footer(
    p('© 2025 My Simple Website')
);

// Assemble the whole page
document.body.appendChild(headerElement);
document.body.appendChild(navElement);
document.body.appendChild(mainContent);
document.body.appendChild(footerElement);
```

Or if the HTML is no longer needed after appending:

```javascript
header(
    h1('My Simple Website')
).appendTo(document.body);
```

### Behind the Scenes

Basically, the functions provided do nothing other than create the HTML element they are named after and, if not empty, accept any number of other elements to append as children, or objects in general, which get automatically converted to text using `toString()`. This gives the impression of writing HTML directly in JavaScript. That's the whole magic behind it.

To see how much **DOM Factories** can reduce the amount of boilerplate code as an alternative to using React, here is the raw version of the initial example:

```javascript
// Create the header with a title
const headerElement = document.createElement("header");
const headerTitle = document.createElement("h1");
headerTitle.textContent = "My Simple Website";
headerElement.appendChild(headerTitle);

// Create a navigation bar
const navElement = document.createElement("nav");
const navList = document.createElement("ul");

const homeLink = document.createElement("li");
const homeAnchor = document.createElement("a");
homeAnchor.href = "#";
homeAnchor.textContent = "Home";
homeLink.appendChild(homeAnchor);

const aboutLink = document.createElement("li");
const aboutAnchor = document.createElement("a");
aboutAnchor.href = "#about";
aboutAnchor.textContent = "About";
aboutLink.appendChild(aboutAnchor);

const contactLink = document.createElement("li");
const contactAnchor = document.createElement("a");
contactAnchor.href = "#contact";
contactAnchor.textContent = "Contact";
contactLink.appendChild(contactAnchor);

navList.appendChild(homeLink);
navList.appendChild(aboutLink);
navList.appendChild(contactLink);

navElement.appendChild(navList);

// Create main content
const mainContent = document.createElement("main");

const welcomeSection = document.createElement("section");
const welcomeHeading = document.createElement("h2");
welcomeHeading.textContent = "Welcome to My Website";
const welcomeParagraph = document.createElement("p");
welcomeParagraph.textContent = "This is a simple single-page website created using JavaScript and the DOM API.";
welcomeSection.appendChild(welcomeHeading);
welcomeSection.appendChild(welcomeParagraph);

const aboutSection = document.createElement("section");
aboutSection.id = "about";
const aboutHeading = document.createElement("h2");
aboutHeading.textContent = "About";
const aboutParagraph = document.createElement("p");
aboutParagraph.textContent = "This section provides information about the website and its purpose.";
aboutSection.appendChild(aboutHeading);
aboutSection.appendChild(aboutParagraph);

const contactSection = document.createElement("section");
contactSection.id = "contact";
const contactHeading = document.createElement("h2");
contactHeading.textContent = "Contact";
const contactParagraph = document.createElement("p");
contactParagraph.textContent = "This section will contain contact information.";
contactSection.appendChild(contactHeading);
contactSection.appendChild(contactParagraph);

mainContent.appendChild(welcomeSection);
mainContent.appendChild(aboutSection);
mainContent.appendChild(contactSection);

// Create footer
const footerElement = document.createElement("footer");
const footerParagraph = document.createElement("p");
footerParagraph.textContent = "© 2025 My Simple Website";
footerElement.appendChild(footerParagraph);

// Assemble the whole page
document.body.appendChild(headerElement);
document.body.appendChild(navElement);
document.body.appendChild(mainContent);
document.body.appendChild(footerElement);
```

Impressive, isn't it? And all this with just 500 lines of boring library code and without any syntax extensions like JSX, which would require a separate build step! This is possible because **DOM Factories** does not try to abstract away the DOM API, but just adds a few convenience functions that simply summarize the recurring, same steps. Yes, it can be that simple!

React nonetheless offers more functionality. However, **DOM Factories** clearly shows that React is absolutely over-engineered, slow dope from Facebook/Meta, which requires a lot of learning time with new models like components to grasp, instead of simply writing vanilla JavaScript as if it were HTML.

### Why Extend Element Directly?

Adding methods like `set` and `on` directly to the prototype is simply the most efficient and simplest solution, fitting JavaScript's dynamic nature. Furthermore, the DOM API has remained remarkably stable over the years, and the names chosen for the added methods were kept deliberately short, which makes collisions with future DOM API extensions extremely unlikely.

The intention behind this small supplementary library is not to hide the powerful DOM API, but rather to extend it cleverly, without unnecessary layers, so that web applications stay maximally efficient. DOM Factories holds the view that modern JavaScript already offers everything needed to build lean, contemporary web applications.

## Installation and Full API

See [REFERENCE.md](https://github.com/ts-series/dom-factories/blob/main/REFERENCE.md) for installation options (npm, CDN, or just dropping the single file into the project).

## Server-side HTML Generation

The server-side counterpart for Node.js and Deno is [Factories.ts](https://github.com/ts-series/factories): a lightweight library that follows the exact same factory-based approach.

## Changelog

As of version 2, the library is also available in TypeScript and has been substantially extended, offering even more convenience on the one hand and supporting all remaining markup languages of the browser on the other. A list of all the new features can be found [here](https://github.com/ts-series/dom-factories/blob/main/CHANGELOG.md).

## License

This software is published under the Unlicense.
