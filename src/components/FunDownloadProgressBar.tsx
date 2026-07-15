"use client";

import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface FunDownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

/* ── Zap mascot SVG ─────────────────────────────────────────────────── */
function ZapMascot({
  pushing,
  digging,
  done,
  facingRight,
}: {
  pushing?: boolean;
  digging?: boolean;
  done?: boolean;
  facingRight?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 drop-shadow-md" style={{ transform: facingRight ? "scaleX(-1)" : undefined }}>
      {/* Head */}
      <circle cx="24" cy="18" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {/* Hard hat */}
      <path d="M14 16 Q24 4 34 16 L34 18 L14 18 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="13" y="17" width="22" height="3" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      {/* Eyes */}
      {done ? (
        <>
          <path d="M20 17 L23 20 M23 17 L20 20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 17 L28 20 M28 17 L25 20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
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
      {/* Arms: pushing forward when pushing, digging when digging */}
      {pushing ? (
        <>
          <path d="M15 30 L8 34" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M15 30 L8 34;M15 30 L6 32;M15 30 L8 34" dur="0.5s" repeatCount="indefinite" />
          </path>
          <circle cx="8" cy="34" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1">
            <animate attributeName="cx" values="8;6;8" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <path d="M33 30 L40 34" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="34" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        </>
      ) : digging ? (
        <>
          {/* Both arms forward digging */}
          <path d="M15 30 L10 36" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M15 30 L10 36;M15 30 L8 40;M15 30 L10 36" dur="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M33 30 L38 36" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M33 30 L38 36;M33 30 L40 40;M33 30 L38 36" dur="0.3s" repeatCount="indefinite" />
          </path>
        </>
      ) : (
        <>
          <path d="M15 31 L11 40" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <path d="M33 31 L37 40" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* Legs */}
      {digging ? (
        <>
          <path d="M19 41 L16 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M29 41 L32 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : pushing ? (
        <>
          {/* Bracing legs */}
          <path d="M19 41 L14 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M29 41 L34 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M19 41 L18 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M29 41 L30 47" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
      {/* Sweat drops when pushing/digging */}
      {(pushing || digging) && !done && (
        <>
          <ellipse cx="36" cy="10" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.8">
            <animate attributeName="cy" values="10;3;10" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="40" cy="14" rx="1" ry="2" fill="#60a5fa" opacity="0.6">
            <animate attributeName="cy" values="14;7;14" dur="0.6s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.6s" repeatCount="indefinite" begin="0.3s" />
          </ellipse>
        </>
      )}
      {/* Digging dirt particles */}
      {digging && !done && (
        <>
          <circle cx="6" cy="42" r="1.5" fill="#92400e" opacity="0.7">
            <animate attributeName="cx" values="6;2;6" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="cy" values="42;38;42" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="0.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="42" cy="42" r="1.5" fill="#92400e" opacity="0.7">
            <animate attributeName="cx" values="42;46;42" dur="0.4s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="cy" values="42;38;42" dur="0.4s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="0.4s" repeatCount="indefinite" begin="0.2s" />
          </circle>
        </>
      )}
      {/* Effort lines when pushing */}
      {pushing && !done && (
        <>
          <line x1="3" y1="28" x2="0" y2="28" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="3" y1="34" x2="0" y2="34" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.4s" repeatCount="indefinite" />
          </line>
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
    <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-4 animate-in fade-in duration-200">
      {isFetching ? (
        /* ── Fetching: card with Zap on left, digging text, indeterminate bar ── */
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <ZapMascot digging={!isDone} done={isDone} />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-blue-600 px-1 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                Zap
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-blue-800 dark:text-blue-200">
                  Zap is digging for your {label.toLowerCase()}…
                </span>
                <span className="flex-shrink-0 rounded-full bg-blue-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-800/40 dark:text-blue-300">
                  Hang tight!
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-blue-200/50 dark:bg-blue-900/40 overflow-hidden">
                <div className="move-bar absolute inset-y-0 w-1/4 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400" />
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
            The server is negotiating with downloading. This usually takes 5-30 seconds.
          </p>
        </div>
      ) : (
        /* ── Downloading / Done: Two Zaps pushing bar back & forth ── */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-blue-800 dark:text-blue-200">
              {isDone ? "Zap got it! 🎉" : hasRealProgress ? `${pct}% — Zap is pushing!` : `${label}…`}
            </span>
            <span className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80">
              {speed > 0 ? `${formatBytes(speed)}/s` : isDone ? "finished" : "pushing…"}
            </span>
          </div>

          <div className="relative h-20 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-50/40 to-blue-50/20 dark:from-sky-900/20 dark:to-blue-950/20">
            {/* The blue bar in the middle */}
            <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 px-8">
              <div className="relative h-full rounded-full bg-blue-200/40 dark:bg-blue-900/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-pink-500 transition-all duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Left Zap pushing right → */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2">
              <div style={{ animation: isDone ? "none" : "pushRight 0.8s ease-in-out infinite" }}>
                <ZapMascot pushing={!isDone} done={isDone} facingRight={true} />
              </div>
            </div>

            {/* Right Zap pushing left ← */}
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <div style={{ animation: isDone ? "none" : "pushLeft 0.8s ease-in-out infinite" }}>
                <ZapMascot pushing={!isDone} done={isDone} facingRight={false} />
              </div>
            </div>

            {/* Percentage in center */}
            {hasRealProgress && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md z-10">
                {pct}%
              </div>
            )}
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
      )}

      <style jsx>{`
        @keyframes moveBar {
          0% { transform: translateX(0); }
          50% { transform: translateX(300%); }
          100% { transform: translateX(0); }
        }
        .move-bar {
          animation: moveBar 1.6s ease-in-out infinite;
        }
        @keyframes pushRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        @keyframes pushLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
      `}</style>
    </div>
  );
}
