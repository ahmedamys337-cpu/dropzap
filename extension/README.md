# DropZap Browser Extension

A lightweight Chrome/Firefox extension that adds a **"Download with DropZap"** button to TikTok, Instagram, Facebook, X/Twitter, Reddit, Pinterest, and Threads pages.

## Features

- One-click download button injected directly on supported post pages
- Floating action button appears automatically on SPA navigation
- Popup confirms whether the current page is supported
- Opens DropZap pre-filled with the current URL
- No permissions beyond the active tab

## Build icons

```bash
npm run build:extension-icons
```

This resizes `public/icon-512.png` into the required 16, 32, 48, and 128px PNGs.

## Load in Chrome

1. Run `npm run build:extension-icons` in the project root.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `extension/` folder.

## Load in Firefox

1. Run `npm run build:extension-icons`.
2. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**.
3. Select `extension/manifest.json`.

## Publish

1. Zip the `extension/` folder (excluding `scripts/`).
2. Submit to:
   - Chrome Web Store
   - Firefox Add-ons (AMO)
3. Update the links in `src/app/extension/page.tsx` after approval.

## How the content script works

`content.js` detects the platform from the page URL and injects a floating DropZap button in the bottom-right corner. On single-page apps (TikTok, Instagram, X, Threads), a `MutationObserver` re-detects navigation and re-injects the button.
