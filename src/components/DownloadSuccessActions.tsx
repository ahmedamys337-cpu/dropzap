"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { encodeShortUrl } from "@/lib/url-shortener";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { Share2, Download, Smartphone, Puzzle, CheckCircle2, Link2 } from "lucide-react";

interface Props {
  platform: string;
  url: string;
}

export default function DownloadSuccessActions({ platform, url }: Props) {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://www.dropzap.digital";
  const dropzapLink = `${siteUrl}/?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    // Capture the PWA install prompt so we can show it on demand.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed as a PWA.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!url) return;
    try {
      // Generate the short code client-side so it works without a backend round-trip.
      const code = encodeShortUrl(dropzapLink);
      setShortUrl(`${siteUrl}/d/${code}`);
    } catch {
      // Fallback to the full DropZap link if encoding fails for any reason.
      setShortUrl(dropzapLink);
    }
  }, [url, dropzapLink, siteUrl]);

  const shareText = `I just downloaded a ${platform} video with DropZap — no watermark, no signup, free.`;

  const handleNativeShare = async () => {
    const shareUrl = shortUrl || dropzapLink;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DropZap", text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link copied", description: "Share it with your friends." });
    } catch {}
  };

  const handleCopyShortLink = async () => {
    const shareUrl = shortUrl || dropzapLink;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Short link copied", description: shareUrl });
    } catch {}
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Install DropZap",
        description: "Tap your browser menu and choose 'Add to Home Screen' for instant access.",
      });
      return;
    }
    try {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch {}
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-2">
          Share or save this download
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>

      {/* Short link row */}
      {shortUrl && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Short share link</p>
              <p className="text-sm truncate font-mono text-foreground/90">{shortUrl}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="h-10 px-5 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-600/20 flex-shrink-0"
            onClick={handleCopyShortLink}
          >
            Copy Link
          </Button>
        </div>
      )}

      {/* Action buttons as pill-shaped, more clickable cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={handleNativeShare}
          className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition-all hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/10 active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center transition-colors group-hover:bg-blue-500/30">
            <Share2 className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold">Share</span>
        </button>

        <button
          onClick={() => window.location.href = "/extension"}
          className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition-all hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/10 active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center transition-colors group-hover:bg-purple-500/30">
            <Puzzle className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-xs font-semibold">Extension</span>
        </button>

        {!isInstalled && (
          <button
            onClick={handleInstallPWA}
            className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition-all hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/10 active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center transition-colors group-hover:bg-pink-500/30">
              <Smartphone className="h-5 w-5 text-pink-400" />
            </div>
            <span className="text-xs font-semibold">Add to Home</span>
          </button>
        )}

        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("input[aria-label^='Paste']");
            if (input) {
              input.focus();
              input.select();
            }
          }}
          className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 text-center transition-all hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/10 active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center transition-colors group-hover:bg-emerald-500/30">
            <Download className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold">Download More</span>
        </button>

        <div className="col-span-2 sm:col-span-1">
          <QRCodeGenerator url={shortUrl || dropzapLink} />
        </div>
      </div>

      {isInstalled && (
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>DropZap is installed on your device.</span>
        </div>
      )}
    </div>
  );
}
