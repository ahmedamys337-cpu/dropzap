# Product Hunt launch assets

Marketing assets for the DropZap Product Hunt launch. Designed once,
reusable across **every other directory submission** (AlternativeTo,
SaaSHub, Crunchbase, Toolify, StackShare, F6S, etc.).

## What's in this folder

| File | Purpose | Output size | Where to upload |
|---|---|---|---|
| `01-thumbnail.svg` | The PH leaderboard tile | 480×480 PNG | PH **Thumbnail** field |
| `02-hero.svg` | Headline slide (social preview) | 1270×760 PNG | PH Gallery — first image |
| `03-platforms.svg` | 8 supported platforms grid | 1270×760 PNG | PH Gallery — second image |
| `04-mobile.svg` | iPhone mockup + mobile claims | 1270×760 PNG | PH Gallery — third image |
| `05-features.svg` | 6 unique features grid | 1270×760 PNG | PH Gallery — fourth image |
| `06-cta.svg` | Brand lockup + URL closer | 1270×760 PNG | PH Gallery — fifth image |

## How to generate the PNGs

```powershell
node product-hunt-assets/generate.mjs
```

That's it. The script reads every `.svg` in this folder and writes a
matching `.png` next to it at the correct dimensions. Uses the project's
existing `sharp` dependency — no extra `npm install`.

Run again any time you tweak an SVG.

## Upload checklist (Product Hunt)

1. **Thumbnail field** → upload `01-thumbnail.png`
2. **Gallery** → upload in this exact order (PH uses image #1 as the
   social preview when someone shares the launch link):
   - `02-hero.png`
   - `03-platforms.png`
   - `04-mobile.png`
   - `05-features.png`
   - `06-cta.png`
3. Save the draft. **Do not click "Submit launch" until Tuesday May 19
   at 12:01 PM Pakistan time** (= 12:01 AM Pacific Time, when the PH
   leaderboard rolls over).

## Reuse for other directories

These same files work for:

- **AlternativeTo** — upload `01-thumbnail.png` as logo, `02-hero.png`
  as screenshot
- **SaaSHub / Crunchbase / F6S** — `01-thumbnail.png` as company logo,
  the gallery images as product screenshots
- **Toolify / StackShare / SlashDot** — `01-thumbnail.png` as icon,
  `02-hero.png` as preview
- **Twitter / LinkedIn launch tweets** — `02-hero.png` is sized as
  the perfect social-preview card (1270×760 is the OG image standard)

## Editing

The designs are pure SVG. Open any `.svg` in VS Code and edit the text
directly — colors, typography, copy. Re-run `generate.mjs` to refresh
the PNGs. No Photoshop / Figma required.

Brand colors (used throughout):

| Color | Hex | Where |
|---|---|---|
| Blue | `#3b82f6` | Gradient start |
| Purple | `#9333ea` | Gradient mid |
| Pink | `#ec4899` | Gradient end / accent |
| Orange | `#f97316` | Tertiary accent (TikTok, etc.) |
| Background | `#0f0f1e` → `#1a0d2e` | Dark gradient |
| Body text | `#a0a0c0` | Muted foreground |
| Headlines | `#ffffff` | Pure white |
