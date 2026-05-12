"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import AdBanner from "@/components/AdBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap } from "lucide-react";
import type { PlatformSEO } from "@/lib/seo-data";

interface PlatformLandingProps {
  platform: PlatformSEO;
  children: React.ReactNode; // The download tool component
}

// Per-platform internal-link cards. Each tool page surfaces related
// device variants (e.g. /tiktok-downloader/iphone), the matching
// "alternatives/<x>" comparison page, and 1-2 deep blog posts.
// Centralized here so the link graph stays consistent across tools.
type RelatedLink = { label: string; href: string; kind: "device" | "alt" | "blog" };
const RELATED_LINKS: Record<string, RelatedLink[]> = {
  "tiktok-downloader": [
    { label: "TikTok on iPhone — full guide", href: "/tiktok-downloader/iphone", kind: "device" },
    { label: "TikTok on Android — full guide", href: "/tiktok-downloader/android", kind: "device" },
    { label: "SnapTik alternative comparison", href: "/alternatives/snaptik", kind: "alt" },
    { label: "ssstik alternative comparison", href: "/alternatives/ssstik", kind: "alt" },
    { label: "How to download TikTok without watermark", href: "/blog/how-to-download-tiktok-without-watermark", kind: "blog" },
    { label: "7 best TikTok downloaders (tested)", href: "/blog/best-tiktok-downloader-no-watermark", kind: "blog" },
  ],
  "instagram-downloader": [
    { label: "Instagram on iPhone — full guide", href: "/instagram-downloader/iphone", kind: "device" },
    { label: "Instagram on Android — full guide", href: "/instagram-downloader/android", kind: "device" },
    { label: "SnapInsta alternative comparison", href: "/alternatives/snapinsta", kind: "alt" },
    { label: "How to download Reels on iPhone", href: "/blog/how-to-download-instagram-reels-on-iphone", kind: "blog" },
    { label: "How to download Instagram carousels", href: "/blog/how-to-download-instagram-carousel", kind: "blog" },
  ],
  "reddit-video-downloader": [
    { label: "Reddit downloader with sound", href: "/reddit-video-downloader/with-sound", kind: "device" },
    { label: "Why Reddit videos download silent (fix)", href: "/blog/reddit-video-no-sound-fix", kind: "blog" },
  ],
  "facebook-video-downloader": [
    { label: "GetFVid alternative comparison", href: "/alternatives/getfvid", kind: "alt" },
    { label: "How to download Facebook videos & albums", href: "/blog/how-to-download-facebook-video-2026", kind: "blog" },
  ],
  "twitter-video-downloader": [
    { label: "ssstwitter alternative comparison", href: "/alternatives/ssstwitter", kind: "alt" },
    { label: "How to download Twitter / X videos", href: "/blog/how-to-download-twitter-videos", kind: "blog" },
  ],
};

