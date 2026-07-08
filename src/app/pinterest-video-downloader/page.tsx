import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Play } from "lucide-react";
import PinterestSection from "./PinterestSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Pinterest Video Downloader — Save Pinterest Videos Free (2026)",
  description:
    "Download Pinterest videos for free as MP4. No login, no watermark. Save Pinterest videos on iPhone, Android, PC, and Mac. Fast, clean, unlimited.",
  keywords: [
    "pinterest video downloader",
    "download pinterest videos",
    "save pinterest videos",
    "pinterest video saver",
    "download video from pinterest",
    "pinterest video download free",
    "best pinterest video downloader",
  ],
  alternates: { canonical: `${SITE_URL}/pinterest-video-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/pinterest-video-downloader`,
    title: "Pinterest Video Downloader — Save Pinterest Videos Free",
    description:
      "Download Pinterest videos for free as MP4. No login, no watermark. Save Pinterest videos on iPhone, Android, PC, and Mac.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Pinterest Video Downloader",
      url: `${SITE_URL}/pinterest-video-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free Pinterest video downloader. Saves videos as MP4 at original quality. No login, no watermark, no daily limit. Works on iPhone, Android, PC, and Mac.",
    },
    {
      "@type": "HowTo",
      name: "How to download Pinterest videos",
      description: "Save any Pinterest video as MP4 in 3 steps — free, no login required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the video URL", text: "Open Pinterest, tap the share button on the video, then Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/pinterest-video-downloader, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the video", text: "Click Download. The MP4 saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download Pinterest videos?", acceptedAnswer: { "@type": "Answer", text: "Copy the video URL from Pinterest (tap share → Copy Link), paste it into DropZap's Pinterest video downloader, and click Download. The MP4 saves in 3–5 seconds." } },
        { "@type": "Question", name: "Is the Pinterest video downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does it work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on your iPhone, paste the video URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." } },
        { "@type": "Question", name: "Do I need to log in to Pinterest?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap downloads public videos without requiring your Pinterest login. Private boards cannot be accessed." } },
        { "@type": "Question", name: "Can I download Pinterest images too?", acceptedAnswer: { "@type": "Answer", text: "Yes. Use DropZap's main Pinterest downloader for both images and videos." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Pinterest Video Downloader", item: `${SITE_URL}/pinterest-video-downloader` },
      ],
    },
  ],
};

export default function PinterestVideoDownloaderPage() {
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
            <Link href="/pinterest-downloader" className="hover:text-foreground transition-colors">Pinterest Downloader</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
          <Play className="h-4 w-4" />
          <span>Pinterest Videos — Save as MP4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Pinterest Video Downloader{" "}
          <span className="bg-gradient-to-r from-red-500 via-pink-600 to-purple-500 bg-clip-text text-transparent">
            — Save Videos Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download Pinterest videos for free as MP4. No login, no watermark, no daily limit. 
          DropZap saves videos at original quality on iPhone, Android, PC, and Mac.
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
        <div className="glass rounded-2xl p-6 border-l-4 border-l-red-500 text-center hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-red-600/20">
          <div className="flex items-center gap-3 pb-3 border-b border-red-500/30 mb-4 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center shadow-lg border border-white/10">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Pinterest Video Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any video URL — saves as MP4</p>
            </div>
          </div>
          <PinterestSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Why DropZap for Pinterest Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "No login required", desc: "Download public videos without logging into Pinterest. No account credentials needed." },
            { title: "HD quality", desc: "Downloads videos at the original source quality — typically 720p or 1080p HD." },
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
            { q: "How do I download Pinterest videos?", a: "Copy the video URL from Pinterest (tap share → Copy Link), paste it into DropZap's Pinterest video downloader, and click Download. The MP4 saves in 3–5 seconds." },
            { q: "Is the Pinterest video downloader free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on your iPhone, paste the video URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." },
            { q: "Do I need to log in to Pinterest?", a: "No. DropZap downloads public videos without requiring your Pinterest login. Private boards cannot be accessed." },
            { q: "Can I download Pinterest images too?", a: "Yes. Use DropZap's main Pinterest downloader for both images and videos." },
            { q: "Why can't I download some Pinterest videos?", a: "Some Pinterest videos are from external sources (YouTube, Vimeo) and may not be directly downloadable. DropZap works best with native Pinterest videos." },
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
            { href: "/pinterest-downloader", label: "Pinterest Downloader", desc: "Download Pinterest images and videos." },
            { href: "/blog/how-to-download-pinterest-video-and-image", label: "Download Pinterest Guide", desc: "Complete guide to downloading Pinterest content." },
            { href: "/instagram-downloader", label: "Instagram Downloader", desc: "Download Instagram Reels, photos, and carousels." },
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Download TikTok videos without watermark." },
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "100% free TikTok downloader — no watermark, no signup." },
            { href: "/threads-downloader", label: "Threads Downloader", desc: "Download Threads videos and photos for free." },
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
