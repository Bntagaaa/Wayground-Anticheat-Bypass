# Wayground Helper

A browser extension for Chrome/Chromium and Firefox. It changes page interaction behavior and has an optional site-scope control.

> [!WARNING]
> This extension interferes with website event listeners, can break pages, and is not affiliated with Wayground. It is not guaranteed to work. Use it only where permitted by the site's terms and your institution's policies. Do not rely on it to bypass assessments or proctoring requirements.

## Scope settings (new)

Click the **Wayground Helper** extension icon to open **Settings > Apply to**:

- **Wayground Only** (default): `wayground.com` and its subdomains.
- **All Websites**: HTTP and HTTPS websites. You will be asked to grant the browser's additional host-access permission before this can be enabled.

Your choice is saved in extension-local storage and persists after closing/restarting the browser. Changing scope updates a dynamically registered content script, so new page loads use the selected scope; **reload already-open tabs** to apply the new scope. Switching back to Wayground Only also revokes optional access to all websites.

Broad site access is optional and is not requested on installation. All Websites may unexpectedly affect unrelated pages. Browser-protected pages (`chrome://`, `about:`, extension stores, etc.) cannot be modified.

## Browser builds

| Browser | Directory | Version | Manifest |
| --- | --- | --- | --- |
| Chrome / Chromium | `Wayground-Helper-Chrome/` | `0.2.0` | V3 (service worker) |
| Firefox 128+ | `Wayground-Helper-Firefox/` | `0.3.0` | V3 (event-page background script) |

Both versions use the same popup UI and the same scope-registration logic. The existing `content.js` behavior remains unchanged.

## Installation (development)

### Chrome / Chromium

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose `Wayground-Helper-Chrome/`.
5. Pin the extension, then click its icon to choose the scope.

### Firefox

1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Select `Wayground-Helper-Firefox/manifest.json`.
5. Click the extension icon and choose the scope.

Firefox temporary add-ons are normally removed upon browser restart. For permanent installation on standard Firefox, a signed package is generally required.

## Project structure

```text
Wayground-Helper-Chrome/
  manifest.json
  content.js
  background.js
  popup.html
  popup.css
  popup.js
Wayground-Helper-Firefox/
  manifest.json
  content.js
  background.js
  popup.html
  popup.css
  popup.js
```

## Implementation notes

- The background script registers a content script through `scripting.registerContentScripts()`.
- It preserves `document_start`, all-frame injection, and the page's `MAIN` execution world.
- Registrations persist between browser sessions and are reconciled on installation, startup, permission changes, and setting changes.
- Only Wayground host access is requested by default; broader HTTP/HTTPS access is optional.
- Browser behavior and site detection may vary. On already-open tabs, a full reload is required for the new registration to take effect.

## Disclaimer

This independent experimental project is provided **as is**. Respect website terms, academic-integrity policies, and applicable rules.
