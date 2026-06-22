# Changelog

## 2.0

- Renamed from **HTML.js DOM** to **DOM Factories** (`@ts-series/dom-factories` on npm)
- Codebase henceforth in TypeScript; a pure JS build is automatically generated
- Added SVG factories under `svg` namespace (`svg.circle`, `svg.rect` etc.)
- Added MathML factories under `math` namespace (`math.mfrac`, `math.msqrt` etc.)
- Extended `.set` proxy from `HTMLElement` to `Element`, covering SVG and MathML elements
- The first argument can now optionally be a plain object interpreted as attributes
- `style` attribute accepts a plain object with camelCase properties in addition to a CSS string
- Added `.on`/`.off` methods on every element for binding and removing event listeners, mirroring `.set` in structure, supporting single listeners or arrays of listeners, and an optional `addEventListener`/`removeEventListener` options argument
- Added `.appendTo` for inlining the insertion of a freshly created element into a parent
- Added `.renewContent` for replacing all current children of an element in one call, following the same variadic content rules as the factory functions
- Added a typed `byId<T>()` helper as a convenient, properly typed alternative to `document.getElementById`

## 1.0

Initial release as **HTML.js DOM**: plain JavaScript, HTML-only factory functions, and a basic `.set` method on `HTMLElement` for chainable attribute assignment. No SVG/MathML support, no TypeScript codebase, no event-handling or content-replacement methods.