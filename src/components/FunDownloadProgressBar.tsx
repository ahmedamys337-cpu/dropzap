"use client";

import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface FunDownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

export default function FunDownloadProgressBar({ progress, label = "Downloading" }: FunDownloadProgressBarProps) {
  const phase = progress?.phase ?? "fetching";
  const percent = progress?.percent;
  const speed = progress?.speed ?? 0;
  const eta = progress?.eta;
  const downloaded = progress?.downloaded ?? 0;
  const total = progress?.total;
  const hasRealProgress = percent !== null && percent !== undefined;
  const pct = hasRealProgress ? Math.max(0, Math.min(100, percent)) : 0;

  // Fetching phase: indeterminate + mascot digging
  if (phase === "fetching") {
    return (
      <div className="space-y-3 rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 px-4 py-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="h-12 w-12">
              <circle cx="32" cy="24" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
              <circle cx="28" cy="22" r="1.5" fill="#1f2937" />
              <circle cx="36" cy="22" r="1.5" fill="#1f2937" />
              <path d="M29 28 Q32 31 35 28" stroke="#1f2937" strokeWidth="1.5" fill="none" />
              <rect x="24" y="34" width="16" height="16" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <path d="M32 38 L32 46" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
              <path d="M32 46 L26 52" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <path d="M32 46 L38 52" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            </svg>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-700 dark:text-blue-300">ZAP</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-blue-800 dark:text-blue-200">Zap is digging for your video...</span>
              <span className="text-xs text-blue-600/80 dark:text-blue-300/80">Hang tight!</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-blue-200/40 dark:bg-blue-900/40 overflow-hidden relative">
              <div className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 animate-indeterminate" />
            </div>
          </div>
        </div>
        <p className="text-xs text-blue-700/70 dark:text-blue-300/70">
          The server is negotiating with {label.toLowerCase()}. This usually takes 5-30 seconds.
        </p>
      </div>
    );
  }

  // Downloading phase: mascot pulling a rope tied to the progress bar
  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 px-4 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-amber-900 dark:text-amber-100">
          {phase === "done" ? "All set! 🎉" : hasRealProgress ? `${pct}% pulled in` : `${label}…`}
        </span>
        <span className="text-xs font-medium text-amber-700/80 dark:text-amber-300/80">
          {speed > 0 ? `${formatBytes(speed)}/s` : "transferring…"}
        </span>
      </div>

      {/* Animated scene: mascot pulling rope tied to progress bar */}
      <div className="relative h-14 w-full overflow-hidden rounded-xl bg-amber-100/50 dark:bg-amber-900/30">
        <svg viewBox="0 0 400 64" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Progress fill */}
          <rect
            x="0"
            y="28"
            width={`${pct * 4}`}
            height="16"
            rx="8"
            fill="url(#barGradient)"
            className="transition-all duration-300"
          />
          {/* Rope from mascot to progress bag */}
          <path
            d={`M ${64 - pct * 0.35} 38 Q ${(64 + pct * 4) / 2} 45 ${pct * 4} 38`}
            stroke="#92400e"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 2"
            className="transition-all duration-300"
          />
          {/* Progress bag */}
          <g transform={`translate(${pct * 4 - 4}, 28)`} className="transition-all duration-300">
            <rect x="0" y="-4" width="14" height="22" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <text x="7" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">ZIP</text>
          </g>
          {/* Mascot: slides backward as progress grows */}
          <g transform={`translate(${64 - pct * 0.35}, 32)`} className="transition-all duration-300">
            <circle cx="0" cy="-8" r="9" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
            <circle cx="-3" cy="-10" r="1.5" fill="#1f2937" />
            <circle cx="3" cy="-10" r="1.5" fill="#1f2937" />
            <path d="M-3 -5 Q0 -2 3 -5" stroke="#1f2937" strokeWidth="1.5" fill="none" />
            <rect x="-8" y="2" width="16" height="14" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
            <path d="M0 6 L0 12" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0 12 L-5 18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
            <path d="M0 12 L5 18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
            {/* Sweat drops */}
            <circle cx="7" cy="-12" r="1.5" fill="#60a5fa" className="animate-bounce" />
            <circle cx="10" cy="-8" r="1" fill="#60a5fa" className="animate-bounce" style={{ animationDelay: "0.2s" }} />
          </g>
        </svg>
      </div>

      <div className="flex justify-between text-xs text-amber-800/70 dark:text-amber-200/70">
        <span>
          {formatBytes(downloaded)}
          {total ? ` / ${formatBytes(total)}` : ""}
        </span>
        {eta !== null && eta !== undefined && eta > 0 && (
          <span>~{formatEta(eta)} to go</span>
        )}
      </div>
    </div>
  );
}
