import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowRight, Download, Music, Image as ImageIcon, Film, Play, MessageCircle, Video, Share2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "All Download Tools — Free Media Downloader Index (2026)",
  description:
    "Browse all free download tools from DropZap. TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest, Threads, YouTube thumbnails, MP3 converter. No signup, no watermark.",
  keywords: [
    "free downloader tools",
    "video downloader tools",
    "media downloader",
    "all downloader tools",
    "free download tools list",
    "best free downloaders 2026",
  ],
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tools`,
    title: "All Download Tools — Free Media Downloader Index",
    description: "Browse all free download tools from DropZap. No signup, no watermark.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      name: "DropZap Download Tools",
      description: "Complete list of free download tools available on DropZap.",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Instagram Downloader", url: `${SITE_URL}/instagram-downloader` },
        { "@type": "ListItem", position: 2, name: "TikTok Downloader", url: `${SITE_URL}/tiktok-downloader` },
        { "@type": "ListItem", position: 3, name: "Twitter/X Video Downloader", url: `${SITE_URL}/twitter-video-downloader` },
        { "@type": "ListItem", position: 4, name: "Facebook Video Downloader", url: `${SITE_URL}/facebook-video-downloader` },
        { "@type": "ListItem", position: 5, name: "Reddit Video Downloader", url: `${SITE_URL}/reddit-video-downloader` },
        { "@type": "ListItem", position: 6, name: "Threads Downloader", url: `${SITE_URL}/threads-downloader` },
        { "@type": "ListItem", position: 7, name: "Pinterest Video Downloader", url: `${SITE_URL}/pinterest-video-downloader` },
        { "@type": "ListItem", position: 8, name: "TikTok to MP3 Converter", url: `${SITE_URL}/tiktok-to-mp3` },
        { "@type": "ListItem", position: 9, name: "MP3 Converter", url: `${SITE_URL}/mp3-converter` },
        { "@type": "ListItem", position: 10, name: "YouTube Thumbnail Downloader", url: `${SITE_URL}` },
        { "@type": "ListItem", position: 11, name: "Free TikTok Downloader", url: `${SITE_URL}/free-tiktok-downloader` },
        { "@type": "ListItem", position: 12, name: "TikTok Watermark Remover", url: `${SITE_URL}/tiktok-watermark-remover` },
        { "@type": "ListItem", position: 13, name: "Instagram Reels Downloader", url: `${SITE_URL}/instagram-reels-downloader` },
        { "@type": "ListItem", position: 14, name: "Instagram Photo Downloader", url: `${SITE_URL}/instagram-photo-downloader` },
        { "@type": "ListItem", position: 15, name: "TikTok Sound Downloader", url: `${SITE_URL}/tiktok-sound-downloader` },
        { "@type": "ListItem", position: 16, name: "Facebook Reels Downloader", url: `${SITE_URL}/facebook-reel-downloader` },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "All Tools", item: `${SITE_URL}/tools` },
      ],
    },
  ],
};

const toolCategories = [
  {
    title: "Main Platform Downloaders",
    tools: [
      { href: "/instagram-downloader", label: "Instagram Downloader", desc: "Download Reels, photos, carousels, and stories.", icon: ImageIcon },
      { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Download TikTok videos without watermark.", icon: Download },
      { href: "/twitter-video-downloader", label: "Twitter/X Video Downloader", desc: "Download videos and GIFs from Twitter/X.", icon: Share2 },
      { href: "/facebook-video-downloader", label: "Facebook Video Downloader", desc: "Download Facebook videos, Reels, and live videos.", icon: Film },
      { href: "/reddit-video-downloader", label: "Reddit Video Downloader", desc: "Download Reddit videos with sound merged.", icon: Video },
      { href: "/threads-downloader", label: "Threads Downloader", desc: "Download Threads videos and photos.", icon: MessageCircle },
      { href: "/pinterest-video-downloader", label: "Pinterest Video Downloader", desc: "Download Pinterest videos as MP4.", icon: Play },
    ],
  },
  {
    title: "TikTok Tools",
    tools: [
      { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "100% free — no watermark, no signup, no limit.", icon: Download },
      { href: "/tiktok-watermark-remover", label: "TikTok Watermark Remover", desc: "Remove TikTok logo from videos for free.", icon: Download },
      { href: "/tiktok-to-mp3", label: "TikTok to MP3 Converter", desc: "Convert TikTok videos to MP3 audio.", icon: Music },
      { href: "/tiktok-sound-downloader", label: "TikTok Sound Downloader", desc: "Extract sounds and songs from TikTok as MP3.", icon: Music },
      { href: "/tiktok-slideshow-downloader", label: "TikTok Slideshow Downloader", desc: "Download TikTok photo slideshows.", icon: Download },
    ],
  },
  {
    title: "Instagram Tools",
    tools: [
      { href: "/instagram-reels-downloader", label: "Instagram Reels Downloader", desc: "Download Instagram Reels as MP4.", icon: Film },
      { href: "/instagram-photo-downloader", label: "Instagram Photo Downloader", desc: "Download Instagram photos as JPG.", icon: ImageIcon },
      { href: "/instagram-story-downloader", label: "Instagram Story Downloader", desc: "Download Instagram Stories.", icon: ImageIcon },
    ],
  },
  {
    title: "Facebook Tools",
    tools: [
      { href: "/facebook-reel-downloader", label: "Facebook Reels Downloader", desc: "Download Facebook Reels as MP4.", icon: Film },
    ],
  },
  {
    title: "Audio & MP3 Tools",
    tools: [
      { href: "/mp3-converter", label: "MP3 Converter", desc: "Convert any video file to MP3 audio.", icon: Music },
      { href: "/tiktok-to-mp3", label: "TikTok to MP3", desc: "Extract audio from TikTok videos.", icon: Music },
    ],
  },
  {
    title: "Competitor Alternatives",
    tools: [
      { href: "/snaptik-alternative", label: "SnapTik Alternative", desc: "SnapTik now charges. DropZap is free.", icon: ArrowRight },
      { href: "/alternatives/ssstik", label: "ssstik Alternative", desc: "ssstik has daily limits. DropZap has no cap.", icon: ArrowRight },
      { href: "/alternatives/musicallydown", label: "MusicallyDown Alternative", desc: "No daily limit, no popunder ads.", icon: ArrowRight },
      { href: "/alternatives/snapinsta", label: "SnapInsta Alternative", desc: "SnapInsta has daily limits. DropZap has no cap.", icon: ArrowRight },
      { href: "/alternatives/igram", label: "iGram Alternative", desc: "iGram has incomplete carousel support.", icon: ArrowRight },
      { href: "/alternatives/savetik", label: "SaveTik Alternative", desc: "SaveTik has downtime. DropZap is reliable.", icon: ArrowRight },
      { href: "/alternatives/tikmate", label: "TikMate Alternative", desc: "TikMate has server errors. DropZap is fast.", icon: ArrowRight },
      { href: "/alternatives/tiktokio", label: "TikTokIO Alternative", desc: "TikTokIO is region-blocked. DropZap is global.", icon: ArrowRight },
    ],
  },
];

export default function ToolsHubPage() {
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
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          All Download Tools{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            — Free, No Signup
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Browse every free download tool on DropZap. Download from Instagram, TikTok, Facebook, 
          Twitter/X, Reddit, Pinterest, Threads, and more. No watermark, no daily limit, no subscription.
        </p>
      </section>

      {toolCategories.map((category) => (
        <section key={category.title} className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-xl font-bold mb-4">{category.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass rounded-xl p-5 hover:-translate-y-0.5 transition-transform block"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground text-sm">{tool.label}</h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

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
