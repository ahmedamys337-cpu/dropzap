# DropZap — Media Downloader

A full-stack free media downloader web application built with Next.js 14, Tailwind CSS, and shadcn/ui. Download videos from YouTube, Instagram, Twitter/X, and TikTok — or convert local video files to MP3.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## Features

- **YouTube Downloader** — Download in 144p to 4K, plus MP3 audio extraction
- **YouTube Thumbnail Downloader** — All sizes from 120x90 to 1280x720
- **Instagram Reel Downloader** — Download reels and their cover images
- **Twitter/X Video Downloader** — Download videos from tweets
- **TikTok Downloader** — Download without watermark
- **Bulk Download Queue** — Queue multiple URLs, download all at once
- **Video to MP3 Converter** — Upload a video, get MP3 back
- **Dark/Light Mode** — Glassmorphism UI, mobile-first responsive design
- **Recent Downloads** — Last 10 downloads stored in localStorage
- **Rate Limiting** — 1 request per 5 seconds per IP

## Prerequisites

Before running the app, make sure you have:

1. **Node.js 18+** — [Download](https://nodejs.org/)
2. **yt-dlp** — Required for all video downloads
3. **ffmpeg** — Required for MP3 conversion and video merging

### Install yt-dlp

```bash
# Using pip
pip install yt-dlp

# Or on Windows with winget
winget install yt-dlp

# Or on macOS with Homebrew
brew install yt-dlp
```

### Install ffmpeg

```bash
# Windows (winget)
winget install ffmpeg

# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

## Setup

```bash
# 1. Install Node.js dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Open http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

```bash
# Build the Docker image
docker build -t dropzap .

# Run the container
docker run -p 3000:3000 dropzap
```

## Railway Deployment

1. Push this repo to GitHub
2. Connect it on [Railway](https://railway.app)
3. Railway will automatically use the `railway.json` config and Dockerfile
4. The app will be available at your Railway domain

## Render Deployment

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Environment** to `Docker`
3. Point to this repo
4. Render will build and deploy using the Dockerfile

## Project Structure

```
src/
  app/
    page.tsx                          # Main UI with tabs
    layout.tsx                        # Root layout + theme provider
    globals.css                       # Tailwind + glassmorphism styles
    api/
      youtube/info/route.ts           # Fetch video metadata
      youtube/download/route.ts       # Download video/audio
      youtube/thumbnail/route.ts      # Get thumbnail URLs
      instagram/download/route.ts     # Download Instagram reel
      instagram/thumbnail/route.ts    # Get reel cover image
      twitter/download/route.ts       # Download Twitter video
      tiktok/download/route.ts        # Download TikTok video
      convert/mp3/route.ts            # Convert uploaded video to MP3
  components/
    YoutubeDownloader.tsx
    ThumbnailDownloader.tsx
    InstagramDownloader.tsx
    TwitterDownloader.tsx
    TikTokDownloader.tsx
    BulkDownloader.tsx
    Mp3Converter.tsx
    RecentDownloads.tsx
    ThemeToggle.tsx
    ThemeProvider.tsx
    ui/                               # shadcn/ui components
  lib/
    utils.ts                          # Helpers + URL validators
    rate-limit.ts                     # In-memory rate limiter
    hooks.ts                          # useDownloadHistory hook
```

## API Routes

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | `/api/youtube/info`       | Fetch video metadata + formats |
| POST   | `/api/youtube/download`   | Download video or audio        |
| POST   | `/api/youtube/thumbnail`  | Get all thumbnail sizes        |
| POST   | `/api/instagram/download` | Download Instagram reel        |
| POST   | `/api/instagram/thumbnail`| Get reel cover image URL       |
| POST   | `/api/twitter/download`   | Download Twitter/X video       |
| POST   | `/api/tiktok/download`    | Download TikTok (no watermark) |
| POST   | `/api/convert/mp3`        | Convert uploaded video to MP3  |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Node.js)
- **Download Engine**: yt-dlp (via CLI)
- **Audio Conversion**: ffmpeg (via CLI)
- **Icons**: Lucide React
- **Theming**: next-themes

## License

For personal use only. Respect content creators' rights and platform terms of service.
