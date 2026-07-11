"use client";

import Link from "next/link";
import InstagramThumbnailDownloader from "@/components/InstagramThumbnailDownloader";
import { Zap, Instagram } from "lucide-react";

export default function InstagramThumbnailDownloaderPage() {
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

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-600/20 text-pink-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <Instagram className="h-4 w-4" />
          Instagram Cover Downloader
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Instagram Thumbnail Downloader
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Paste an Instagram post or Reel URL and grab the cover image in original quality. Great for saving previews, inspiration, and content planning.
        </p>

        <div className="glass rounded-2xl p-6 sm:p-8 text-left">
          <InstagramThumbnailDownloader />
        </div>
      </section>
    </main>
  );
}
