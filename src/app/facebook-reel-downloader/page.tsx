import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Film } from "lucide-react";
import FacebookSection from "./FacebookSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Facebook Reels Downloader — Save Facebook Reels Free (2026)",
  description:
    "Download Facebook Reels for free as MP4. No login, no watermark. Save Facebook Reels on iPhone, Android, PC. Fast, clean, unlimited.",
  keywords: [
    "facebook reel downloader",
    "download facebook reels",
    "save facebook reels",
    "facebook reels download free",
    "facebook reels saver",
    "download reels from facebook",
    "facebook reels to mp4",
    "best facebook reels downloader",
  ],
  alternates: { canonical: `${SITE_URL}/facebook-reel-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/facebook-reel-downloader`,
    title: "Facebook Reels Downloader — Save Facebook Reels Free",
    description:
      "Download Facebook Reels for free as MP4. No login, no watermark. Save Facebook Reels on iPhone, Android, PC.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Facebook Reels Downloader",
      url: `${SITE_URL}/facebook-reel-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free Facebook Reels downloader. Saves Reels as MP4 at original quality. No login, no watermark, no daily limit. Works on iPhone, Android, PC, and Mac.",
    },
    {
      "@type": "HowTo",
      name: "How to download Facebook Reels",
      description: "Save any Facebook Reel as MP4 in 3 steps — free, no login required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the Reel URL", text: "Open Facebook, find the Reel, tap the share button → Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/facebook-reel-downloader, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the Reel", text: "Click Download. The MP4 saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download Facebook Reels?", acceptedAnswer: { "@type": "Answer", text: "Copy the Reel URL from Facebook (tap share → Copy Link), paste it into DropZap, and click Download. The MP4 saves in 3-5 seconds." } },
        { "@type": "Question", name: "Is the Facebook Reels downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does it work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on iPhone, paste the Reel URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." } },
        { "@type": "Question", name: "Do I need to log in to Facebook?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap downloads public Reels without requiring your Facebook login." } },
        { "@type": "Question", name: "Can I download Facebook Reels in HD?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads Facebook Reels at the original source quality — typically 720p or 1080p HD." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Facebook Reels Downloader", item: `${SITE_URL}/facebook-reel-downloader` },
      ],
    },
  ],
};

export default function FacebookReelDownloaderPage() {
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
            <Link href="/facebook-video-downloader" className="hover:text-foreground transition-colors">Facebook Downloader</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
          <Film className="h-4 w-4" />
          <span>Facebook Reels — Save as MP4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Facebook Reels Downloader{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            — Save Reels Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download Facebook Reels for free as MP4. No login, no watermark, no daily limit. 
          DropZap saves Reels at original quality on iPhone, Android, PC, and Mac.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No login", "HD quality", "No watermark", "iPhone & Android", "PC & Mac", "Free"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-l-blue-500 text-center hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-blue-600/20">
          <div className="flex items-center gap-3 pb-3 border-b border-blue-500/30 mb-4 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center shadow-lg border border-white/10">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Facebook Reels Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any Reel URL — saves as MP4</p>
            </div>
          </div>
          <FacebookSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Why DropZap for Facebook Reels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "No login required", desc: "Download public Reels without logging into Facebook." },
            { title: "HD quality", desc: "Downloads Reels at original source quality — 720p or 1080p HD." },
            { title: "No watermark", desc: "Clean MP4 files. No DropZap branding, no overlays." },
            { title: "All devices", desc: "iPhone Safari, Android Chrome, Windows, Mac — no app needed." },
            { title: "Fast and free", desc: "Downloads in 3-5 seconds. No subscription, no daily limit." },
            { title: "Also downloads videos", desc: "DropZap downloads regular Facebook videos too, not just Reels." },
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
            { q: "How do I download Facebook Reels?", a: "Copy the Reel URL from Facebook (tap share → Copy Link), paste it into DropZap, and click Download. The MP4 saves in 3-5 seconds." },
            { q: "Is the Facebook Reels downloader free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on iPhone, paste the Reel URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." },
            { q: "Do I need to log in to Facebook?", a: "No. DropZap downloads public Reels without requiring your Facebook login." },
            { q: "Can I download Facebook Reels in HD?", a: "Yes. DropZap downloads Facebook Reels at the original source quality — typically 720p or 1080p HD." },
            { q: "Can I download regular Facebook videos too?", a: "Yes. Use DropZap's main Facebook video downloader for regular videos, Reels, and live videos." },
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
            { href: "/facebook-video-downloader", label: "Facebook Video Downloader", desc: "Download Facebook videos, Reels, and live videos." },
            { href: "/instagram-reels-downloader", label: "Instagram Reels Downloader", desc: "Download Instagram Reels as MP4." },
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Download TikTok videos without watermark." },
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "100% free — no watermark, no signup." },
            { href: "/threads-downloader", label: "Threads Downloader", desc: "Download Threads videos and photos." },
            { href: "/reddit-video-downloader", label: "Reddit Video Downloader", desc: "Download Reddit videos with sound." },
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
