import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Instagram } from "lucide-react";
import InstagramSection from "./InstagramSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader — Save Reels as MP4 Free (2026)",
  description:
    "Download Instagram Reels for free as MP4. No login, no watermark. Save Reels on iPhone, Android, PC, and Mac. Fast, clean, unlimited.",
  keywords: [
    "instagram reels downloader",
    "download instagram reels",
    "save instagram reels",
    "instagram reels download free",
    "instagram reels saver",
    "download reels from instagram",
    "instagram reels to mp4",
    "best instagram reels downloader",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-reels-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/instagram-reels-downloader`,
    title: "Instagram Reels Downloader — Save Reels as MP4 Free",
    description:
      "Download Instagram Reels for free as MP4. No login, no watermark. Save Reels on iPhone, Android, PC, and Mac.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Instagram Reels Downloader",
      url: `${SITE_URL}/instagram-reels-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free Instagram Reels downloader. Saves Reels as MP4 at original quality. No login, no watermark, no daily limit. Works on iPhone, Android, PC, and Mac.",
    },
    {
      "@type": "HowTo",
      name: "How to download Instagram Reels",
      description: "Save any Instagram Reel as MP4 in 3 steps — free, no login required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the Reel URL", text: "Open Instagram, tap the three-dot menu on the Reel, then Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/instagram-reels-downloader, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the Reel", text: "Click Download. The MP4 saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download Instagram Reels?", acceptedAnswer: { "@type": "Answer", text: "Copy the Reel URL from Instagram (tap ··· → Copy Link), paste it into DropZap's Instagram Reels downloader, and click Download. The MP4 saves in 3–5 seconds." } },
        { "@type": "Question", name: "Is the Instagram Reels downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does it work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on your iPhone, paste the Reel URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." } },
        { "@type": "Question", name: "Do I need to log in to Instagram?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap downloads public Reels without requiring your Instagram login. Private accounts cannot be accessed." } },
        { "@type": "Question", name: "Can I download Reels in HD?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads Instagram Reels at the original source quality — typically 720p or 1080p HD." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Instagram Reels Downloader", item: `${SITE_URL}/instagram-reels-downloader` },
      ],
    },
  ],
};

export default function InstagramReelsDownloaderPage() {
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
            <Link href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram Downloader</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium">
          <Instagram className="h-4 w-4" />
          <span>Instagram Reels — Save as MP4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Instagram Reels Downloader{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            — Save Reels Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download Instagram Reels for free as MP4. No login, no watermark, no daily limit. 
          DropZap saves Reels at original quality on iPhone, Android, PC, and Mac.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No login", "No watermark", "HD quality", "iPhone & Android", "PC & Mac", "Free"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-l-pink-500 text-center hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-pink-600/20">
          <div className="flex items-center gap-3 pb-3 border-b border-pink-500/30 mb-4 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-800 to-pink-900 flex items-center justify-center shadow-lg border border-white/10">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Instagram Reels Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any Reel URL — saves as MP4</p>
            </div>
          </div>
          <InstagramSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Why DropZap for Instagram Reels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "No login required", desc: "Download public Reels without logging into Instagram. No account credentials needed." },
            { title: "HD quality", desc: "Downloads Reels at the original source quality — 720p or 1080p HD." },
            { title: "No watermark", desc: "Clean MP4 files. No DropZap branding, no overlays." },
            { title: "iPhone & Android", desc: "Works in Safari on iPhone and Chrome on Android. Files save to Camera Roll and Gallery." },
            { title: "PC & Mac", desc: "Works in Chrome, Firefox, Edge, and Safari on Windows and Mac." },
            { title: "Fast and free", desc: "Downloads in 3–5 seconds. No subscription, no daily limit." },
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
            { q: "How do I download Instagram Reels?", a: "Copy the Reel URL from Instagram (tap ··· → Copy Link), paste it into DropZap's Instagram Reels downloader, and click Download. The MP4 saves in 3–5 seconds." },
            { q: "Is the Instagram Reels downloader free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on your iPhone, paste the Reel URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." },
            { q: "Do I need to log in to Instagram?", a: "No. DropZap downloads public Reels without requiring your Instagram login. Private accounts cannot be accessed." },
            { q: "Can I download Reels in HD?", a: "Yes. DropZap downloads Instagram Reels at the original source quality — typically 720p or 1080p HD." },
            { q: "Can I download Instagram photos and carousels?", a: "Yes. Use DropZap's main Instagram downloader for photos, carousels (ZIP), and Reels." },
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
            { href: "/instagram-downloader", label: "Instagram Downloader", desc: "Download Reels, photos, and carousels from Instagram." },
            { href: "/blog/best-instagram-downloader-2026-free", label: "Best Instagram Downloader 2026", desc: "We tested 6 Instagram downloaders — here are the best free picks." },
            { href: "/blog/how-to-download-instagram-reels-on-iphone", label: "Download Reels on iPhone", desc: "Step-by-step guide for saving Reels to Camera Roll." },
            { href: "/blog/how-to-download-instagram-carousel", label: "Download Carousels", desc: "Save Instagram carousel posts as ZIP files." },
            { href: "/alternatives/snapinsta", label: "SnapInsta Alternative", desc: "SnapInsta has daily limits. DropZap has no cap." },
            { href: "/alternatives/igram", label: "iGram Alternative", desc: "iGram has incomplete carousel support. DropZap downloads all slides." },
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
