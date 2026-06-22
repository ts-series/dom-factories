# DOM Factories — Reference

Complete API reference for DOM Factories: installation, attribute handling, element methods, and the full list of available factory functions.

## Table of Contents

1. [Installation](#1-installation)
   1. [Installing with npm](#11-installing-with-npm)
   2. [The Dirty Method](#12-the-dirty-method)
   3. [Use of a Public Content Delivery Network (CDN)](#13-use-of-a-public-content-delivery-network-cdn)
   4. [Obtaining a CDN Version Locally](#14-obtaining-a-cdn-version-locally)
2. [Side-effect Import](#2-side-effect-import)
3. [Creating Elements](#3-creating-elements)
   1. [The `a` Convenience](#31-the-a-convenience)
   2. [`button`, `button.submit`, `button.reset`](#32-button-buttonsubmit-buttonreset)
   3. [SVG and MathML](#33-svg-and-mathml)
4. [Attribute Handling](#4-attribute-handling)
   1. [Boolean Attributes](#41-boolean-attributes)
   2. [`class`](#42-class)
   3. [`style`](#43-style)
5. [Additional Element Methods](#5-additional-element-methods)
   1. [`set`](#51-set)
   2. [`on` / `off`](#52-on--off)
   3. [`appendTo`](#53-appendto)
   4. [`renewContent`](#54-renewcontent)
6. [`byId`](#6-byid)
7. [All Factory Functions](#7-all-factory-functions)
   1. [HTML Element Factories](#71-html-element-factories)
   2. [Void HTML Element Factories](#72-void-html-element-factories)
   3. [SVG Element Factories](#73-svg-element-factories)
   4. [MathML Element Factories](#74-mathml-element-factories)


## 1 Installation

### 1.1 Installing with npm

There is an official npm package:

```bash
npm install @ts-series/dom-factories
```

It is also possible to get the library directly from GitHub:

```bash
npm install git+https://github.com/ts-series/dom-factories.git
```

After installation, the library resides in the `node_modules` directory and is structured for Node.js environments. To use it in the browser, you'll need to bundle the code with a tool like Webpack or Browserify.

### 1.2 The Dirty Method

Since **DOM Factories** is just one module file, whose interface is so extremely simple and obvious that there is no need to fear any API breaks in the future which would require strict versioning, it is perfectly legitimate to download and put it in the local project directory for the sake of simplicity, instead of messing around with bundlers and the like.

### 1.3 Use of a Public Content Delivery Network (CDN)

A much cleaner and even simpler approach is to use a CDN:

| CDN | URL |
| --- | --- |
| esm.sh | `https://esm.sh/@ts-series/dom-factories` |
| jsDelivr | `https://cdn.jsdelivr.net/npm/@ts-series/dom-factories/+esm` |
| unpkg | `https://unpkg.com/@ts-series/dom-factories?module` |

Since the package ships as an ES module, any of these URLs must be loaded with `type="module"`, not as a classic script:

```html
<script type="module">
  import { a, button, p } from 'https://cdn.jsdelivr.net/npm/@ts-series/dom-factories/+esm';
</script>
```

A specific version can be pinned by appending it after the package name:

```html
<script type="module">
  import { a, button, p } from 'https://cdn.jsdelivr.net/npm/@ts-series/dom-factories@2.0.0/+esm';
</script>
```

If the latest minor version is to be used at all times, the patch number can simply be omitted:

```html
<script type="module">
  import { a, button, p } from 'https://cdn.jsdelivr.net/npm/@ts-series/dom-factories@2.0/+esm';
</script>
```

### 1.4 Obtaining a CDN Version Locally

As incredibly simple as content delivery networks are, they have two major drawbacks: plain VS Code IntelliSense (via `tsserver`) doesn't work for modules imported from a CDN at all, and even Deno's language server, which does resolve HTTPS imports, only gets full type information when the actual TypeScript source is loaded, not a bundled or minified build. Furthermore, the CDN servers can be down, although this is very rare. Other concerns may exist as well. In any case, this shouldn't be a reason not to benefit from jsDelivr:

```bash
mkdir -p ./client/external
curl -L https://cdn.jsdelivr.net/npm/@ts-series/dom-factories@2.0 -o ./client/external/dom-factories.js
```

This command creates a local directory for external modules and downloads a minified version of **DOM Factories**. If necessary, manually adjust the folder path to your project structure. It is important to exclude this folder using `.gitignore`. It is also recommended to save such installation routines in a project-internal shell script for future reproducibility.


## 2 Side-effect Import

The module has no exports beyond the factory functions and `byId`; the additional element methods described below (`set`, `on`, `off`, `appendTo`, `renewContent`) are installed as a side effect of merely loading the module. A plain side-effect import is therefore enough to make them available:

```javascript
import "./external/dom-factories.js";
```


## 3 Creating Elements

Every HTML, SVG, and MathML element has a matching factory function. Arguments are read left to right:

- If the first argument is a plain object literal, it is treated as an attributes object (see below) and consumed.
- Every remaining argument is appended as content: an `HTMLElement` is appended as is, an array is flattened recursively and each item appended individually, `null`/`undefined` is skipped, and anything else is converted with `String()` and appended as a text node.

```javascript
div({ class: "card" },
    h2("Title"),
    p("Text"),
    [span("a"), span("b")]   // arrays are flattened
);
```

Void elements (`img`, `input`, `br`, ...) only accept the optional attributes object, since they cannot have children.

The sole naming exception is `var`, exported as `variable`, since `var` is a reserved word in JavaScript.

### 3.1 The `a` Convenience

If exactly the first two arguments are strings, the first is used as the `href` attribute instead of being appended as content:

```javascript
a("#about", "About")
// equivalent to:
a({ href: "#about" }, "About")
```

### 3.2 `button`, `button.submit`, `button.reset`

`button` creates a `<button type="button">`. `button.submit` and `button.reset` are identical factories with `type="submit"` and `type="reset"` fixed:

```javascript
button.submit({ class: "primary" }, "Save")
```

### 3.3 SVG and MathML

SVG and MathML elements are not exported individually, but grouped under the `svg` and `math` namespace objects, following the same argument rules as the HTML factories:

```javascript
svg({ viewBox: "0 0 100 100" },
    svg.circle({ cx: 50, cy: 50, r: 40 })
);

math(
    math.mfrac(math.mn(1), math.mn(2))
);
```


## 4 Attribute Handling

Keys in the attributes object are converted from camelCase (or `snake_case`) to kebab-case before being applied, e.g. `tabIndex` becomes `tabindex`.

If the resulting attribute name is not a known, standard HTML attribute, it is automatically prefixed with `data-`. This keeps custom attributes valid without any extra notation:

```javascript
div({ userId: 42 })
// renders: <div data-user-id="42">
```

Attribute keys are no longer treated specially for events; `onClick` and similar keys are not recognized and would simply be turned into a `data-on-click` attribute. Event binding is handled exclusively through `on`/`off`, described below.

### 4.1 Boolean Attributes

For known boolean attributes (`disabled`, `checked`, `hidden`, ...):

- `true` or `null` sets the attribute with an empty value (present).
- `false` omits the attribute entirely (absent).

### 4.2 `class`

Any attribute value, including `class`, may be given as an array; the array is joined with a single space:

```javascript
div({ class: ["card", "highlighted"] })
// renders: <div class="card highlighted">
```

### 4.3 `style`

`style` accepts either a CSS string or a plain object with camelCase CSS properties, applied directly to `element.style`:

```javascript
div({ style: "width: 400px; margin: 0 auto;" })
div({ style: { width: "400px", margin: "0 auto" } })
```


## 5 Additional Element Methods

These methods are added to `Element.prototype` as a side effect of importing the module; they are available on every element, not only ones created by a factory function.

### 5.1 `set`

Sets one or more attributes and returns the element itself, so it can be chained or returned immediately. Two equivalent forms are available:

```javascript
el.set({ id: "panel", class: "active" });
el.set.id("panel").set.class("active");
```

### 5.2 `on` / `off`

Binds or removes event listeners, mirroring `set` in structure. The value may be a single function or an array of functions, bound or removed together. An optional second argument is passed through to `addEventListener`/`removeEventListener` as the options/capture argument:

```javascript
el.on({ change: handleChange, click: [logClick, trackClick] });
el.on.change(handleChange);
el.on.click(handleOnce, { once: true });

el.off.change(handleChange);
el.off({ click: [logClick, trackClick] });
```

As with native `removeEventListener`, `off` only removes a listener if the exact same function reference (and matching capture flag, if used) was previously passed to `on`. Anonymous inline functions can therefore not be removed; use a named, referenced function if you intend to unbind it later.

### 5.3 `appendTo`

Appends the element to a given parent and returns the element itself, useful for inlining the insertion right where the element is built:

```javascript
const toast = div({ class: "toast" }, "Saved.").appendTo(document.body);
```

### 5.4 `renewContent`

Replaces all current children of an element with new content in one call, following the exact same variadic content rules as the factory functions (`HTMLElement`, arrays, `null`/`undefined`, stringifiable values). Returns the element itself:

```javascript
panel.renewContent(h2("Updated"), p("New content."));
```

This is the standard way to re-render a container, for example after a partial page update, without manually clearing it first.


## 6 `byId`

A typed convenience function for `document.getElementById`, sparing the otherwise necessary manual cast:

```typescript
const select = byId<HTMLSelectElement>("lang-select");
// select: HTMLSelectElement | null
```


## 7 All Factory Functions

HTML elements are exported individually, each under the same name as their tag. SVG and MathML elements, however, are grouped under the `svg` and `math` namespace objects instead, since several of their tag names would otherwise collide with existing HTML exports (`a`, `script`, `style`, `title`).

### 7.1 HTML Element Factories

All standard non-void HTML elements are available as functions with the same name as their tag, with the exception of `var`, exported as `variable`:

`abbr`, `address`, `article`, `aside`, `audio`, `b`, `bdi`, `bdo`, `blockquote`, `body`, `canvas`, `caption`, `cite`, `code`, `colgroup`, `data`, `datalist`, `dd`, `del`, `details`, `dfn`, `dialog`, `div`, `dl`, `dt`, `em`, `fieldset`, `figcaption`, `figure`, `footer`, `form`, `h1`–`h6`, `head`, `header`, `hgroup`, `html`, `i`, `iframe`, `ins`, `kbd`, `label`, `legend`, `li`, `main`, `map`, `mark`, `menu`, `menuitem`, `meter`, `nav`, `noscript`, `object`, `ol`, `optgroup`, `option`, `output`, `p`, `picture`, `pre`, `progress`, `q`, `rp`, `rt`, `ruby`, `s`, `samp`, `script`, `search`, `section`, `select`, `slot`, `small`, `span`, `strong`, `style`, `sub`, `summary`, `sup`, `table`, `tbody`, `td`, `template`, `textarea`, `tfoot`, `th`, `thead`, `time`, `title`, `tr`, `u`, `ul`, `variable`, `video`, plus `a` and `button` (with `button.submit`/`button.reset`) as described above.

### 7.2 Void HTML Element Factories

`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`

### 7.3 SVG Element Factories

Available under the `svg` namespace (e.g. `svg.circle`, `svg.path`):

`circle`, `rect`, `line`, `ellipse`, `polyline`, `polygon`, `path`, `text`, `tspan`, `textPath`, `g`, `defs`, `symbol`, `use`, `marker`, `image`, `linearGradient`, `radialGradient`, `pattern`, `stop`, `clipPath`, `mask`, `filter`, `feBlend`, `feColorMatrix`, `feComponentTransfer`, `feComposite`, `feConvolveMatrix`, `feDiffuseLighting`, `feDisplacementMap`, `feDropShadow`, `feFlood`, `feGaussianBlur`, `feImage`, `feMerge`, `feMergeNode`, `feMorphology`, `feOffset`, `feSpecularLighting`, `feTile`, `feTurbulence`, `animate`, `animateTransform`, `animateMotion`, `set`, `desc`, `metadata`, `foreignObject`, `switch`, `view`, `a`, `script`, `style`, `title`

### 7.4 MathML Element Factories

Available under the `math` namespace (e.g. `math.mfrac`, `math.msqrt`):

`mrow`, `mfrac`, `msqrt`, `mroot`, `mstyle`, `merror`, `mpadded`, `mphantom`, `mfenced`, `menclose`, `msub`, `msup`, `msubsup`, `munder`, `mover`, `munderover`, `mmultiscripts`, `mtable`, `mtr`, `mtd`, `mlabeledtr`, `mi`, `mn`, `mo`, `mtext`, `mspace`, `ms`, `maction`, `annotation`, `semantics`
