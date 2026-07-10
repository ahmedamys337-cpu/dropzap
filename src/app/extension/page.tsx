import type { Metadata } from "next";
import Link from "next/link";
import { Download, Puzzle, MousePointerClick, Zap, ShieldCheck, Globe, ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "DropZap Browser Extension — Download Videos in One Click",
  description:
    "Add a 'Download with DropZap' button directly to TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads pages. Free Chrome and Firefox extension.",
  keywords: [
    "dropzap extension",
    "video downloader extension",
    "tiktok downloader extension",
    "instagram downloader extension",
    "download videos chrome extension",
    "download videos firefox extension",
    "save tiktok videos extension",
    "save instagram reels extension",
    "facebook video downloader extension",
    "twitter video downloader extension",
  ],
  alternates: { canonical: `${SITE_URL}/extension` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/extension`,
    title: "DropZap Browser Extension — One-Click Video Downloader",
    description:
      "Download TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads videos directly from the page with the free DropZap extension.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DropZap Browser Extension",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Windows, macOS, Linux, Chrome OS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "One-click download button on TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads",
    "No watermark on TikTok downloads",
    "No signup required",
  ],
  url: `${SITE_URL}/extension`,
};

export default function ExtensionPage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/20 text-purple-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <Puzzle className="h-4 w-4" />
          Free Browser Extension
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Download any video in{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            one click
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          The DropZap extension adds a download button directly inside TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads. No copying URLs, no tab switching, no watermark.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://chrome.google.com/webstore/detail/dropzap-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-5 w-5" />
            Add to Chrome
          </a>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/dropzap-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold border-2 border-purple-500/50 hover:bg-purple-500/10 transition-colors"
          >
            <Download className="h-5 w-5" />
            Add to Firefox
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          The extension is coming soon. Bookmark this page or add DropZap to your home screen to be first.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
              <MousePointerClick className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-bold mb-2">1. Install the extension</h3>
            <p className="text-sm text-muted-foreground">Add it from the Chrome Web Store or Firefox Add-ons in under 10 seconds.</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-bold mb-2">2. Browse normally</h3>
            <p className="text-sm text-muted-foreground">A small DropZap button appears next to videos on TikTok, Instagram, Facebook, X, Reddit, Pinterest and Threads.</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-pink-600/20 flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="font-bold mb-2">3. Click once</h3>
            <p className="text-sm text-muted-foreground">The video downloads instantly in HD with no watermark and no signup required.</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why install the extension?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <Zap className="h-5 w-5 text-yellow-400" />, title: "One-click downloads", desc: "No copy-paste. No switching tabs. Click the button on the post and the file starts downloading." },
            { icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />, title: "No watermark", desc: "TikTok videos save without the TikTok logo or username overlay automatically." },
            { icon: <Globe className="h-5 w-5 text-blue-400" />, title: "Works everywhere", desc: "Chrome, Firefox, Edge, Brave, Opera, and any Chromium-based desktop browser." },
            { icon: <Puzzle className="h-5 w-5 text-purple-400" />, title: "Lightweight", desc: "Less than 200 KB. Loads only when you visit a supported site. No background tracking." },
            { icon: <Download className="h-5 w-5 text-pink-400" />, title: "7 platforms", desc: "TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest and Threads in one extension." },
            { icon: <ArrowRight className="h-5 w-5 text-cyan-400" />, title: "Always free", desc: "No subscription, no daily limit, no hidden fees — the same DropZap experience you already use." },
          ].map((f, i) => (
            <div key={i} className="glass rounded-xl p-5 flex gap-4">
              <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="glass rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Get notified when the extension launches</h2>
          <p className="text-muted-foreground mb-6">
            We are finalizing Chrome and Firefox builds. Add DropZap to your home screen now and you will be the first to know.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
          >
            <Zap className="h-5 w-5 fill-white" />
            Go to DropZap
          </Link>
        </div>
      </section>
    </main>
  );
}

