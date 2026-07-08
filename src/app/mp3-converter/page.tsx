import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  Zap,
  FileAudio,
  Upload,
  Music,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

// Mp3Converter is a client-only file-upload widget — no benefit from
// SSR, and dynamic import keeps the initial HTML/JS payload smaller
// for users who never scroll to the tool.
const Mp3Converter = dynamic(() => import("@/components/Mp3Converter"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 flex items-center justify-center text-muted-foreground">
      Loading converter…
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Free Video to MP3 Converter Online — No Signup | DropZap",
  description:
    "Convert any video to MP3 online free. Extract audio from MP4, MKV, AVI, MOV, WEBM files at 128kbps or 320kbps quality. No signup, no install, no watermark.",
  keywords: [
    "video to mp3 converter",
    "video to mp3 online free",
    "mp4 to mp3 converter",
    "convert video to mp3",
    "extract audio from video",
    "free mp3 converter online",
  ],
  alternates: { canonical: `${SITE_URL}/mp3-converter` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mp3-converter`,
    title: "Free Video to MP3 Converter Online — No Signup",
    description:
      "Convert any video to MP3 online free. 128kbps and 320kbps quality. No signup.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video to MP3 Converter Online",
    description:
      "Extract audio from MP4, MKV, AVI, MOV, WEBM. 128kbps & 320kbps. Free.",
  },
};

const FAQ = [
  {
    q: "Is the video to MP3 converter really free?",
    a: "Yes. The DropZap MP3 converter is 100% free with no signup, no file limits per session, and no watermark added to the output audio. The only limit is a single-file maximum of 500 MB to keep the conversion fast.",
  },
  {
    q: "What video formats can I convert to MP3?",
    a: "DropZap accepts MP4, MKV, AVI, MOV, WEBM, FLV, and WMV. These cover virtually every video file you'd encounter from a phone camera, screen recorder, social platform download, or older archive.",
  },
  {
    q: "What's the difference between 128kbps and 320kbps MP3?",
    a: "128kbps is the streaming-quality default — small file size (~1 MB per minute) and audio that sounds transparent in earbuds and laptop speakers. 320kbps is the maximum MP3 quality — roughly 2.5× the file size, with audio that sounds clean even on studio-grade headphones. Pick 320kbps if you're archiving music; 128kbps is fine for podcasts and voice content.",
  },
  {
    q: "Does the converter work on iPhone and Android?",
    a: "Yes. The tool runs entirely in your browser, so it works in Safari on iPhone and Chrome on Android. The output MP3 saves to the Files app on iPhone (with a one-tap option to add to your Music library) and to the Downloads folder on Android (where it appears in any music player automatically).",
  },
  {
    q: "Are my files uploaded to your server?",
    a: "Files are uploaded to a temporary processing server, converted, and then deleted within 30 minutes. We do not store, share, or analyze the contents of any uploaded file. If you'd prefer fully local conversion, FFmpeg can do the same job offline with the command: ffmpeg -i input.mp4 -q:a 0 output.mp3.",
  },
];

const article = {
  "@type": "Article",
  headline: "Free Video to MP3 Converter Online — No Signup",
  description:
    "Convert any video to MP3 online free. Extract audio from MP4, MKV, AVI, MOV, WEBM files at 128kbps or 320kbps quality.",
  url: `${SITE_URL}/mp3-converter`,
  datePublished: "2026-04-15",
  dateModified: "2026-05-09",
  author: {
    "@type": "Organization",
    name: "DropZap",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "DropZap",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/mp3-converter` },
  image: `${SITE_URL}/opengraph-image`,
};

const softwareApp = {
  "@type": "SoftwareApplication",
  name: "DropZap MP3 Converter",
  description:
    "Free online video to MP3 converter. Extracts audio from MP4, MKV, AVI, MOV, WEBM at 128kbps or 320kbps.",
  url: `${SITE_URL}/mp3-converter`,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "MP4 to MP3",
    "MKV to MP3",
    "AVI to MP3",
    "MOV to MP3",
    "WEBM to MP3",
    "128kbps and 320kbps quality",
  ],
};

const faqPage = {
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbs = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "MP3 Converter",
      item: `${SITE_URL}/mp3-converter`,
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [article, softwareApp, faqPage, breadcrumbs],
};

