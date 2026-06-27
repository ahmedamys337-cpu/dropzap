"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Zap } from "lucide-react";

declare global {
  // The AdSense script pushes ad requests onto this queue. Already
  // declared in AdBanner; re-declaring here is harmless and keeps this
  // component self-contained.
  // eslint-disable-next-line no-var
  var adsbygoogle: unknown[] | undefined;
}

interface AdCountdownProps {
  /** How long the ad is shown in seconds (default 5). */
  seconds?: number;
  /** Status message displayed above the ad. */
  message?: string;
  /** Called once the countdown reaches zero. Host should trigger the download here. */
  onComplete: () => void;
  /** Optional close/cancel handler (shown as an X after the timer ends). */
  onClose?: () => void;
  /** Whether to auto-close the overlay once the timer reaches zero (default true). */
  autoClose?: boolean;
}

/**
 * Full-screen overlay that plays a 5-second "ad" placeholder, counts down the
 * seconds visibly, and then fires `onComplete` so the host can trigger the
 * native browser download. Replaces the previous in-page buffering flow.
 *
 * Ad fill:
 *   1. AdSense interstitial unit if both NEXT_PUBLIC_ADSENSE_CLIENT and
 *      NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL are set.
 *   2. Branded DropZap placeholder (the original behaviour).
 *
 * Why this slot matters: users here are highly engaged (waiting for a
 * download they explicitly initiated), the modal owns the full viewport, and
 * the impression is virtually guaranteed visible — all three multiply CPM.
 */
export default function AdCountdown({
  seconds = 5,
  message = "Processing the link to download. Stay on the page.",
  onComplete,
  onClose,
  autoClose = true,
}: AdCountdownProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!fired) {
        setFired(true);
        onComplete();
        if (autoClose && onClose) {
          // Close shortly after so user sees "starting" state briefly.
          const t = setTimeout(onClose, 600);
          return () => clearTimeout(t);
        }
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, fired, onComplete, onClose, autoClose]);

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Processing download"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-background border border-white/10 shadow-2xl p-6 space-y-5">
        {onClose && remaining <= 0 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            className="absolute top-3 right-3 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2 justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-center text-sm font-medium">{message}</p>
        </div>

        {/* === AD ZONE: Interstitial ============================================
            Resolved in render order: AdSense → A-ads → branded placeholder.
            Each branch is mutually exclusive so only one ad renders. */}
        <InterstitialAd />
        {/* === END AD ZONE === */}

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Ad closes in</span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {remaining > 0 ? remaining : "0"}
            </span>
            <span className="text-muted-foreground">s</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared shell so every fill branch gets the same border, height, and
// overflow rules. Keeps the modal layout perfectly stable regardless of
// which ad network ends up filling the slot (or whether the dev
// placeholder runs).
function AdShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="ad-interstitial"
      className="w-full min-h-[260px] rounded-lg bg-gradient-to-br from-white/[0.03] to-white/10 border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 overflow-hidden relative"
    >
      {children}
    </div>
  );
}

function InterstitialAd() {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL;

  const pushedRef = useRef(false);

  useEffect(() => {
    // AdSense's adsbygoogle queue requires exactly one push() per <ins>.
    // Pushing twice produces the "already have ads in them" warning and
    // the second slot stays empty.
    if (!adsenseClient || !adsenseSlot || pushedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // adsbygoogle.js not loaded yet (lazyOnload strategy in layout).
      // AdSense's internal queue retries automatically once loaded.
    }
  }, [adsenseClient, adsenseSlot]);

  // Branch 1: AdSense. Highest priority because (a) it pays best when
  // approved, and (b) running both networks in the same slot violates
  // AdSense's Terms of Service on competitive ad networks.
  if (adsenseClient && adsenseSlot) {
    return (
      <AdShell>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 260 }}
          data-ad-client={adsenseClient}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </AdShell>
    );
  }

  // Branch 2: branded placeholder — preserves the original look for
  // dev/staging builds where no ad networks are wired.
  return (
    <AdShell>
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
        <Zap className="h-7 w-7 text-white fill-white" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Advertisement
      </p>
      <p className="text-sm text-muted-foreground text-center px-6">
        Your download will start automatically
      </p>
    </AdShell>
  );
}
