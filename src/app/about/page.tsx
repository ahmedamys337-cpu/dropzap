import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Shield, Globe, Heart } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/about` },
  title: "About DropZap — Free Online Video Downloader",
  description:
    "Learn about DropZap, the free, fast, and privacy-friendly online video downloader for YouTube, Instagram, TikTok, Twitter/X, Facebook, and Reddit. No signup, no watermark, 100% browser-based.",
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
      >
        ← Back to DropZap
      </Link>

      <h1 className="text-4xl font-bold mb-4">About DropZap</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Free, fast, and privacy-first media downloader.
      </p>

      <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Our Mission
          </h2>
          <p>
            DropZap was created with a simple goal: give people a clean, fast, and
            ad-light way to save videos and audio from the platforms they already use
            every day. No bloat. No fake download buttons. No malware redirects.
            Just a tool that works.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What DropZap Does
          </h2>
          <p>
            DropZap supports downloads from{" "}
            <strong>Instagram</strong> (Reels, Posts, Photos, Carousels),{" "}
            <strong>TikTok</strong> (no watermark), <strong>Twitter / X</strong>{" "}
            (videos and GIFs), <strong>Facebook</strong> (videos, Reels, Albums),{" "}
            <strong>Reddit</strong> (with audio merged), <strong>Pinterest</strong>,{" "}
            and <strong>Threads</strong>. You can save videos in HD, extract audio
            as MP3, grab YouTube thumbnails, or download in bulk — all directly
            from your browser, with no software to install.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 not-prose">
          <div className="p-5 rounded-xl border border-border bg-card">
            <Zap className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Lightning Fast</h3>
            <p className="text-sm">
              Downloads start in 1-3 seconds. No queues, no upsells, no &quot;wait 30 seconds&quot;
              countdowns.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <Shield className="h-6 w-6 text-emerald-500 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">
              Privacy by Design
            </h3>
            <p className="text-sm">
              No accounts, no logs, no tracking pixels selling your data. Your
              download history stays on your device.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <Globe className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">
              Works Everywhere
            </h3>
            <p className="text-sm">
              iPhone, Android, PC, Mac — any modern browser. Nothing to install,
              nothing to update.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <Heart className="h-6 w-6 text-pink-500 mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Free Forever</h3>
            <p className="text-sm">
              DropZap is free to use. We&apos;re supported by minimal,
              non-intrusive ads — never pop-ups or fake buttons.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Our Approach
          </h2>
          <p>
            DropZap doesn&apos;t host any content on its servers. When you submit a URL,
            we fetch the media information from the source platform in real-time and
            stream the file directly to your device. Nothing is stored, indexed, or
            retransmitted by DropZap. This keeps the service fast, private, and
            respectful of content creators&apos; rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Technology
          </h2>
          <p>
            DropZap is built on a few open-source pillars rather than reinventing
            them:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong className="text-foreground">yt-dlp</strong> — the trusted
              open-source media extractor that powers our backend. yt-dlp is
              actively maintained by a large community and supports thousands of
              sites; we ship updates the same week it patches platform changes.
            </li>
            <li>
              <strong className="text-foreground">FFmpeg</strong> — used for
              audio/video stream merging (e.g. combining Reddit's separate video
              and audio tracks into a single MP4) and MP3 conversion.
            </li>
            <li>
              <strong className="text-foreground">Next.js</strong> — the React
              framework that renders every page server-side for fast first paint
              and proper SEO indexing.
            </li>
            <li>
              <strong className="text-foreground">HTTPS-only delivery</strong>{" "}
              — every byte between you and DropZap is TLS-encrypted, including
              the actual media stream.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Privacy Commitment
          </h2>
          <p>
            We do not store any files or download history on our servers.
            DropZap holds no user accounts, no email lists, and no per-user
            tracking IDs. The only data we keep are anonymized request counts
            for rate-limiting and ad-revenue reconciliation. We never sell,
            share, or rent visitor data, and we never ask for credentials to
            any platform you download from.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Responsible Use
          </h2>
          <p>
            DropZap is intended for personal, non-commercial use. Please respect
            copyright laws and the terms of service of the source platforms. Only
            download content you have the right to download — for personal archival,
            educational use, or content you created yourself. See our{" "}
            <Link href="/terms" className="text-foreground underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/dmca" className="text-foreground underline">
              DMCA policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Get in Touch
          </h2>
          <p>
            Found a bug? Have a feature suggestion? Want to partner? We&apos;d love
            to hear from you. Visit our{" "}
            <Link href="/contact" className="text-foreground underline">
              Contact page
            </Link>{" "}
            or email us directly at{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
