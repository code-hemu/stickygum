<p align="center">
  <a href="https://github.com/code-hemu/stickygum">
    <picture>
      <img src="https://raw.githubusercontent.com/code-hemu/stickygum/refs/heads/main/resources/logo.png" alt="stickygum logo" width="312px" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/stickygum"><img src="https://img.shields.io/npm/v/stickygum" alt="Version"></a>
  <a href="https://github.com/code-hemu/stickygum/issues"><img src="https://img.shields.io/github/issues/code-hemu/stickygum" alt="License"></a>
  <a href="https://www.jsdelivr.com/package/npm/stickygum"><img src="https://data.jsdelivr.com/v1/package/npm/stickygum/badge?style=rounded" alt="jsDelivr"></a>
  <a href="https://github.com/code-hemu/stickygum/graphs/contributors"><img src="https://img.shields.io/github/contributors/code-hemu/stickygum" alt="jsDelivr"></a>
</p>

StickyGum is a JavaScript library for creating sticky sidebars. It keeps sidebars visible while scrolling, ensures they stay within their parent container, and automatically adapts to responsive layouts. Support for multiple sticky modes and smooth positioning, StickyGum works out of the box in modern browsers.


# Installation

Install StickyGum from npm:

```bash
npm install stickygum
```

# Getting Started

StickyGum supports Browser, ES Modules, and CommonJS.

## Browser (CDN)

```html
<script src="stickygum.min.js"></script>

<script>
new StickyGum({
  container: "#main-wrapper",
  sidebar: "#sidebar-wrapper",
  offsetTop: 30,
  offsetBottom: 30
});
</script>
```

## ES Modules

```javascript
import StickyGum from "stickygum";

new StickyGum({
  container: "#main-wrapper",
  sidebar: "#sidebar-wrapper"
});
```

## CommonJS

```javascript
const StickyGum = require("stickygum");

new StickyGum({
  container: "#main-wrapper",
  sidebar: "#sidebar-wrapper"
});
```

# HTML Structure

Your sidebar should be placed inside the container that defines its scrolling boundary.

```html
<main id="main-wrapper">
  <article>
    Main content
  </article>

  <aside id="sidebar-wrapper">
    Sidebar content
  </aside>
</main>
```

Once the container reaches its bottom edge, StickyGum stops the sidebar there instead of allowing it to scroll beyond the container.


# Options

All configuration is passed through the constructor.

| Option                       | Type                                              | Default        | Description                                                             |
| ---------------------------- | ------------------------------------------------- | -------------- | ----------------------------------------------------------------------- |
| `container`                  | `string \| HTMLElement`                           | Sidebar parent | Container that limits the sticky area.                                  |
| `sidebar`                    | `string \| HTMLElement \| HTMLElement[]`          | -              | Sidebar element(s) to make sticky.                                      |
| `offsetTop`                  | `number`                                          | `0`            | Space between the top of the viewport and the sidebar.                  |
| `offsetBottom`               | `number`                                          | `0`            | Space between the bottom of the viewport and the sidebar.               |
| `updateSidebarHeight`        | `boolean`                                         | `true`         | Updates sidebar height dynamically while scrolling.                     |
| `minWidth`                   | `number`                                          | `0`            | Disables StickyGum below this viewport width.                           |
| `disableOnResponsiveLayouts` | `boolean`                                         | `true`         | Automatically disables sticky behavior when the layout becomes stacked. |
| `sidebarBehavior`            | `"modern" \| "stick-to-top" \| "stick-to-bottom"` | `"modern"`     | Controls how the sidebar behaves while scrolling.                       |
| `defaultPosition`            | `string`                                          | `"relative"`   | Initial CSS position before StickyGum starts.                           |
| `verbose`                    | `boolean`                                         | `false`        | Logs helpful warnings during initialization.                            |


# Destroying an Instance

Call `unbind()` to remove all event listeners and restore the sidebar to its original state.

```javascript
const sticky = new StickyGum({
  container: "#main-wrapper",
  sidebar: "#sidebar-wrapper"
});

sticky.unbind();
```

This is especially useful when unmounting components in single-page applications.


# Package Entry Points

StickyGum provides separate builds for different environments.

```json
{
  "main": "dist/stickygum.cjs",
  "module": "dist/stickygum.esm.js",
  "browser": "dist/stickygum.min.js",
  "exports": {
    ".": {
      "import": "./dist/stickygum.esm.js",
      "require": "./dist/stickygum.cjs"
    }
  }
}
```

* **CommonJS** - `dist/stickygum.cjs`
* **ES Modules** - `dist/stickygum.esm.js`
* **Browser (IIFE)** - `dist/stickygum.min.js`

The browser build exposes a global `StickyGum` object, while bundlers automatically resolve the appropriate module through the `exports` field.


## License

StickyGum is licensed under **GPL-3.0**. Copyright © [Hemanta Gayen](https://github.com/hemanta-gayen).
