import type { Metadata } from "next";
import Link from "next/link";
import { Music, TrendingUp, Download, ArrowRight, Zap } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Trending Sounds 2026 — Download & Convert to MP3",
  description:
    "Discover the most popular TikTok trending sounds this week. Download any TikTok video and convert it to MP3 with DropZap — no watermark, no signup.",
  keywords: [
    "tiktok trending sounds",
    "trending tiktok audio",
    "viral tiktok sounds",
    "tiktok sound downloader",
    "tiktok to mp3",
    "download tiktok audio",
    "tiktok mp3 converter",
    "popular tiktok sounds 2026",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-trending-sounds` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tiktok-trending-sounds`,
    title: "TikTok Trending Sounds — Download & Convert to MP3",
    description: "Discover the most popular TikTok sounds this week and convert any TikTok video to MP3 with DropZap.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

// Curated weekly trending sounds. Update this list weekly to keep the page fresh.
const trendingSounds = [
  { rank: 1, title: "Speed Up Songs (Remixes)", category: "Pop / Electronic", searches: "2.4M" },
  { rank: 2, title: "Phonk & Drift Edits", category: "Hip-Hop / Phonk", searches: "1.8M" },
  { rank: 3, title: "Sped-Up Mashups", category: "Mashup", searches: "1.5M" },
  { rank: 4, title: "Sad Piano / Emotional", category: "Instrumental", searches: "1.1M" },
  { rank: 5, title: "Brazilian Funk Beats", category: "Funk", searches: "950K" },
  { rank: 6, title: "Anime / Cartoon Edits", category: "OST / Remix", searches: "880K" },
  { rank: 7, title: "Country & Acoustic Covers", category: "Country", searches: "720K" },
  { rank: 8, title: "Motivational Speeches", category: "Voiceover", searches: "650K" },
  { rank: 9, title: "K-Pop Short Clips", category: "K-Pop", searches: "590K" },
  { rank: 10, title: "Baby / Family Moments", category: "Viral Audio", searches: "540K" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "TikTok Trending Sounds",
  itemListElement: trendingSounds.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.title,
    description: `${s.title} — ${s.category}. ${s.searches} weekly searches.`,
  })),
};

export default function TikTokTrendingSoundsPage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-600/20 text-pink-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <TrendingUp className="h-4 w-4" />
          Updated weekly
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          TikTok Trending Sounds
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          The most searched TikTok audio categories right now. Paste any TikTok URL below to download the video and convert it to MP3.
        </p>
        <Link
          href="/tiktok-to-mp3"
          className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
        >
          <Music className="h-5 w-5" />
          TikTok to MP3
        </Link>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Top 10 trending sound categories</h2>
        <div className="space-y-3">
          {trendingSounds.map((sound) => (
            <div
              key={sound.rank}
              className="glass rounded-xl p-4 flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                #{sound.rank}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{sound.title}</h3>
                <p className="text-sm text-muted-foreground">{sound.category}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Searches</p>
                <p className="font-semibold text-pink-400">{sound.searches}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">How to download a trending sound</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">1</span>
              <p className="text-sm text-muted-foreground">Find a TikTok video using the sound you want.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">2</span>
              <p className="text-sm text-muted-foreground">Tap Share → Copy Link.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">3</span>
              <p className="text-sm text-muted-foreground">Paste it into DropZap's TikTok to MP3 tool and click Download.</p>
            </li>
          </ol>
          <div className="mt-6">
            <Link
              href="/tiktok-to-mp3"
              className="inline-flex items-center gap-2 text-purple-400 hover:underline font-semibold"
            >
              Convert TikTok to MP3 now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Want to download the full video too?</h2>
          <p className="text-muted-foreground mb-6">
            DropZap downloads the TikTok video without watermark and also extracts the audio as MP3.
          </p>
          <Link
            href="/tiktok-downloader"
            className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-5 w-5" />
            TikTok Downloader
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
