"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface DownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

export default function DownloadProgressBar({ progress, label = "Downloading" }: DownloadProgressBarProps) {
  const percent = progress?.percent;
  const speed = progress?.speed ?? 0;
  const eta = progress?.eta;
  const downloaded = progress?.downloaded ?? 0;
  const total = progress?.total;

  return (
    <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/10 px-4 py-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            {percent !== null && percent !== undefined ? `${percent}%` : `${label}…`}
          </span>
        </span>
        <span className="text-xs text-amber-700/80 dark:text-amber-300/80">
          {speed > 0 ? `${formatBytes(speed)}/s` : "connecting…"}
        </span>
      </div>

      <Progress
        value={percent ?? undefined}
        className="h-2.5 bg-amber-200/30 dark:bg-amber-900/30"
      />

      <div className="flex justify-between text-xs text-amber-700/70 dark:text-amber-300/70">
        <span>{formatBytes(downloaded)}{total ? ` / ${formatBytes(total)}` : ""}</span>
        {eta !== null && eta !== undefined && eta > 0 && (
          <span>~{formatEta(eta)} remaining</span>
        )}
      </div>
    </div>
  );
}
