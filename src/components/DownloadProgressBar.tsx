"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, Server, Download as DownloadIcon } from "lucide-react";
import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface DownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

export default function DownloadProgressBar({ progress, label = "Downloading" }: DownloadProgressBarProps) {
  const phase = progress?.phase ?? "fetching";
  const percent = progress?.percent;
  const speed = progress?.speed ?? 0;
  const eta = progress?.eta;
  const downloaded = progress?.downloaded ?? 0;
  const total = progress?.total;

  // Phase 1: Server is fetching/processing the video (yt-dlp running, etc.)
  // This can take 10-60 seconds before any bytes are sent to the client.
  if (phase === "fetching") {
    return (
      <div className="space-y-2 rounded-xl border border-blue-500/40 bg-blue-500/15 dark:bg-blue-500/10 px-4 py-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Server className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">
              Fetching video from source…
            </span>
          </span>
          <span className="text-xs text-blue-700/80 dark:text-blue-300/80">
            This may take a moment
          </span>
        </div>
        {/* Indeterminate animated bar */}
        <div className="h-2.5 rounded-full bg-blue-200/30 dark:bg-blue-900/30 overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/3 rounded-full bg-blue-500 animate-indeterminate" />
        </div>
        <p className="text-xs text-blue-700/70 dark:text-blue-300/70">
          The server is extracting and preparing your video. Download will start automatically.
        </p>
      </div>
    );
  }

  // Phase 2 & 3: Actually receiving bytes or done
  const hasRealProgress = percent !== null && percent !== undefined;

  return (
    <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/10 px-4 py-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {phase === "done" ? (
            <DownloadIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
          )}
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            {hasRealProgress ? `${percent}%` : `${label}…`}
          </span>
        </span>
        <span className="text-xs text-amber-700/80 dark:text-amber-300/80">
          {speed > 0 ? `${formatBytes(speed)}/s` : "transferring…"}
        </span>
      </div>

      <Progress
        value={hasRealProgress ? percent : undefined}
        className="h-2.5 bg-amber-200/30 dark:bg-amber-900/30"
      />

      <div className="flex justify-between text-xs text-amber-700/70 dark:text-amber-300/70">
        <span>
          {formatBytes(downloaded)}
          {total ? ` / ${formatBytes(total)}` : ""}
        </span>
        {eta !== null && eta !== undefined && eta > 0 && (
          <span>~{formatEta(eta)} remaining</span>
        )}
      </div>
    </div>
  );
}

