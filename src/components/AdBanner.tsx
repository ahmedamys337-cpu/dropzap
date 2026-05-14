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

// A-ads (anonymousads.com) unit IDs per slot. Used as the fallback ad
// network when AdSense isn't approved/configured. A-ads has zero
// approval friction (instant signup), pays in BTC, and crucially uses
// clean iframe banners with no popups or redirects — safe for Core Web
// Vitals and won't poison a future AdSense reapplication.
//
// Setup:
//   1. Sign up at https://a-ads.com (auto-approved)
//   2. Create one ad unit per slot:
//        - top:     728x90 (Leaderboard) or responsive
//        - middle:  300x250 (Medium Rectangle)
//        - bottom:  728x90 (Leaderboard) or responsive
//        - sidebar: 300x250 (Medium Rectangle)
//   3. Copy each unit's numeric ID (e.g. "2300672") into Render env vars:
//        NEXT_PUBLIC_AADS_SLOT_TOP, _MIDDLE, _BOTTOM, _SIDEBAR
//
// Any slot left unset falls through to the dev placeholder.
const AADS_ENV: Record<string, string | undefined> = {
  top: process.env.NEXT_PUBLIC_AADS_SLOT_TOP,
  middle: process.env.NEXT_PUBLIC_AADS_SLOT_MIDDLE,
  bottom: process.env.NEXT_PUBLIC_AADS_SLOT_BOTTOM,
  sidebar: process.env.NEXT_PUBLIC_AADS_SLOT_SIDEBAR,
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

  // Fallback chain when AdSense isn't approved / configured:
  //   1. If an A-ads unit ID exists for this slot, render the A-ads
  //      iframe. This is the production path until AdSense is approved.
  //   2. Otherwise render an empty placeholder so the layout's
  //      reserved height is preserved (prevents CLS) and dev/staging
  //      builds have a visible "Advertisement" outline.
  if (!client || !adSlot) {
    const aadsUnit = AADS_ENV[slot];

    if (aadsUnit) {
      // A-ads "acceptable" async embed: the iframe pulls a
      // responsively-sized ad that fits the parent container. We size
      // the wrapper to the same minHeight/maxWidth we reserve for
      // AdSense, so swapping networks later doesn't shift the page.
      //
      // Why /acceptable.a-ads.com/ rather than /ad.a-ads.com/:
      //   - /acceptable serves only IAB "acceptable ads" creatives
      //     (no popups, no autoplay video, no malware-y redirects).
      //   - This is the cleanest variant and the only one safe to run
      //     alongside an active AdSense reapplication.
      return (
        <div
          className={`flex items-center justify-center mx-auto ${className}`}
          style={{ maxWidth: size.maxWidth, minHeight: size.minHeight }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: size.maxWidth,
              minHeight: size.minHeight,
            }}
          >
            <iframe
              data-aa={aadsUnit}
              src={`//acceptable.a-ads.com/${aadsUnit}`}
              title="Advertisement"
              // The iframe inherits 100% of the container so the
              // reserved area is always filled (no CLS) and the ad
              // sizes itself to the slot.
              style={{
                border: 0,
                padding: 0,
                width: "100%",
                height: size.minHeight,
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
              // referrerpolicy=no-referrer-when-downgrade is A-ads'
              // documented recommendation for accurate impression
              // attribution while still respecting cross-origin
              // referrer privacy.
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
          </div>
        </div>
      );
    }

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
