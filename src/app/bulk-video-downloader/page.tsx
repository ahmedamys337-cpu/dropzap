import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap, Layers, CheckCircle2, ArrowRight, Download } from "lucide-react";

const BulkDownloader = dynamic(() => import("@/components/BulkDownloader"), { ssr: false });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Bulk Video Downloader — Download Multiple Videos at Once (Free)",
  description:
    "Download multiple TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads videos in one batch. Paste URLs, click start, get all files. Free, no signup.",
  keywords: [
    "bulk video downloader",
    "download multiple tiktok videos",
    "batch video downloader",
    "bulk instagram downloader",
    "bulk facebook video downloader",
    "download videos in bulk",
    "mass video downloader",
    "multiple url video downloader",
  ],
  alternates: { canonical: `${SITE_URL}/bulk-video-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/bulk-video-downloader`,
    title: "Bulk Video Downloader — Download Multiple Videos at Once",
    description:
      "Paste multiple video URLs and download them all in one batch. Supports TikTok, Instagram, Facebook, X/Twitter, Reddit, Pinterest and Threads.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function BulkVideoDownloaderPage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/20 text-purple-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <Layers className="h-4 w-4" />
          Bulk Downloader
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Download multiple videos at once
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Paste as many URLs as you want — TikTok, Instagram Reels, Facebook, Twitter/X, Reddit, Pinterest and Threads. DropZap processes them one by one and downloads each file.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No signup</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No daily limit</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No watermark on TikTok</span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <BulkDownloader />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-6">How to bulk download videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">1. Copy URLs</h3>
            <p className="text-sm text-muted-foreground">Open each post and copy its share link. You can mix platforms — TikTok, Instagram, Facebook, etc.</p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">2. Add to queue</h3>
            <p className="text-sm text-muted-foreground">Paste URLs one at a time and press Enter, or add them individually to the batch queue.</p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">3. Start batch</h3>
            <p className="text-sm text-muted-foreground">Click Start Batch Download. DropZap fetches each video and triggers the file save in your browser.</p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Need single downloads?</h2>
          <p className="text-muted-foreground mb-6">
            Use the dedicated tool pages for faster one-off downloads.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-5 w-5" />
            Go to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
