import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowRight, Download, Music, Image as ImageIcon, Film, Play, MessageCircle, Video, Share2, Home } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Page Not Found — Try These Free Downloaders (2026)",
  description:
    "The page you're looking for doesn't exist. Try DropZap's free download tools: TikTok, Instagram, Facebook, Twitter/X, Reddit, Pinterest, Threads. No signup, no watermark.",
  keywords: [
    "page not found",
    "404",
    "free downloader",
    "tiktok downloader",
    "instagram downloader",
    "facebook downloader",
    "video downloader",
  ],
  robots: {
    index: false,
  },
};

const tools = [
  { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Download TikTok videos without watermark.", icon: Download },
  { href: "/instagram-downloader", label: "Instagram Downloader", desc: "Download Reels, photos, carousels.", icon: ImageIcon },
  { href: "/facebook-video-downloader", label: "Facebook Downloader", desc: "Download Facebook videos and Reels.", icon: Film },
  { href: "/twitter-video-downloader", label: "Twitter/X Downloader", desc: "Download videos and GIFs from Twitter.", icon: Share2 },
  { href: "/reddit-video-downloader", label: "Reddit Downloader", desc: "Download Reddit videos with sound.", icon: Video },
  { href: "/threads-downloader", label: "Threads Downloader", desc: "Download Threads videos and photos.", icon: MessageCircle },
  { href: "/pinterest-video-downloader", label: "Pinterest Downloader", desc: "Download Pinterest videos as MP4.", icon: Play },
  { href: "/tiktok-to-mp3", label: "TikTok to MP3", desc: "Convert TikTok videos to MP3 audio.", icon: Music },
];

export default function NotFoundPage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
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
            <Link href="/tools" className="hover:text-foreground transition-colors">All Tools</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-20 pb-10 text-center">
        <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist. But we have plenty of free download tools that might help.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all"
        >
          <Home className="h-5 w-5" />
          Go to Homepage
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-xl font-bold mb-6 text-center">Try These Free Download Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
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
                      <h4 className="font-bold text-foreground text-sm">{tool.label}</h4>
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

      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h3 className="text-xl font-bold mb-4">Looking for Something Specific?</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader" },
            { href: "/tiktok-watermark-remover", label: "TikTok Watermark Remover" },
            { href: "/instagram-reels-downloader", label: "Instagram Reels Downloader" },
            { href: "/tiktok-sound-downloader", label: "TikTok Sound Downloader" },
            { href: "/facebook-reel-downloader", label: "Facebook Reels Downloader" },
            { href: "/snaptik-alternative", label: "SnapTik Alternative" },
            { href: "/tools", label: "View All Tools" },
            { href: "/compare", label: "Compare Downloaders" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg glass hover:bg-foreground/5 transition-colors text-sm"
            >
              {link.label}
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
