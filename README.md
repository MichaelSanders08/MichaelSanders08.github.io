# Michael’s Utility Desk

A personally hosted collection of useful tools and reference material, built for repeat visits rather than portfolio browsing.

**[Open the desk](https://michaelsanders08.github.io/)**

## Tools

| Tool | Useful for |
| --- | --- |
| Text bench | Count words/Unicode characters, estimate reading/speaking time, clean spacing, change case, make slugs, remove duplicate lines, undo, export |
| Media math | Estimate storage from bitrate and duration, account for backup copies, resize while preserving aspect ratio |
| Color & contrast | Preview color pairs, calculate WCAG 2.2 contrast, check AA/AAA thresholds, copy CSS |
| Decision matrix | Weight criteria, score alternatives, inspect transparent rankings, export the matrix |
| Focus session | Set an intention and a persistent countdown that catches up after backgrounding/reload |
| JSON workbench | Validate, pretty-print, minify, sort keys, copy and export without uploading |
| Link cleaner | Remove familiar tracking parameters while preserving other query values, encoding, and fragments |
| Reference shelf | Search a small starter library and add, export, or import personal references |

Pin frequently used tools. Press `/` to search, Enter to open the first match, Escape to clear. Tools have shareable hash URLs (for example `/#color`).

## Run and verify

The app is static HTML, CSS, and browser ES modules. No install or build is needed to use it.

```sh
python3 -m http.server 4174 --bind 127.0.0.1
# Open http://localhost:4174
```

Node 20+ is needed only for the core tests:

```sh
npm test
```

The tests cover Unicode text, media unit conversions, aspect ratios, WCAG contrast extrema and thresholds, JSON handling, URL schemes/encoding, weighted decisions, timer catch-up, and reference import validation. CI runs those checks and validates browser-script syntax.

## Privacy and persistence

All tool computation happens in the browser. The desk loads no third-party scripts, fonts, analytics, or APIs. External references are visited only when selected.

- Text, JSON, media, colors, and link drafts stay in memory for the current page session.
- Pins, the decision matrix, added references, and the focus timer use local storage under `ms-utility-desk:`.
- Storage is specific to this browser and origin. It is not encrypted or synchronized.
- Export important work. **About the desk → Clear saved desk data** removes only this app’s stored keys.
- Browser restrictions are handled with a visible storage/clipboard message.

Timer completion appears while the page is open; this is not a background notification service and cannot wake a sleeping device. Color checks cover solid sRGB colors and contrast alone. Media sizes assume constant bitrate. JSON uses JavaScript numeric precision, so large identifiers should be strings. The decision matrix is an explicit weighted average, not a recommendation engine.

## Structure and hosting

- `index.html` — utility desk shell.
- `utility/core.js` — pure, tested calculations and validation.
- `utility/desk.js` — tool interfaces, interaction and local persistence.
- `utility/desk.css` — responsive visual system.
- `tests/utility.test.js` — dependency-free Node tests.

GitHub Pages serves `main` at the repository root. The previous homepage is preserved at [`archive.html`](archive.html); the original course essays, project pages, assets, CSS, and scripts remain at their existing paths. The separate `personal-website` project is unchanged.

Contrast definitions follow [W3C’s WCAG 2.2 guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The starter reference shelf links to the primary documentation or authored sources themselves.
