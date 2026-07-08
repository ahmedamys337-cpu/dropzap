import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Image as ImageIcon } from "lucide-react";
import InstagramSection from "./InstagramSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Photo Downloader — Save Instagram Photos Free (2026)",
  description:
    "Download Instagram photos for free as JPG. No login, no watermark. Save Instagram images on iPhone, Android, PC, and Mac. Fast, clean, unlimited.",
  keywords: [
    "instagram photo downloader",
    "download instagram photos",
    "save instagram photos",
    "instagram image downloader",
    "instagram picture downloader",
    "download instagram pictures",
    "instagram photo saver",
    "best instagram photo downloader",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-photo-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/instagram-photo-downloader`,
    title: "Instagram Photo Downloader — Save Instagram Photos Free",
    description:
      "Download Instagram photos for free as JPG. No login, no watermark. Save Instagram images on iPhone, Android, PC, and Mac.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Instagram Photo Downloader",
      url: `${SITE_URL}/instagram-photo-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free Instagram photo downloader. Saves photos as JPG at original resolution. No login, no watermark, no daily limit. Works on iPhone, Android, PC, and Mac.",
    },
    {
      "@type": "HowTo",
      name: "How to download Instagram photos",
      description: "Save any Instagram photo as JPG in 3 steps — free, no login required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the photo URL", text: "Open Instagram, tap the three-dot menu on the photo, then Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/instagram-photo-downloader, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the photo", text: "Click Download. The JPG saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download Instagram photos?", acceptedAnswer: { "@type": "Answer", text: "Copy the photo URL from Instagram (tap ··· → Copy Link), paste it into DropZap's Instagram photo downloader, and click Download. The JPG saves in 3–5 seconds." } },
        { "@type": "Question", name: "Is the Instagram photo downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does it work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on your iPhone, paste the photo URL, and download. The file saves to Photos." } },
        { "@type": "Question", name: "Do I need to log in to Instagram?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap downloads public photos without requiring your Instagram login. Private accounts cannot be accessed." } },
        { "@type": "Question", name: "Can I download photos in full resolution?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads Instagram photos at the original source resolution — typically 1080x1080 or higher." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Instagram Photo Downloader", item: `${SITE_URL}/instagram-photo-downloader` },
      ],
    },
  ],
};

export default function InstagramPhotoDownloaderPage() {
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
          <ImageIcon className="h-4 w-4" />
          <span>Instagram Photos — Save as JPG</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Instagram Photo Downloader{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            — Save Photos Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download Instagram photos for free as JPG. No login, no watermark, no daily limit. 
          DropZap saves photos at original resolution on iPhone, Android, PC, and Mac.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No login", "Full resolution", "No watermark", "iPhone & Android", "PC & Mac", "Free"].map((f) => (
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
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Instagram Photo Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any photo URL — saves as JPG</p>
            </div>
          </div>
          <InstagramSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Why DropZap for Instagram Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "No login required", desc: "Download public photos without logging into Instagram. No account credentials needed." },
            { title: "Full resolution", desc: "Downloads photos at the original source quality — 1080x1080 or higher." },
            { title: "No watermark", desc: "Clean JPG files. No DropZap branding, no overlays." },
            { title: "iPhone & Android", desc: "Works in Safari on iPhone and Chrome on Android. Files save to Photos and Gallery." },
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
            { q: "How do I download Instagram photos?", a: "Copy the photo URL from Instagram (tap ··· → Copy Link), paste it into DropZap's Instagram photo downloader, and click Download. The JPG saves in 3–5 seconds." },
            { q: "Is the Instagram photo downloader free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on your iPhone, paste the photo URL, and download. The file saves to Photos." },
            { q: "Do I need to log in to Instagram?", a: "No. DropZap downloads public photos without requiring your Instagram login. Private accounts cannot be accessed." },
            { q: "Can I download photos in full resolution?", a: "Yes. DropZap downloads Instagram photos at the original source resolution — typically 1080x1080 or higher." },
            { q: "Can I download Instagram carousels?", a: "Yes. Use DropZap's main Instagram downloader for carousels — it downloads all slides as a ZIP file." },
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
            { href: "/instagram-reels-downloader", label: "Instagram Reels Downloader", desc: "Download Instagram Reels as MP4 — no login, no watermark." },
            { href: "/blog/how-to-download-instagram-carousel", label: "Download Carousels", desc: "Save Instagram carousel posts as ZIP files." },
            { href: "/alternatives/snapinsta", label: "SnapInsta Alternative", desc: "SnapInsta has daily limits. DropZap has no cap." },
            { href: "/alternatives/igram", label: "iGram Alternative", desc: "iGram has incomplete carousel support. DropZap downloads all slides." },
            { href: "/blog/best-instagram-downloader-2026-free", label: "Best Instagram Downloader 2026", desc: "We tested 6 Instagram downloaders — here are the best free picks." },
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
