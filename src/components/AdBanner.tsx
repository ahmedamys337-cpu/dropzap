"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: "top" | "middle" | "bottom" | "sidebar";
  className?: string;
}

// Per-slot reserved heights. Setting these on the wrapper prevents
// CLS (Cumulative Layout Shift) — without a min-height, the slot
// expands when AdSense fills it and pushes content downward, which
// hurts Core Web Vitals.
const SIZES: Record<string, { maxWidth: string; minHeight: string }> = {
  top: { maxWidth: "728px", minHeight: "90px" },
  middle: { maxWidth: "100%", minHeight: "250px" },
  bottom: { maxWidth: "728px", minHeight: "90px" },
  sidebar: { maxWidth: "300px", minHeight: "250px" },
};

// Slot ID env vars per slot. Set these in Render env vars after
// creating the matching ad units in the AdSense dashboard.
const SLOT_ENV: Record<string, string | undefined> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
  middle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  const size = SIZES[slot] || SIZES.middle;
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = SLOT_ENV[slot];
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Trigger AdSense to fill the unit. Each <ins> must have exactly
    // one push() call — pushing twice causes "All ins elements in the
    // DOM with class=adsbygoogle already have ads in them" warnings
    // and the second ad will not render.
    if (!client || !adSlot || pushedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // adsbygoogle.js hasn't loaded yet — Next.js Script with
      // afterInteractive strategy may not have arrived. AdSense
      // auto-retries via its own queue once loaded.
    }
  }, [client, adSlot]);

  // Fallback: if AdSense isn't configured (no client ID or no slot
  // ID), render a visible placeholder so layout stays stable in dev.
  if (!client || !adSlot) {
    return (
      <div
        className={`flex items-center justify-center mx-auto ${className}`}
        style={{ maxWidth: size.maxWidth, minHeight: size.minHeight }}
        aria-hidden="true"
      >
        <div
          className="w-full rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center"
          style={{ minHeight: size.minHeight }}
        >
          <span className="text-xs text-muted-foreground">Advertisement</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center mx-auto ${className}`}
      style={{ maxWidth: size.maxWidth, minHeight: size.minHeight }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: size.minHeight }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
