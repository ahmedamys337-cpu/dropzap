import { ThemeToggle } from "@/components/ThemeToggle";
import AdBanner from "@/components/AdBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Zap,
  Instagram,
  Twitter,
  Facebook,
  Music2,
  MessageSquare,
  Image as ImageIcon,
  AtSign,
  CheckCircle2,
  Copy,
  MousePointerClick,
  Download,
  Shield,
  Zap as ZapIcon,
  Eye,
  Clock,
  Smartphone,
  Globe,
  Headphones,
  Sparkles,
} from "lucide-react";
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
    { label: "Free TikTok Downloader (no signup)", href: "/free-tiktok-downloader", kind: "alt" },
    { label: "TikTok Watermark Remover", href: "/tiktok-watermark-remover", kind: "alt" },
    { label: "TikTok Sound Downloader (MP3)", href: "/tiktok-sound-downloader", kind: "alt" },
    { label: "SnapTik alternative (free — SnapTik now paid)", href: "/snaptik-alternative", kind: "alt" },
    { label: "ssstik alternative comparison", href: "/alternatives/ssstik", kind: "alt" },
    { label: "MusicallyDown alternative — no daily limit", href: "/alternatives/musicallydown", kind: "alt" },
    { label: "SaveTik alternative comparison", href: "/alternatives/savetik", kind: "alt" },
    { label: "TikMate alternative comparison", href: "/alternatives/tikmate", kind: "alt" },
    { label: "TikTokIO alternative comparison", href: "/alternatives/tiktokio", kind: "alt" },
    { label: "How to download TikTok without watermark", href: "/blog/how-to-download-tiktok-without-watermark", kind: "blog" },
    { label: "Save TikTok to Camera Roll (no watermark)", href: "/blog/how-to-save-tiktok-to-camera-roll", kind: "blog" },
    { label: "TikTok downloader for PC & laptop", href: "/blog/tiktok-downloader-pc-laptop", kind: "blog" },
    { label: "SnapTik now charges $4.99/mo — alternatives", href: "/blog/snaptik-now-paid-free-alternative", kind: "blog" },
    { label: "7 best TikTok downloaders tested (2026)", href: "/blog/best-tiktok-downloader-no-watermark", kind: "blog" },
    { label: "Best TikTok Downloader 2026 (tested)", href: "/blog/best-tiktok-downloader-2026", kind: "blog" },
  ],
  "tiktok-to-mp3": [
    { label: "TikTok Downloader — save videos", href: "/tiktok-downloader", kind: "alt" },
    { label: "Video to MP3 Converter — upload files", href: "/mp3-converter", kind: "alt" },
    { label: "MusicallyDown alternative — no limit", href: "/blog/musicallydown-alternative-no-limit", kind: "blog" },
    { label: "MusicallyDown alternative comparison", href: "/alternatives/musicallydown", kind: "alt" },
  ],
  "instagram-downloader": [
    { label: "Instagram on iPhone — full guide", href: "/instagram-downloader/iphone", kind: "device" },
    { label: "Instagram on Android — full guide", href: "/instagram-downloader/android", kind: "device" },
    { label: "Instagram Reels Downloader", href: "/instagram-reels-downloader", kind: "alt" },
    { label: "Instagram Photo Downloader", href: "/instagram-photo-downloader", kind: "alt" },
    { label: "Instagram Story Downloader", href: "/instagram-story-downloader", kind: "alt" },
    { label: "SnapInsta alternative comparison", href: "/alternatives/snapinsta", kind: "alt" },
    { label: "iGram alternative (no daily limit)", href: "/alternatives/igram", kind: "alt" },
    { label: "Best Instagram downloader 2026 (tested)", href: "/blog/best-instagram-downloader-2026-free", kind: "blog" },
    { label: "Best Instagram Downloader 2026 (new)", href: "/blog/best-instagram-downloader-2026", kind: "blog" },
    { label: "How to download Reels on iPhone", href: "/blog/how-to-download-instagram-reels-on-iphone", kind: "blog" },
    { label: "How to download Instagram carousels", href: "/blog/how-to-download-instagram-carousel", kind: "blog" },
    { label: "How to download Instagram videos", href: "/blog/how-to-download-instagram-video", kind: "blog" },
  ],
  "reddit-video-downloader": [
    { label: "Reddit downloader with sound", href: "/reddit-video-downloader/with-sound", kind: "device" },
    { label: "Why Reddit videos download silent (fix)", href: "/blog/reddit-video-no-sound-fix", kind: "blog" },
    { label: "Save Reddit videos with sound — guide 2026", href: "/blog/save-reddit-video-with-sound", kind: "blog" },
    { label: "How to download Reddit images", href: "/blog/how-to-download-reddit-images", kind: "blog" },
  ],
  "facebook-video-downloader": [
    { label: "Facebook Reels Downloader", href: "/facebook-reel-downloader", kind: "alt" },
    { label: "GetFVid alternative comparison", href: "/alternatives/getfvid", kind: "alt" },
    { label: "GetVid alternative comparison", href: "/alternatives/getvid", kind: "alt" },
    { label: "How to download Facebook videos & albums", href: "/blog/how-to-download-facebook-video-2026", kind: "blog" },
    { label: "Facebook video downloader guide (2026)", href: "/blog/facebook-video-downloader-guide", kind: "blog" },
    { label: "How to download Facebook videos", href: "/blog/how-to-download-facebook-video", kind: "blog" },
  ],
  "twitter-video-downloader": [
    { label: "ssstwitter alternative comparison", href: "/alternatives/ssstwitter", kind: "alt" },
    { label: "How to download Twitter / X videos", href: "/blog/how-to-download-twitter-videos", kind: "blog" },
    { label: "Twitter video downloader guide (2026)", href: "/blog/twitter-video-downloader-guide", kind: "blog" },
    { label: "How to download Twitter GIFs", href: "/blog/how-to-download-twitter-gifs", kind: "blog" },
  ],
  "threads-downloader": [
    { label: "Threads video downloader guide", href: "/blog/threads-video-downloader", kind: "blog" },
    { label: "How to download Threads videos", href: "/blog/how-to-download-threads-videos", kind: "blog" },
    { label: "Instagram Downloader (same CDN, same team)", href: "/instagram-downloader", kind: "alt" },
  ],
  "pinterest-video-downloader": [
    { label: "Pinterest Video Downloader guide", href: "/pinterest-video-downloader", kind: "alt" },
    { label: "Instagram Downloader (similar)", href: "/instagram-downloader", kind: "alt" },
  ],
  "tiktok-sound-downloader": [
    { label: "TikTok to MP3 Converter", href: "/tiktok-to-mp3", kind: "alt" },
    { label: "TikTok Downloader", href: "/tiktok-downloader", kind: "alt" },
    { label: "MP3 Converter", href: "/mp3-converter", kind: "alt" },
  ],
  "facebook-reel-downloader": [
    { label: "Facebook Video Downloader", href: "/facebook-video-downloader", kind: "alt" },
    { label: "Instagram Reels Downloader", href: "/instagram-reels-downloader", kind: "alt" },
    { label: "How to download Facebook videos", href: "/blog/how-to-download-facebook-video", kind: "blog" },
  ],
};

