"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface AdCountdownProps {
  /** How long the countdown is shown in seconds (default 5). */
  seconds?: number;
  /** Status message displayed above the countdown. */
  message?: string;
  /** Called once the countdown reaches zero. Host should trigger the download here. */
  onComplete: () => void;
  /** Optional close/cancel handler (shown as an X after the timer ends). */
  onClose?: () => void;
  /** Whether to auto-close the overlay once the timer reaches zero (default true). */
  autoClose?: boolean;
}

/**
 * Full-screen overlay that counts down a few seconds visibly, then fires
 * `onComplete` so the host can trigger the native browser download.
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

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Download starts in</span>
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

