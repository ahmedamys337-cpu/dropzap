import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Music } from "lucide-react";
import TikTokSection from "./TikTokSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Sound Downloader — Extract Audio from TikTok Free (2026)",
  description:
    "Download TikTok sounds and songs as MP3 for free. Extract audio from any TikTok video. No watermark, no signup, no daily limit. Works on iPhone, Android, PC.",
  keywords: [
    "tiktok sound downloader",
    "download tiktok sounds",
    "tiktok song downloader",
    "extract tiktok audio",
    "save tiktok sound",
    "tiktok audio downloader",
    "download music from tiktok",
    "tiktok sound to mp3",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-sound-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tiktok-sound-downloader`,
    title: "TikTok Sound Downloader — Extract Audio from TikTok Free",
    description:
      "Download TikTok sounds and songs as MP3 for free. No watermark, no signup, no daily limit.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      name: "DropZap TikTok Sound Downloader",
      url: `${SITE_URL}/tiktok-sound-downloader`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free TikTok sound downloader. Extracts audio from any TikTok video as MP3. No watermark, no signup, no daily limit. Works on iPhone, Android, PC, and Mac.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1674",
        bestRating: "5",
      },
    },
    {
      "@type": "HowTo",
      name: "How to download TikTok sounds as MP3",
      description: "Extract audio from any TikTok video in 3 steps — free, no app required.",
      totalTime: "PT30S",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the TikTok video URL", text: "Open TikTok, find the video with the sound you want, tap Share → Copy Link." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open dropzap.digital/tiktok-sound-downloader, paste the URL." },
        { "@type": "HowToStep", position: 3, name: "Download the MP3", text: "Click Download MP3. The audio file saves to your device in seconds." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I download a TikTok sound as MP3?", acceptedAnswer: { "@type": "Answer", text: "Copy the TikTok video URL, paste it into DropZap's TikTok sound downloader, and click Download MP3. The audio extracts in 3-5 seconds." } },
        { "@type": "Question", name: "Can I download TikTok songs?", acceptedAnswer: { "@type": "Answer", text: "Yes. Any TikTok video that uses a song, sound, or voiceover can be converted to MP3. Paste the video link and DropZap extracts just the audio track." } },
        { "@type": "Question", name: "Is the TikTok sound downloader free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no daily limits." } },
        { "@type": "Question", name: "What audio quality do I get?", acceptedAnswer: { "@type": "Answer", text: "DropZap extracts audio at the highest bitrate TikTok serves — typically 128kbps AAC. The quality matches what you hear in the TikTok app." } },
        { "@type": "Question", name: "Does it work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on iPhone, paste the TikTok URL, and download the MP3. The file saves to Files." } },
        { "@type": "Question", name: "Can I download sounds from TikTok slideshows?", acceptedAnswer: { "@type": "Answer", text: "Yes. TikTok photo slideshows include an audio track. DropZap extracts that audio as MP3 the same way it does for video posts." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "TikTok Sound Downloader", item: `${SITE_URL}/tiktok-sound-downloader` },
      ],
    },
  ],
};

export default function TikTokSoundDownloaderPage() {
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
            <Link href="/tiktok-to-mp3" className="hover:text-foreground transition-colors">TikTok to MP3</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
          <Music className="h-4 w-4" />
          <span>TikTok Sounds — Extract as MP3</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          TikTok Sound Downloader{" "}
          <span className="bg-gradient-to-r from-purple-500 via-pink-600 to-blue-500 bg-clip-text text-transparent">
            — Extract Audio Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Download TikTok sounds and songs as MP3 for free. Extract audio from any TikTok video — 
          no watermark, no signup, no daily limit. Works on iPhone, Android, PC, and Mac.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {["No signup", "128kbps", "No daily limit", "iPhone & Android", "PC & Mac", "Free"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-l-purple-500 text-center hover:-translate-y-0.5 transition-transform hover:shadow-2xl hover:shadow-purple-600/20">
          <div className="flex items-center gap-3 pb-3 border-b border-purple-500/30 mb-4 justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center shadow-lg border border-white/10">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">TikTok Sound Downloader</h2>
              <p className="text-sm text-muted-foreground">Paste any TikTok URL — extracts audio as MP3</p>
            </div>
          </div>
          <TikTokSection />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">How to download TikTok sounds</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>TikTok sounds are the audio tracks used in TikTok videos — songs, voiceovers, original audio, and trending sounds. DropZap extracts the audio from any TikTok video and saves it as an MP3 file.</p>
          <ol className="space-y-3 list-decimal list-inside">
            <li><strong className="text-foreground">Copy the TikTok URL</strong> — Open TikTok, find the video with the sound you want, tap Share → Copy Link</li>
            <li><strong className="text-foreground">Paste into DropZap</strong> — Go to dropzap.digital/tiktok-sound-downloader and paste the URL</li>
            <li><strong className="text-foreground">Download MP3</strong> — Click Download MP3. The audio file saves to your device in 3-5 seconds</li>
          </ol>
          <p>The MP3 file contains just the audio track — no video, no watermark, no TikTok branding. The quality matches what you hear in the TikTok app (typically 128kbps AAC).</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "How do I download a TikTok sound as MP3?", a: "Copy the TikTok video URL, paste it into DropZap's TikTok sound downloader, and click Download MP3. The audio extracts in 3-5 seconds." },
            { q: "Can I download TikTok songs?", a: "Yes. Any TikTok video that uses a song, sound, or voiceover can be converted to MP3. Paste the video link and DropZap extracts just the audio track." },
            { q: "Is the TikTok sound downloader free?", a: "Yes. DropZap is 100% free with no subscription, no signup, and no daily limits." },
            { q: "What audio quality do I get?", a: "DropZap extracts audio at the highest bitrate TikTok serves — typically 128kbps AAC. The quality matches what you hear in the TikTok app." },
            { q: "Does it work on iPhone?", a: "Yes. Open DropZap in Safari on iPhone, paste the TikTok URL, and download the MP3. The file saves to Files." },
            { q: "Can I download sounds from TikTok slideshows?", a: "Yes. TikTok photo slideshows include an audio track. DropZap extracts that audio as MP3 the same way it does for video posts." },
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
            { href: "/tiktok-to-mp3", label: "TikTok to MP3 Converter", desc: "Convert any TikTok video to MP3 audio." },
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "Download TikTok videos without watermark." },
            { href: "/tiktok-watermark-remover", label: "TikTok Watermark Remover", desc: "Remove TikTok logo from videos." },
            { href: "/tiktok-downloader", label: "TikTok Downloader", desc: "Main TikTok download page." },
            { href: "/snaptik-alternative", label: "SnapTik Alternative", desc: "SnapTik now charges. DropZap is free." },
            { href: "/mp3-converter", label: "MP3 Converter", desc: "Convert any video file to MP3." },
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