// Platform icon helper — returns a white icon for the tool card header.
const PlatformIcon = ({ slug, className = "h-5 w-5" }: { slug: string; className?: string }) => {
  switch (slug) {
    case "tiktok-downloader":
    case "tiktok-to-mp3":
      return <Music2 className={className} />;
    case "instagram-downloader":
      return <Instagram className={className} />;
    case "twitter-video-downloader":
      return <Twitter className={className} />;
    case "facebook-video-downloader":
      return <Facebook className={className} />;
    case "reddit-video-downloader":
      return <MessageSquare className={className} />;
    case "pinterest-video-downloader":
      return <ImageIcon className={className} />;
    case "threads-downloader":
      return <AtSign className={className} />;
    default:
      return <ZapIcon className={className} />;
  }
};

// Feature icon helper — picks an icon based on feature title keywords.
const FeatureIcon = ({ title, className = "h-5 w-5" }: { title: string; className?: string }) => {
  const t = title.toLowerCase();
  if (t.includes("watermark")) return <Sparkles className={className} />;
  if (t.includes("hd") || t.includes("quality") || t.includes("high")) return <Eye className={className} />;
  if (t.includes("fast") || t.includes("speed") || t.includes("quick") || t.includes("instant")) return <Clock className={className} />;
  if (t.includes("private") || t.includes("safe") || t.includes("secure") || t.includes("no login")) return <Shield className={className} />;
  if (t.includes("mobile") || t.includes("iphone") || t.includes("android")) return <Smartphone className={className} />;
  if (t.includes("mp3") || t.includes("audio") || t.includes("sound")) return <Headphones className={className} />;
  if (t.includes("global") || t.includes("online") || t.includes("web")) return <Globe className={className} />;
  if (t.includes("free") || t.includes("unlimited")) return <ZapIcon className={className} />;
  return <CheckCircle2 className={className} />;
};

