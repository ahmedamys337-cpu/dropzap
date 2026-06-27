---
platforms: ["devto", "hackmd", "medium"]
title: "Instagram Carousel Downloader: Save All Slides as a ZIP in One Click"
tags: ["instagram", "tools", "tutorial", "socialmedia", "webdev"]
canonical_url: "https://www.dropzap.digital/instagram-downloader"
status: draft
---

# Instagram Carousel Downloader: Save All Slides as a ZIP in One Click

Instagram carousels — posts with multiple photos or videos that you swipe through — are one of the most popular formats for tutorials, before/afters, infographics, portfolios, and step-by-step guides. But saving a carousel is painful: Instagram gives you no way to bulk-download all slides. You'd have to screenshot each one individually, losing quality in the process.

Here's how to download an entire Instagram carousel — all slides, original quality — as a single ZIP file in one click.

---

## What Is an Instagram Carousel?

A carousel post is an Instagram post containing 2–20 images or videos presented as a swipeable gallery. The URL looks identical to a regular post:

`https://www.instagram.com/p/XXXXXXXXXX/`

You can tell it's a carousel because of the small dots at the bottom of the post (indicating multiple slides) or the `>` arrow on the right edge when viewing on desktop.

---

## How to Download an Instagram Carousel

### Step 1 — Copy the Post URL

**On mobile:**
1. Open Instagram → find the carousel post
2. Tap the **three-dot menu** (⋯) → tap **Copy link**

**On desktop:**
1. Click the post to open it
2. Copy the URL from the address bar

### Step 2 — Use the Photos & Carousel Downloader

1. Go to **[dropzap.digital](https://www.dropzap.digital)**
2. On the **Instagram** tab, use the right-side card: **"Photos & Carousel Downloader"**
   - *(The left card handles Reels/videos — make sure you use the right-side card for carousels)*
3. Paste the carousel URL
4. Click **Download**

### Step 3 — Get Your ZIP

DropZap fetches all slides in parallel, packages them into a ZIP archive, and downloads it to your device. The ZIP contains each slide as a numbered JPG:

```
instagram-carousel-post-XXXX.zip
  ├── slide-1.jpg
  ├── slide-2.jpg
  ├── slide-3.jpg
  └── ...
```

Each image is the original resolution as uploaded — no compression, no resizing.

---

## Technical Details (For Developers)

Instagram exposes carousel slides via `yt-dlp`'s Instagram extractor as a playlist of individual entries. Each entry has a direct CDN URL pointing to the full-resolution asset.

The server fetches all slide URLs in parallel using `Promise.all`, then pipes them into an `archiver` ZIP stream which is delivered directly to the client:

```typescript
import archiver from 'archiver';

// slides = array of CDN URLs from yt-dlp --dump-json
const archive = archiver('zip', { zlib: { level: 5 } });

res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', 'attachment; filename="carousel.zip"');
archive.pipe(res);

await Promise.all(
  slides.map(async (url, i) => {
    const response = await fetch(url);
    archive.append(response.body, { name: `slide-${i + 1}.jpg` });
  })
);

archive.finalize();
```

No temp files are written to disk — the ZIP is streamed directly from the archiver to the HTTP response.

---

## Use Cases

**Content creators** download their own carousel posts to repurpose on other platforms (LinkedIn, Twitter threads, newsletters) without Instagram's compression artifacts.

**Designers** save carousel tutorials and design inspiration posts for offline reference libraries.

**Marketers** download competitor carousels for content analysis and format research.

**Educators** save multi-slide educational carousels to include in course materials.

---

## FAQ

**Does it work for carousels with video slides?**
For carousels that mix photos and videos, the tool downloads photos as JPG and video slides as MP4. All slides are included in the ZIP.

**What's the maximum number of slides?**
Instagram allows up to 20 slides per carousel. All 20 will be in the ZIP.

**Can I download just one slide from a carousel?**
Not directly with this method — you get all slides. To get a specific slide, unzip and keep the one you want.

**The ZIP only has one image — why?**
This means the post was a single photo, not a carousel. A single-image post downloads as a single JPG. That's correct behavior.

**Does it work for carousel Reels (video carousels)?**
Yes — if a multi-video post is treated as a carousel by Instagram's API, the tool handles it.

---

## Try It

Go to **[dropzap.digital](https://www.dropzap.digital)** → Instagram tab → **Photos & Carousel Downloader** (right side) → paste your carousel URL → Download ZIP. All slides in one shot, original quality.
