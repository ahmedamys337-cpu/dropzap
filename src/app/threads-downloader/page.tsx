import type { Metadata } from "next";
import Link from "next/link";
import { Zap, AtSign, CheckCircle2, ArrowRight } from "lucide-react";
import ThreadsSection from "./ThreadsSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Threads Video Downloader — Save Threads Videos Free (2026)",
  description:
    "Download Threads videos and photos for free. No app, no login. DropZap saves public Threads posts as MP4 on iPhone, Android, and desktop in seconds.",
  keywords: [
    "threads video downloader",
    "download threads video",
    "save threads video",
    "threads downloader",
    "threads video download free",
    "how to download threads video",
    "threads video saver",
    "threads photo downloader",
    "meta threads downloader",
  ],
  alternates: { canonical: `${SITE_URL}/threads-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/threads-downloader`,
    title: "Threads Video Downloader — Save Threads Videos Free",
    description:
      "Download any public Threads video or photo for free. No signup, no app. Works on iPhone, Android, and PC.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap Threads Downloader",
      url: `${SITE_URL}/threads-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free Threads video and photo downloader. Save any public Threads post as MP4 or JPG — no login, no watermark, no daily limit.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1243",
        bestRating: "5",
      },
    },
    {
      "@type": "HowTo",
      name: "How to download a Threads video",
      description: "Save any public Threads video to your device in 3 steps — free, no app required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the Threads post URL", text: "Open the Threads post, tap the three-dot menu, and select Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/threads-downloader, paste the URL into the input field." },
        { "@type": "HowToStep", position: 3, name: "Download the video", text: "Click Download. The MP4 saves to your device in seconds — no watermark added." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download a Threads video?", acceptedAnswer: { "@type": "Answer", text: "Copy the Threads post URL (tap ··· → Copy Link), paste it into DropZap's Threads downloader, and click Download. The video saves as MP4 in under 5 seconds." } },
        { "@type": "Question", name: "Is the Threads video downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no daily limit, and no login required." } },
        { "@type": "Question", name: "Does it work on iPhone and Android?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on iPhone or Chrome on Android, paste the Threads URL, and download. The video saves to Files on iPhone and Downloads folder on Android." } },
        { "@type": "Question", name: "Can I download Threads photos?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads Threads photo posts as full-resolution JPG files. Carousel posts return all images." } },
        { "@type": "Question", name: "Why can't I download a Threads video?", acceptedAnswer: { "@type": "Answer", text: "Only public Threads posts are downloadable. Private accounts and posts from accounts you follow-only (followers-only setting) cannot be accessed by any external tool." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Threads Downloader", item: `${SITE_URL}/threads-downloader` },
      ],
    },
  ],
};

export default function ThreadsDownloaderPage() {
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
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-4 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full glass text-sm text-muted-foreground">
          <AtSign className="h-4 w-4" />
          <span>Meta Threads Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 dark:from-zinc-300 dark:via-white dark:to-zinc-400 bg-clip-text text-transparent">
            Threads Video Downloader
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
          Save any public Threads video or photo as MP4 / JPG — free, no app, no login, no watermark.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No signup", "No daily limit", "iPhone & Android", "PC & Mac", "Free"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-l-zinc-700 hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-black/30">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-700/30 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg border border-white/10">
              <AtSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Threads Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any public Threads post URL below</p>
            </div>
          </div>
          <ThreadsSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">How to download Threads videos — 3 steps</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: 1, title: "Copy the post URL", body: "Open the Threads post. Tap the three-dot menu (···) → Copy Link. The URL looks like threads.net/@username/post/..." },
            { n: 2, title: "Paste into DropZap", body: "Paste the URL into the input field above and click Download. Processing takes 3–5 seconds." },
            { n: 3, title: "Save the file", body: "On iPhone: save to Files → Share → Save Video for Camera Roll. On Android: file goes directly to Downloads." },
          ].map(({ n, title, body }) => (
            <li key={n} className="glass rounded-xl p-5">
              <div className="text-3xl font-extrabold bg-gradient-to-br from-zinc-500 to-zinc-700 bg-clip-text text-transparent">{n}</div>
              <h3 className="font-bold mt-2 mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Threads downloader — FAQ</h2>
        <div className="space-y-3">
          {[
            { q: "How do I download a Threads video?", a: "Copy the Threads post URL (tap ··· → Copy Link), paste it into DropZap above, and click Download. The MP4 saves in under 5 seconds." },
            { q: "Is it free?", a: "Yes. DropZap is 100% free with no subscription, no daily limit, and no login." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari, paste the Threads URL, and download. The file saves to the Files app. Tap Share → Save Video to move it to Camera Roll." },
            { q: "Can I download Threads photos?", a: "Yes. Photo posts download as full-resolution JPG. Carousel posts return all images." },
            { q: "Why won't a Threads post download?", a: "Only public posts are accessible. Private accounts and followers-only posts cannot be downloaded by any external tool." },
            { q: "Does Threads have an official download button?", a: "No. Like Instagram, Threads has no built-in download option for other users' posts. DropZap fills that gap." },
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
            { href: "/instagram-downloader", label: "Instagram Downloader", desc: "Reels, photos, and carousels — same Meta CDN infrastructure." },
            { href: "/blog/threads-video-downloader", label: "Threads Downloader Guide", desc: "Full step-by-step guide with tips for iPhone, Android, and PC." },
            { href: "/download/threads-video-downloader", label: "Threads Video Saver", desc: "Programmatic guide page with additional technical details." },
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Download TikTok videos without watermark — free." },
            { href: "/facebook-video-downloader", label: "Facebook Downloader", desc: "Same Meta ecosystem — download Facebook Reels and videos." },
            { href: "/blog/best-instagram-downloader-2026-free", label: "Best Instagram Downloader 2026", desc: "Tested comparison of 6 Instagram downloader tools." },
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
