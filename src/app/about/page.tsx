import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Shield, Globe, Heart } from "lucide-react";

export const metadata: Metadata = {
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
            DropZap supports downloads from <strong>YouTube</strong>,{" "}
            <strong>Instagram</strong> (Reels, Posts, Stories),{" "}
            <strong>TikTok</strong>, <strong>Twitter / X</strong>,{" "}
            <strong>Facebook</strong>, and <strong>Reddit</strong>. You can save videos
            in HD, extract audio as MP3, grab thumbnails, or download in bulk —
            all directly from your browser, with no software to install.
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
              href="mailto:hello@dropzap.digital"
              className="text-foreground underline"
            >
              hello@dropzap.digital
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
