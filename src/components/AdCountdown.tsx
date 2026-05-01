"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Zap } from "lucide-react";

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
 * The ad zone is a styled div right now so the site keeps working while the
 * AdSense application is under review — once approved, swap the inner div for
 * an `<ins class="adsbygoogle">` unit.
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

        {/* === AD ZONE: Interstitial (swap for <ins class="adsbygoogle"> after AdSense approval) === */}
        <div
          id="ad-interstitial"
          className="w-full min-h-[260px] rounded-lg bg-gradient-to-br from-white/[0.03] to-white/10 border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 overflow-hidden relative"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Zap className="h-7 w-7 text-white fill-white" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Advertisement
          </p>
          <p className="text-sm text-muted-foreground text-center px-6">
            Your download will start automatically
          </p>
        </div>
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
