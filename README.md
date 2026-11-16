# Wayground Helper

**An browser extention that Bypass Wayground Anticheat restriction. Switch tab, resize windows freely without anticheat trigger on your teacher screen**


> [!WARNING]
> This extension modifies page behavior and interferes with site activity listeners. It is **not affiliated with Wayground**, is **not guaranteed to work**, and should only be used where permitted by the site's rules and your institution's policies. In particular, it must not be relied on to bypass assessment or proctoring requirements.

## What it does

The current source attempts to:

- Override the reported **page visibility** and **focus** values.
- Override some **Fullscreen API** properties and reported outer window dimensions.
- Intercept page events involving visibility, blur, page exit, fullscreen changes, and window resizing.
- Enable text selection with injected CSS.
- Intercept clipboard, context-menu, and text-selection related events.

These are JavaScript-level changes, **not** changes to actual browser fullscreen state or operating-system focus. Depending on browser restrictions, site implementation, or extension injection timing, some changes may have no effect.

## Browser versions

| Browser | Directory | Extension version | Manifest |
| --- | --- | --- | --- |
| Chrome / Chromium-based browsers | `Wayground-Helper-Chrome/` | `0.1.0` | Manifest V3 |
| Firefox | `Wayground-Helper-Firefox/` | `0.2.0` | Manifest V3 |

Both builds contain a `manifest.json` and `content.js`. The manifests limit matching URLs to `wayground.com` and its subdomains and request early, main-world content-script injection.

## Installation (local development)

### Chrome / Chromium

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the **`Wayground-Helper-Chrome`** directory (the folder containing `manifest.json`).

You can remove or disable the extension from the same page.

### Firefox (temporary development installation)

1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Select `Wayground-Helper-Firefox/manifest.json`.

Temporary add-ons are normally removed when Firefox restarts. Permanent installation on regular Firefox builds generally requires a signed add-on package. The Firefox manifest specifies **Firefox 128+**, but that is a declared minimum, not a guarantee that every API works as intended.

## Project structure

```text
Wayground-Helper/
├── Wayground-Helper-Chrome/
│   ├── manifest.json
│   └── content.js
└── Wayground-Helper-Firefox/
    ├── manifest.json
    └── content.js
```

## How it works

The extension uses a content script configured to run at `document_start` in the page's main JavaScript world. It inserts a CSS rule to make text selectable, overrides certain browser-exposed document properties, and registers capturing event listeners.

**Known limitations:**

- May not work in quiz that have power up enable
- Mastery Peak mode isnt tested

## Disclaimer

This is an independent experimental project provided **as is**. Respect website terms of service, academic-integrity requirements, and applicable rules when using or modifying it. No connection to or endorsement from Wayground is claimed.
