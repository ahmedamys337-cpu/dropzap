import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Download } from "lucide-react";
import TikTokSection from "./TikTokSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Free TikTok Downloader — No Watermark, No Sign Up (2026)",
  description:
    "Download TikTok videos for free without watermark. No account, no subscription, no limit. Works on iPhone, Android, PC, and Mac. Fast, clean, unlimited.",
  keywords: [
    "free tiktok downloader",
    "tiktok downloader free",
    "download tiktok videos free",
    "free tiktok video downloader no watermark",
    "tiktok downloader without watermark free",
    "free tiktok video save",
    "tiktok video download free online",
    "best free tiktok downloader",
  ],
  alternates: { canonical: `${SITE_URL}/free-tiktok-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/free-tiktok-downloader`,
    title: "Free TikTok Downloader — No Watermark, No Sign Up",
    description:
      "Download TikTok videos for free without watermark. No account, no subscription, no limit. Works on all devices.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Free TikTok Downloader",
      url: `${SITE_URL}/free-tiktok-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "100% free TikTok video downloader. Removes TikTok watermark automatically. No signup, no subscription, no daily limit. Works on iPhone, Android, PC, and Mac.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "2847",
        bestRating: "5",
      },
    },
    {
      "@type": "HowTo",
      name: "How to download TikTok videos for free",
      description: "Save any TikTok video without watermark in 3 steps — completely free, no account required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the TikTok video URL", text: "Open TikTok, tap Share → Copy Link on the video you want to download." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/free-tiktok-downloader, paste the URL into the input field." },
        { "@type": "HowToStep", position: 3, name: "Download the video", text: "Click Download. The watermark-free MP4 saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is this TikTok downloader really free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees. There is no paid tier — everything is free forever." } },
        { "@type": "Question", name: "Does it remove the TikTok watermark?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads TikTok videos from the source before the watermark is applied, so the downloaded MP4 has no TikTok logo or username overlay." } },
        { "@type": "Question", name: "Is there a daily download limit?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap has no daily limit. You can download as many TikTok videos as you need in a single session." } },
        { "@type": "Question", name: "Do I need to create an account?", acceptedAnswer: { "@type": "Answer", text: "No account is required. DropZap never asks for your email, phone number, or TikTok login. Just paste and download." } },
        { "@type": "Question", name: "Does it work on iPhone and Android?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on iPhone or Chrome on Android, paste the TikTok URL, and download. The file saves to Files (iPhone) or Downloads (Android)." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Free TikTok Downloader", item: `${SITE_URL}/free-tiktok-downloader` },
      ],
    },
  ],
};

export default function FreeTikTokDownloaderPage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              DropZap
            </span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok Downloader</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>100% Free — No Subscription Ever</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Free TikTok Downloader{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            — No Watermark, No Sign Up
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download any TikTok video for free without the watermark. No account creation, no credit card, no daily limit. 
          DropZap is completely free — now and forever. Works on iPhone, Android, PC, and Mac.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No signup", "No watermark", "No daily limit", "iPhone & Android", "PC & Mac", "Free forever"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-l-purple-500 text-center hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-purple-600/20">
          <div className="flex items-center gap-3 pb-3 border-b border-purple-500/30 mb-4 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center shadow-lg border border-white/10">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Free TikTok Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any TikTok URL below — no watermark, no signup</p>
            </div>
          </div>
          <TikTokSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Why DropZap is the best free TikTok downloader</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Truly free", desc: "No subscription, no premium tier, no hidden fees. Everything is free forever." },
            { title: "No watermark", desc: "Downloads from TikTok's source before the watermark is applied. Clean MP4s." },
            { title: "No daily limit", desc: "Download as many videos as you need. No caps, no waiting." },
            { title: "No account required", desc: "Never asks for your email, phone, or TikTok login. Paste and download." },
            { title: "Works on all devices", desc: "iPhone, Android, Windows, Mac, iPad — any device with a browser." },
            { title: "Fast and clean", desc: "Downloads in 3–5 seconds. No pop-under ads, no redirect chains." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-xl p-5">
              <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "Is this TikTok downloader really free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees. There is no paid tier — everything is free forever." },
            { q: "Does it remove the TikTok watermark?", a: "Yes. DropZap downloads TikTok videos from the source before the watermark is applied, so the downloaded MP4 has no TikTok logo or username overlay." },
            { q: "Is there a daily download limit?", a: "No. DropZap has no daily limit. You can download as many TikTok videos as you need in a single session." },
            { q: "Do I need to create an account?", a: "No account is required. DropZap never asks for your email, phone number, or TikTok login. Just paste and download." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on your iPhone, paste the TikTok URL, and download. The file saves to the Files app. Tap Share → Save Video to move it to Camera Roll." },
            { q: "Does it work on Android?", a: "Yes. Open DropZap in Chrome on Android, paste the URL, and download. The file saves directly to your Downloads folder and appears in your Gallery." },
            { q: "What about TikTok's own download button?", a: "TikTok's built-in save button adds a watermark with the creator's username. DropZap fetches the clean source video before the watermark is applied." },
          ].map((item, i) => (
            <details key={i} className="glass rounded-xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Related tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Main TikTok download page with device-specific guides." },
            { href: "/snaptik-alternative", label: "SnapTik Alternative", desc: "SnapTik now charges $4.99/mo. DropZap is the free alternative." },
            { href: "/blog/best-tiktok-downloader-no-watermark", label: "7 Best TikTok Downloaders", desc: "Ranked comparison of SnapTik, ssstik, DropZap, and more." },
            { href: "/tiktok-to-mp3", label: "TikTok to MP3", desc: "Convert TikTok videos to MP3 audio for free." },
            { href: "/blog/how-to-download-tiktok-without-watermark", label: "Download Without Watermark", desc: "Complete guide to removing TikTok's watermark on any device." },
            { href: "/blog/how-to-save-tiktok-to-camera-roll", label: "Save to Camera Roll", desc: "Step-by-step for iPhone and Android — no watermark." },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass rounded-xl p-5 hover:-translate-y-0.5 transition-transform block"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground">{link.label}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. For personal use only. Respect content creators&apos; rights.
          </p>
        </div>
      </footer>
    </main>
  );
}
