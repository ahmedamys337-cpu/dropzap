import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Eraser } from "lucide-react";
import TikTokSection from "./TikTokSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Watermark Remover — Remove TikTok Logo Free Online (2026)",
  description:
    "Remove TikTok watermark from videos online for free. Download clean TikTok videos without the logo or username. No app, no signup. Works on iPhone, Android, PC. Best free TikTok watermark remover.",
  keywords: [
    "tiktok watermark remover",
    "remove tiktok watermark",
    "tiktok watermark remover free",
    "remove tiktok logo from video",
    "tiktok watermark remover online",
    "remove tiktok watermark without app",
    "how to remove tiktok watermark",
    "tiktok logo remover",
    "tiktok name remover",
    "tiktok mark remover",
    "tiktok tag remover",
    "watermark remover tiktok",
    "tiktok remover",
    "how to remove tiktok watermark",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-watermark-remover` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tiktok-watermark-remover`,
    title: "TikTok Watermark Remover — Remove TikTok Logo Free Online",
    description:
      "Remove TikTok watermark from videos online for free. Download clean TikTok videos without the logo or username. No app, no signup. Best free TikTok watermark remover.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap TikTok Watermark Remover",
      url: `${SITE_URL}/tiktok-watermark-remover`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free TikTok watermark remover. Downloads TikTok videos from the source before the watermark is applied, so the MP4 has no TikTok logo or username overlay. No app, no signup.",
    },
    {
      "@type": "HowTo",
      name: "How to remove TikTok watermark from a video",
      description: "Download a clean TikTok video without the logo or username in 3 steps — free, no app required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the TikTok video URL", text: "Open TikTok, tap Share → Copy Link on the video." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/tiktok-watermark-remover, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the clean video", text: "Click Download. The MP4 has no TikTok watermark." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I remove the TikTok watermark for free?", acceptedAnswer: { "@type": "Answer", text: "Use DropZap: copy the TikTok URL, paste it into the watermark remover, and download. The video is fetched from TikTok's source before the watermark is applied, so the MP4 is clean." } },
        { "@type": "Question", name: "Do I need to install an app to remove TikTok watermarks?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap is a web-based tool that runs in your browser. No app, no software, no extension. Just paste the URL and download." } },
        { "@type": "Question", name: "Does this work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on your iPhone, paste the TikTok URL, and download. The clean video saves to Files. Tap Share → Save Video for Camera Roll." } },
        { "@type": "Question", name: "Why does TikTok add a watermark?", acceptedAnswer: { "@type": "Answer", text: "TikTok uses the watermark as a branding mechanism. The @username and TikTok logo are overlaid on all in-app saves. DropZap fetches the video from the source before this layer is applied." } },
        { "@type": "Question", name: "Is it legal to remove TikTok watermarks?", acceptedAnswer: { "@type": "Answer", text: "Removing watermarks for personal use is generally accepted. Always credit the original creator if you reshare content. Commercial use without permission may violate copyright." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "TikTok Watermark Remover", item: `${SITE_URL}/tiktok-watermark-remover` },
      ],
    },
  ],
};

export default function TikTokWatermarkRemoverPage() {
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
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
          <Eraser className="h-4 w-4" />
          <span>Watermark Remover — No App Required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          TikTok Watermark Remover{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            — Remove TikTok Logo Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download TikTok videos without the watermark. No app, no software, no signup. 
          DropZap fetches the video from TikTok's source before the watermark is applied, 
          so you get a clean MP4 with no TikTok logo or username overlay.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No app", "No watermark", "Free", "iPhone & Android", "PC & Mac", "No signup"].map((f) => (
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
              <Eraser className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">TikTok Watermark Remover</h2>
              <p className="text-sm text-muted-foreground">Paste any TikTok URL — downloads without the logo</p>
            </div>
          </div>
          <TikTokSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">How TikTok watermarks work — and how to remove them</h2>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>TikTok adds a watermark to every video saved through its in-app download button. The watermark includes:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong className="text-foreground">The TikTok logo</strong> — the musical note icon in the bottom-left corner</li>
            <li><strong className="text-foreground">The creator's username</strong> — @username overlay on the video</li>
            <li><strong className="text-foreground">TikTok branding</strong> — "TikTok" text in some cases</li>
          </ul>
          <p>This watermark is applied by TikTok's app <em>after</em> the video is uploaded. The original source video on TikTok's CDN does not have this layer. DropZap accesses the source directly, so the downloaded MP4 is clean.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "How do I remove the TikTok watermark for free?", a: "Use DropZap: copy the TikTok URL, paste it into the watermark remover, and download. The video is fetched from TikTok's source before the watermark is applied, so the MP4 is clean." },
            { q: "Do I need to install an app to remove TikTok watermarks?", a: "No. DropZap is a web-based tool that runs in your browser. No app, no software, no extension. Just paste the URL and download." },
            { q: "Does this work on iPhone?", a: "Yes. Open DropZap in Safari on your iPhone, paste the TikTok URL, and download. The clean video saves to Files. Tap Share → Save Video for Camera Roll." },
            { q: "Why does TikTok add a watermark?", a: "TikTok uses the watermark as a branding mechanism. The @username and TikTok logo are overlaid on all in-app saves. DropZap fetches the video from the source before this layer is applied." },
            { q: "Is it legal to remove TikTok watermarks?", a: "Removing watermarks for personal use is generally accepted. Always credit the original creator if you reshare content. Commercial use without permission may violate copyright." },
            { q: "Can I remove watermarks from TikTok slideshows?", a: "Yes. TikTok photo slideshows with background music download as a combined video file. DropZap removes the watermark the same way." },
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
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "Download TikTok videos for free without watermark." },
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Main TikTok download page with device-specific guides." },
            { href: "/blog/how-to-download-tiktok-without-watermark", label: "Download Without Watermark", desc: "Complete guide to removing TikTok's watermark on any device." },
            { href: "/blog/how-to-save-tiktok-to-camera-roll", label: "Save to Camera Roll", desc: "Step-by-step for iPhone and Android — no watermark." },
            { href: "/snaptik-alternative", label: "SnapTik Alternative", desc: "SnapTik now charges $4.99/mo. DropZap is the free alternative." },
            { href: "/tiktok-to-mp3", label: "TikTok to MP3", desc: "Convert TikTok videos to MP3 audio for free." },
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