const FeatureCard = ({
  icon,
  gradient,
  title,
  desc,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  desc: string;
}) => (
  <div className="group glass rounded-xl p-5 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
    <div
      className={`inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}
    >
      {icon}
    </div>
    <h3 className="font-bold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

const HowToStep = ({
  n,
  step,
  gradient,
  icon,
}: {
  n: number;
  step: { step: string; desc: string };
  gradient: string;
  icon: React.ReactNode;
}) => (
  <li className="group glass rounded-xl p-5 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br ${gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <div className={`text-2xl font-extrabold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
        {n}
      </div>
    </div>
    <h3 className="font-bold mt-2 mb-1">{step.step}</h3>
    <p className="text-sm text-muted-foreground">{step.desc}</p>
  </li>
);

const RelatedCard = ({
  link,
  gradient,
}: {
  link: { label: string; href: string; kind: "device" | "alt" | "blog" };
  gradient: string;
}) => {
  const kindLabel = {
    device: "Device guide",
    alt: "Alternative to",
    blog: "Tutorial",
  }[link.kind];
  return (
    <a
      href={link.href}
      className="group glass rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{kindLabel}</div>
      <p className="font-semibold leading-snug mb-3">{link.label}</p>
      <p className={`text-sm font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent flex items-center gap-1`}>
        Read more <span className="group-hover:translate-x-1 transition-transform">→</span>
      </p>
    </a>
  );
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
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</a>
              <a href="/tiktok-to-mp3" className="hover:text-foreground transition-colors">TikTok MP3</a>
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

      {/* Hero — kept compact so the tool appears above the fold. */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-2 text-center">
        {(() => {
          const h1 = platform.h1 ?? `${platform.name} Downloader — Free & Fast`;
          const dashIdx = h1.indexOf("—");
          const head = dashIdx > 0 ? h1.slice(0, dashIdx).trim() : h1;
          const tail = dashIdx > 0 ? h1.slice(dashIdx).trim() : "";
          return (
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              <span className={`inline-block pr-2 bg-gradient-to-r ${platform.gradient} bg-clip-text text-transparent`}>
                {head}
              </span>
              {tail && <span className="text-foreground"> {tail}</span>}
            </h1>
          );
        })()}
      </section>

      {/*
        Download tool — placed immediately below the H1 so users see the whole
        tool on first glance without scrolling.
      */}
      <section className="max-w-5xl mx-auto px-4 pt-2 pb-6">
        <div className="glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-foreground/10">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-foreground/10">
            <div
              className={`shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-md`}
            >
              <PlatformIcon slug={platform.slug} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{platform.name} Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste the URL below and download in seconds</p>
            </div>
          </div>
          {children}
        </div>
      </section>

      {/* Description + top ad — moved below the tool so content flows after the action. */}
      <section className="max-w-4xl mx-auto px-4 pb-8 text-center">
        <p className="text-base sm:text-lg text-muted-foreground">
          {platform.description}
        </p>
      </section>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <AdBanner slot="top" />
      </div>

      {/* Intro Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">
          {platform.introHeading ?? `${platform.name} Video Downloader Online — Free HD Downloads`}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">{platform.content.intro}</p>
        <p className="text-muted-foreground leading-relaxed">{platform.content.whyUs}</p>
      </section>

      {/* How To */}
      <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          {platform.howToTitle ?? `How to Download ${platform.name} Videos — 3 Easy Steps`}
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {platform.howTo.map((step, i) => {
            const icons = [<Copy key="copy" className="h-5 w-5" />, <MousePointerClick key="paste" className="h-5 w-5" />, <Download key="download" className="h-5 w-5" />];
            return (
              <HowToStep
                key={i}
                n={i + 1}
                step={step}
                gradient={platform.gradient}
                icon={icons[i]}
              />
            );
          })}
        </ol>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Why DropZap is the Best {platform.name} Downloader
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platform.features.map((f, i) => (
            <FeatureCard
              key={i}
              icon={<FeatureIcon title={f.title} className="h-5 w-5" />}
              gradient={platform.gradient}
              title={f.title}
              desc={f.desc}
            />
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
            <details key={i} className="group glass rounded-xl p-4 open:bg-white/[0.04] transition-colors">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-3">
                <span className="flex items-center gap-3">
                  <span className={`flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br ${platform.gradient} text-white text-xs shadow-sm`}>
                    ?
                  </span>
                  {item.q}
                </span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform shrink-0">&#9662;</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 ml-10 leading-relaxed">{item.a}</p>
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
              <RelatedCard key={link.href} link={link} gradient={platform.gradient} />
            ))}
          </div>
        </section>
      )}

      {/* Cross-links to other platforms */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-center mb-6">Download From Other Platforms</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "TikTok", href: "/tiktok-downloader", color: "from-cyan-500 to-pink-500", icon: <Music2 className="h-4 w-4" /> },
            { name: "TikTok MP3", href: "/tiktok-to-mp3", color: "from-emerald-500 to-pink-500", icon: <Headphones className="h-4 w-4" /> },
            { name: "Instagram", href: "/instagram-downloader", color: "from-purple-600 via-pink-600 to-orange-500", icon: <Instagram className="h-4 w-4" /> },
            { name: "Twitter/X", href: "/twitter-video-downloader", color: "from-zinc-700 to-black", icon: <Twitter className="h-4 w-4" /> },
            { name: "Facebook", href: "/facebook-video-downloader", color: "from-blue-500 to-blue-700", icon: <Facebook className="h-4 w-4" /> },
            { name: "Reddit", href: "/reddit-video-downloader", color: "from-orange-500 to-red-600", icon: <MessageSquare className="h-4 w-4" /> },
          ]
            .filter((p) => `/${platform.slug}` !== p.href)
            .map((p) => (
              <a
                key={p.href}
                href={p.href}
                className="group glass rounded-xl p-3 text-center hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br ${p.color} text-white shadow-md mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {p.icon}
                </div>
                <p className="text-sm font-semibold">{p.name}</p>
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
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</a>
              <a href="/tiktok-to-mp3" className="hover:text-foreground transition-colors">TikTok to MP3</a>
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