export default function Mp3ConverterPage() {
  return (
    <main role="main" className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              DropZap
            </span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/how-to" className="hover:text-foreground transition-colors">
              How-To
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "MP3 Converter" }]}
        className="max-w-5xl"
      />

      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <FileAudio className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
            Free Tool
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
          Free Video to MP3 Converter Online — No Signup
        </h1>

        <aside
          className="mb-8 rounded-2xl border-l-4 border-emerald-500 bg-emerald-500/10 p-5"
          aria-label="Quick answer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
            TL;DR
          </div>
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            Upload any video file (MP4, MKV, AVI, MOV, WEBM) and DropZap
            extracts the audio as a 128 kbps or 320 kbps MP3 in seconds. No
            signup, no install, runs entirely in your browser. Files are
            deleted within 30 minutes of conversion.
          </p>
        </aside>

        <div className="mb-10">
          <Mp3Converter />
        </div>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-emerald-400 prose-strong:text-foreground">
          <h2>What this tool does</h2>
          <p>
            The DropZap MP3 converter takes a video file you already have on
            your device and pulls out just the audio track, saving it as a
            standard MP3 file. The video stays untouched on your device — you
            get an MP3 alongside it. This is the same job a desktop tool like
            FFmpeg or Audacity does, but in your browser with a single click,
            with no install and no command line.
          </p>

          <h2>Supported input formats</h2>
          <ul>
            <li>
              <strong>MP4</strong> — the most common format on the web. TikTok,
              Instagram, and screen recorder exports all save as MP4.
            </li>
            <li>
              <strong>MKV</strong> — common for higher-quality archives, ripped
              media, and some recording software (OBS Studio).
            </li>
            <li>
              <strong>AVI</strong> — older Windows-era container, still
              produced by some legacy video tools.
            </li>
            <li>
              <strong>MOV</strong> — Apple QuickTime container; iPhone screen
              recordings and Mac exports default to MOV.
            </li>
            <li>
              <strong>WEBM</strong> — Google's open-source container, common
              for Chrome screen recorders and browser-based recordings.
            </li>
            <li>
              <strong>FLV / WMV</strong> — older formats kept around for
              compatibility with archived files.
            </li>
          </ul>

          <h2>128 kbps vs 320 kbps — which to pick</h2>
          <p>
            The bitrate determines audio quality and file size. Both options
            extract the same source audio; the difference is how aggressively
            the MP3 codec compresses it.
          </p>
          <ul>
            <li>
              <strong>128 kbps</strong> — about 1 MB per minute. Indistinguishable
              from the source for podcasts, voice content, and casual music
              listening on phone speakers or earbuds. The default for streaming
              services and the right pick if you'll be sharing the file or
              uploading it elsewhere.
            </li>
            <li>
              <strong>320 kbps</strong> — about 2.5 MB per minute. The maximum
              MP3 quality. Pick this for music you'll keep long-term, audio
              you'll edit further, or content you'll listen to on
              studio-quality headphones. The quality difference vs the source
              is essentially zero.
            </li>
          </ul>

          <div className="my-8">
            <AdBanner slot="middle" />
          </div>

          <h2>How it works on each device</h2>

          <h3 className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-400" />
            iPhone (iOS 16+)
          </h3>
          <p>
            Tap the upload button, choose a video from Photos or Files, and the
            MP3 downloads to your iOS Files app under <em>On My iPhone &gt;
            Downloads</em>. From there you can long-press the file and choose
            "Save to Music" to add it to your Apple Music library, or share it
            via AirDrop, Messages, or any app that accepts audio.
          </p>

          <h3 className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-400" />
            Android (Chrome, Samsung Internet, Firefox)
          </h3>
          <p>
            Tap upload, pick a video from your Gallery or file manager, and the
            MP3 lands in <em>/Downloads</em> within seconds of conversion
            finishing. Android's MediaStore service automatically scans the
            file, so it appears in any music player app (Spotify local files,
            Samsung Music, Poweramp, VLC) within a few seconds.
          </p>

          <h3 className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Windows / Mac / Linux desktop
          </h3>
          <p>
            On desktop, the converted MP3 saves to your browser's default
            Downloads folder. The whole flow takes about as long as the file
            takes to upload — the conversion itself is faster than real-time on
            our processing servers.
          </p>

          <h2>Common use cases</h2>
          <ul>
            <li>
              <strong>Podcast editing</strong> — extracting the audio track
              from a video recording so you can edit it in Audacity, GarageBand,
              or any audio-only editor.
            </li>
            <li>
              <strong>Music extraction</strong> — pulling the soundtrack from a
              concert clip, music video, or live performance for offline
              listening.
            </li>
            <li>
              <strong>Voice memos</strong> — converting a video voice note to
              an audio-only file that's a fraction of the size and easier to
              share.
            </li>
            <li>
              <strong>Lecture / class recordings</strong> — turning a recorded
              video lecture into an MP3 you can listen to on a commute without
              draining your battery.
            </li>
            <li>
              <strong>Audio books and interviews</strong> — extracting just the
              audio for distraction-free listening or transcription.
            </li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Files are uploaded to a temporary processing server, converted, and
            permanently deleted within 30 minutes. We don't store, log, share,
            or analyze the contents of any uploaded file. The conversion
            happens in an isolated worker — no other process, including
            DropZap's own analytics, sees the file content.
          </p>
          <p>
            If you'd prefer to keep the entire conversion local on your
            machine, FFmpeg does exactly the same job offline:
          </p>
          <pre>
            <code>ffmpeg -i input.mp4 -q:a 0 output.mp3</code>
          </pre>
          <p>
            FFmpeg is free and open-source, available for Windows, Mac, and
            Linux. The DropZap converter is just the same operation in a
            browser-friendly wrapper for users who don't want to install
            anything.
          </p>

          <h2>Frequently asked questions</h2>
        </article>

        <div className="space-y-3 mt-6">
          {FAQ.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white/5 border border-white/10 p-5 open:bg-white/10"
            >
              <summary className="cursor-pointer font-bold text-foreground list-none flex items-center justify-between">
                {f.q}
                <Music className="h-4 w-4 text-emerald-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <section className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 p-6">
          <h2 className="text-2xl font-bold mb-3">Try DropZap's other tools</h2>
          <p className="text-muted-foreground mb-4">
            Need to download videos from social platforms first? DropZap's
            downloaders cover every major platform.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { href: "/tiktok-downloader", label: "TikTok Downloader" },
              { href: "/instagram-downloader", label: "Instagram Downloader" },
              {
                href: "/twitter-video-downloader",
                label: "Twitter / X Video Downloader",
              },
              {
                href: "/facebook-video-downloader",
                label: "Facebook Video Downloader",
              },
              {
                href: "/reddit-video-downloader",
                label: "Reddit Video Downloader",
              },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all text-sm font-semibold text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="my-8">
          <AdBanner slot="bottom" />
        </div>
      </section>
    </main>
  );
}
