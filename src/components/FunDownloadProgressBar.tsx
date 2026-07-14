"use client";

import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface FunDownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

/* Zap mascot: small, clean SVG that runs or pulls along the bar */
function ZapMascot({ running, pulling, done }: { running?: boolean; pulling?: boolean; done?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-sm">
      {/* Head */}
      <circle cx="24" cy="18" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {/* Hard hat */}
      <path d="M14 16 Q24 4 34 16 L34 18 L14 18 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="13" y="17" width="22" height="3" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      {/* Eyes */}
      {done ? (
        <>
          <path d="M20 18 L23 21 M23 18 L20 21" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 18 L28 21 M28 18 L25 21" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="21" cy="18" r="2" fill="#1f2937" />
          <circle cx="27" cy="18" r="2" fill="#1f2937" />
          <circle cx="22" cy="17" r="0.8" fill="#fff" />
          <circle cx="28" cy="17" r="0.8" fill="#fff" />
        </>
      )}
      {/* Mouth */}
      <path d={done ? "M20 24 Q24 28 28 24" : "M20 24 L28 24"} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="15" y="28" width="18" height="13" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
      {/* Belt */}
      <rect x="15" y="35" width="18" height="3" fill="#1e3a8a" />
      {/* Arms */}
      {pulling ? (
        <>
          <path d="M15 31 Q10 33 12 38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="38" r="2.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          <path d="M33 31 Q38 33 36 38" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="38" r="2.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        </>
      ) : (
        <>
          <path d="M15 31 L11 40" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <path d="M33 31 L37 40" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* Legs */}
      {running ? (
        <>
          <path d="M19 41 L16 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round">
            <animate attributeName="d" values="M19 41 L16 47;M19 41 L22 47;M19 41 L16 47" dur="0.4s" repeatCount="indefinite" />
          </path>
          <path d="M29 41 L32 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round">
            <animate attributeName="d" values="M29 41 L32 47;M29 41 L26 47;M29 41 L32 47" dur="0.4s" repeatCount="indefinite" />
          </path>
        </>
      ) : (
        <>
          <path d="M19 41 L18 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M29 41 L30 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
      {/* Running motion lines */}
      {running && (
        <>
          <line x1="8" y1="30" x2="4" y2="30" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <animate attributeName="x1" values="8;2;8" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="8" y1="36" x2="4" y2="36" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <animate attributeName="x1" values="8;2;8" dur="0.5s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="0.5s" repeatCount="indefinite" begin="0.2s" />
          </line>
        </>
      )}
      {/* Sweat when pulling hard */}
      {pulling && !done && (
        <>
          <circle cx="36" cy="10" r="1.5" fill="#60a5fa" opacity="0.8">
            <animate attributeName="cy" values="10;4;10" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="14" r="1" fill="#60a5fa" opacity="0.6">
            <animate attributeName="cy" values="14;8;14" dur="0.7s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.7s" repeatCount="indefinite" begin="0.3s" />
          </circle>
        </>
      )}
    </svg>
  );
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
  const isDone = phase === "done";
  const isFetching = phase === "fetching";

  return (
    <div className="space-y-3 rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 px-4 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-blue-800 dark:text-blue-200">
          {isDone ? "Zap got it! 🎉" : isFetching ? "Zap is warming up…" : hasRealProgress ? `${pct}% — Zap is pulling!` : `${label}…`}
        </span>
        <span className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80">
          {speed > 0 ? `${formatBytes(speed)}/s` : isDone ? "finished" : isFetching ? "connecting…" : "downloading…"}
        </span>
      </div>

      {/* Progress track with Zap running on top */}
      <div className="relative h-14 w-full">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 rounded-full bg-blue-200/40 dark:bg-blue-900/40 overflow-hidden">
          {isFetching ? (
            <div className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-indeterminate" />
          ) : (
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        {/* Zap mascot positioned along the bar */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-300 ease-out"
          style={{ left: isDone ? "100%" : isFetching ? "15%" : `${pct}%` }}
        >
          <ZapMascot running={isFetching} pulling={!isFetching && !isDone} done={isDone} />
        </div>
      </div>

      <div className="flex justify-between text-xs text-blue-700/70 dark:text-blue-300/70">
        <span>
          {formatBytes(downloaded)}
          {total ? ` / ${formatBytes(total)}` : ""}
        </span>
        {eta !== null && eta !== undefined && eta > 0 && !isDone && (
          <span>~{formatEta(eta)} to go</span>
        )}
      </div>
    </div>
  );
}