export default function PlatformLanding({ platform, children }: PlatformLandingProps) {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="DropZap home">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                DropZap
              </span>
              <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                Media Downloader
              </p>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href="/youtube-downloader" className="hover:text-foreground transition-colors">YouTube</a>
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</a>
              <a href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Breadcrumb nav (visible) — pairs with BreadcrumbList JSON-LD
         emitted by each tool page. Position matters: above hero so it
         provides context before the LCP element, but below the sticky
         header so it doesn't compete for top-of-fold attention. */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `${platform.name} Downloader` },
        ]}
      />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4 text-center">
        {/*
          Visible H1 mirrors `platform.h1` from seo-data.ts. We split
          on the first em-dash so the platform-name prefix gets the
          gradient treatment while the descriptive tail stays in the
          neutral foreground colour. Falls back to the existing
          "[Name] Downloader — Free & Fast" pattern if `platform.h1`
          isn't set or doesn't contain an em-dash.

          `bg-clip-text text-transparent` paints the gradient as the
          text fill. `pr-2` adds extra horizontal painting room so
          italic/round-edge glyphs at the right of the word (e.g.
          the trailing "t" in "Reddit") don't get cropped by the
          text's own bounding box.
        */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          {(() => {
            const h1 = platform.h1 ?? `${platform.name} Downloader — Free & Fast`;
            const dashIdx = h1.indexOf("—");
            const head = dashIdx > 0 ? h1.slice(0, dashIdx).trim() : h1;
            const tail = dashIdx > 0 ? h1.slice(dashIdx).trim() : "";
            return (
              <>
                <span
                  className={`inline-block pr-2 bg-gradient-to-r ${platform.gradient} bg-clip-text text-transparent`}
                >
                  {head}
                </span>
                {tail && <span className="text-foreground"> {tail}</span>}
              </>
            );
          })()}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
          {platform.description}
        </p>
      </section>

      {/* Ad: Top */}
      <div className="max-w-6xl mx-auto px-4 pt-2">
        <AdBanner slot="top" />
      </div>

      {/*
        Download tool — widened from max-w-3xl to max-w-5xl so
        platforms with side-by-side dual-mode cards (Instagram
        "Reels & Videos / Photos & Carousels", Facebook
        "Videos / Photo Albums") get full breathing room and don't
        truncate the paste-link inputs. Single-card platforms
        (TikTok, Reddit, Twitter) just get a more generous tool
        surface that matches the homepage's spacious feel.
      */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-foreground/10">
          {children}
        </div>
      </section>

      {/* Intro Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">
          {platform.name} Video Downloader Online — Free HD Downloads
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">{platform.content.intro}</p>
        <p className="text-muted-foreground leading-relaxed">{platform.content.whyUs}</p>
      </section>

      {/* How To */}
      <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          How to Download {platform.name} Videos — 3 Easy Steps
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {platform.howTo.map((step, i) => (
            <li key={i} className="glass rounded-xl p-5">
              <div className={`text-3xl font-extrabold bg-gradient-to-br ${platform.gradient} bg-clip-text text-transparent`}>
                {i + 1}
              </div>
              <h3 className="font-bold mt-2 mb-1">{step.step}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Why DropZap is the Best {platform.name} Downloader
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platform.features.map((f, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ad: Middle */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <AdBanner slot="middle" />
      </div>

      {/* Deep Content - Formats & Devices */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Supported Formats & Quality Options</h2>
          <p className="text-muted-foreground leading-relaxed">{platform.content.formats}</p>
        </div>

        {platform.content.quality && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{platform.name} Video Quality Explained</h2>
            <p className="text-muted-foreground leading-relaxed">{platform.content.quality}</p>
          </div>
        )}

        {platform.content.useCases && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Popular Use Cases</h2>
            <div className="text-muted-foreground leading-relaxed prose-list" dangerouslySetInnerHTML={{ __html: platform.content.useCases }} />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Works on All Devices</h2>
          <p className="text-muted-foreground leading-relaxed">{platform.content.devices}</p>
        </div>

        {platform.content.mobileGuide && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Mobile Guide — iPhone &amp; Android</h2>
            <div className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: platform.content.mobileGuide }} />
          </div>
        )}

        {platform.content.comparison && (
          <div>
            <h2 className="text-2xl font-bold mb-4">DropZap vs Other {platform.name} Downloaders</h2>
            <p className="text-muted-foreground leading-relaxed">{platform.content.comparison}</p>
          </div>
        )}

        {platform.content.troubleshooting && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Troubleshooting Common Issues</h2>
            <div className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: platform.content.troubleshooting }} />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Safe &amp; Private</h2>
          <p className="text-muted-foreground leading-relaxed">{platform.content.safety}</p>
        </div>

        {platform.content.legal && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Is It Legal?</h2>
            <p className="text-muted-foreground leading-relaxed">{platform.content.legal}</p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Tips for Best Results</h2>
          <p className="text-muted-foreground leading-relaxed">{platform.content.tips}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-10" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          {platform.name} Downloader — Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {platform.faq.map((item, i) => (
            <details key={i} className="glass rounded-xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related guides (device variants + alternatives + deep blog posts).
         These are the highest-PageRank internal links on the tool page —
         they push topical relevance to long-tail and comparison queries
         without diluting the canonical tool page itself. */}
      {RELATED_LINKS[platform.slug] && RELATED_LINKS[platform.slug].length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Related Guides &amp; Comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RELATED_LINKS[platform.slug].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="glass rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/10"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {link.kind === "device" && "Device guide"}
                  {link.kind === "alt" && "Alternative to"}
                  {link.kind === "blog" && "Tutorial"}
                </div>
                <p className="font-semibold leading-snug">{link.label}</p>
                <p className={`mt-3 text-sm font-medium bg-gradient-to-r ${platform.gradient} bg-clip-text text-transparent`}>
                  Read more →
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Cross-links to other platforms */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-center mb-6">Download From Other Platforms</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: "YouTube", href: "/youtube-downloader", color: "bg-red-600" },
            { name: "TikTok", href: "/tiktok-downloader", color: "bg-gradient-to-r from-cyan-500 to-pink-500" },
            { name: "Instagram", href: "/instagram-downloader", color: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" },
            { name: "Twitter/X", href: "/twitter-video-downloader", color: "bg-black border border-white/20" },
            { name: "Facebook", href: "/facebook-video-downloader", color: "bg-blue-600" },
            { name: "Reddit", href: "/reddit-video-downloader", color: "bg-orange-600" },
          ]
            .filter((p) => `/${platform.slug}` !== p.href)
            .map((p) => (
              <a
                key={p.href}
                href={p.href}
                className={`${p.color} text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}
              >
                {p.name} Downloader
              </a>
            ))}
        </div>
      </section>

      {/* Ad: Bottom */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <AdBanner slot="bottom" />
      </div>

      {/* Footer */}
      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500 fill-purple-500" />
              <span className="font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                DropZap
              </span>
              <span className="text-xs text-muted-foreground">— Media Downloader</span>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-xs text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href="/youtube-downloader" className="hover:text-foreground transition-colors">YouTube</a>
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</a>
              <a href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram</a>
              <a href="/twitter-video-downloader" className="hover:text-foreground transition-colors">Twitter/X</a>
              <a href="/facebook-video-downloader" className="hover:text-foreground transition-colors">Facebook</a>
              <a href="/reddit-video-downloader" className="hover:text-foreground transition-colors">Reddit</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </nav>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            For personal use only. Respect content creators&apos; rights. &copy; {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
