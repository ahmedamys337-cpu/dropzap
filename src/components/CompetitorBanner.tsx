"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";

// Predefined competitor targeting messages. Keys are lowercase names that can
// appear in referrer, search query, or utm_source. Values are the banner copy.
const COMPETITORS: Record<string, { headline: string; body: string; cta: string; href: string }> = {
  snaptik: {
    headline: "SnapTik charging you $4.99/mo?",
    body: "DropZap downloads TikTok videos without watermark — 100% free, no subscription, no daily limit.",
    cta: "Use DropZap free →",
    href: "/tiktok-downloader",
  },
  ssstik: {
    headline: "ssstik not working or showing captchas?",
    body: "DropZap is a faster ssstik alternative. No pop-ups, no fake buttons, no watermark.",
    cta: "Try DropZap →",
    href: "/tiktok-downloader",
  },
  musicallydown: {
    headline: "Hit MusicallyDown's daily limit?",
    body: "DropZap has no cap. Convert TikTok to MP3 or download videos without watermark for free.",
    cta: "Switch to DropZap →",
    href: "/tiktok-to-mp3",
  },
  savefrom: {
    headline: "SaveFrom.net blocked or slow?",
    body: "DropZap downloads Instagram, TikTok, Facebook, Twitter/X and more — minimal ads, no malware.",
    cta: "Try DropZap →",
    href: "/",
  },
  instaoffline: {
    headline: "InstaOffline down?",
    body: "DropZap downloads Instagram Reels, photos and carousels in HD without login.",
    cta: "Download Instagram →",
    href: "/instagram-downloader",
  },
  redditsave: {
    headline: "RedditSave not loading?",
    body: "DropZap downloads Reddit videos with sound automatically merged into one MP4.",
    cta: "Download Reddit →",
    href: "/reddit-video-downloader",
  },
};

const STORAGE_KEY = "dropzap-competitor-banner-dismissed";

export default function CompetitorBanner() {
  const [match, setMatch] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {}

    const haystack = `${window.location.href} ${document.referrer} ${window.location.search}`.toLowerCase();
    for (const name of Object.keys(COMPETITORS)) {
      if (haystack.includes(name)) {
        setMatch(name);
        return;
      }
    }

    // No competitor matched. 20% chance to show the generic "paid alternative" CTA
    // to returning users so the banner still drives conversion for organic traffic.
    if (Math.random() < 0.2) {
      setMatch("snaptik");
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (dismissed || !match) return null;
  const data = COMPETITORS[match];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4">
      <div className="relative rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <p className="font-bold text-sm sm:text-base text-foreground">{data.headline}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{data.body}</p>
        </div>
        <Link
          href={data.href}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
        >
          {data.cta}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="absolute top-2 right-2 sm:static sm:order-last p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
