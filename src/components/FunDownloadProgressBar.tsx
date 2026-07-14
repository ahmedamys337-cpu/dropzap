"use client";

import { formatBytes, formatEta, type DownloadProgress as ProgressInfo } from "@/lib/download";

interface FunDownloadProgressBarProps {
  progress: ProgressInfo | null;
  label?: string;
}

/* ── Zap mascot SVG (reusable) ─────────────────────────────────────── */
function ZapMascot({ pulling, done }: { pulling: boolean; done: boolean }) {
  return (
    <g>
      {/* Head */}
      <circle cx="0" cy="-14" r="11" fill="#fbbf24" stroke="#b45309" strokeWidth="2.5" />
      {/* Hard hat */}
      <path d="M-11 -16 Q0 -28 11 -16 L11 -14 L-11 -14 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="-12" y="-15" width="24" height="3" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      {/* Eyes */}
      {done ? (
        <>
          <path d="M-5 -16 L-2 -13 M-2 -16 L-5 -13" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 -16 L5 -13 M5 -16 L2 -13" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-4" cy="-15" r="2" fill="#1f2937" />
          <circle cx="4" cy="-15" r="2" fill="#1f2937" />
          <circle cx="-3.5" cy="-15.5" r="0.7" fill="#fff" />
          <circle cx="4.5" cy="-15.5" r="0.7" fill="#fff" />
        </>
      )}
      {/* Mouth: gritting teeth when pulling, smile when done */}
      {done ? (
        <path d="M-4 -9 Q0 -5 4 -9" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-4 -8 L4 -8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      )}
      {/* Body */}
      <rect x="-10" y="-4" width="20" height="18" rx="4" fill="#3b82f6" stroke="#1e40af" strokeWidth="2.5" />
      {/* Belt */}
      <rect x="-10" y="8" width="20" height="3" fill="#1e3a8a" />
      {/* Arms pulling rope (both hands forward when pulling) */}
      {pulling ? (
        <>
          {/* Left arm forward pulling */}
          <path d="M-10 0 Q-16 2 -14 8" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="-14" cy="8" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          {/* Right arm forward pulling */}
          <path d="M10 0 Q16 2 14 8" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="14" cy="8" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
        </>
      ) : (
        <>
          {/* Arms at side */}
          <path d="M-10 0 L-14 10" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          <path d="M10 0 L14 10" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {/* Legs: bracing when pulling */}
      {pulling ? (
        <>
          <path d="M-6 14 L-10 24" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M6 14 L10 24" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          {/* Feet */}
          <ellipse cx="-11" cy="25" rx="5" ry="2.5" fill="#1f2937" />
          <ellipse cx="11" cy="25" rx="5" ry="2.5" fill="#1f2937" />
        </>
      ) : (
        <>
          <path d="M-6 14 L-7 24" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M6 14 L7 24" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="-7" cy="25" rx="4" ry="2" fill="#1f2937" />
          <ellipse cx="7" cy="25" rx="4" ry="2" fill="#1f2937" />
        </>
      )}
      {/* Sweat drops when pulling */}
      {pulling && !done && (
        <>
          <ellipse cx="10" cy="-22" rx="1.8" ry="3" fill="#60a5fa" opacity="0.8">
            <animate attributeName="cy" values="-22;-28;-22" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="-10" cy="-20" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.6">
            <animate attributeName="cy" values="-20;-26;-20" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
          </ellipse>
        </>
      )}
      {/* Effort lines when pulling */}
      {pulling && !done && (
        <>
          <line x1="-18" y1="-6" x2="-22" y2="-8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="-18" y1="0" x2="-23" y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="-18" y1="6" x2="-22" y2="8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" begin="0.2s" />
          </line>
        </>
      )}
    </g>
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

  /* ── Fetching phase: Zap pulling rope from a well ─────────────────── */
  if (phase === "fetching") {
    return (
      <div className="space-y-3 rounded-2xl border border-blue-400/30 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 px-4 py-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-blue-800 dark:text-blue-200">
            Zap is pulling your file out of the well…
          </span>
          <span className="text-xs text-blue-600/70 dark:text-blue-300/70">Hang tight!</span>
        </div>

        {/* Scene: Zap pulling rope from a well */}
        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-100/60 to-amber-50/40 dark:from-sky-900/30 dark:to-amber-950/20">
          <svg viewBox="0 0 400 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
            {/* Ground */}
            <rect x="0" y="95" width="400" height="25" fill="#92400e" opacity="0.15" />
            {/* Well */}
            <ellipse cx="320" cy="95" rx="35" ry="8" fill="#6b7280" opacity="0.3" />
            <rect x="290" y="70" width="60" height="25" rx="4" fill="#6b7280" stroke="#374151" strokeWidth="2" />
            <ellipse cx="320" cy="70" rx="30" ry="6" fill="#1f2937" />
            {/* Well crossbar */}
            <rect x="285" y="45" width="70" height="5" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            <rect x="310" y="50" width="3" height="20" fill="#78350f" />

            {/* Rope: from well crossbar down to Zap's hands, with wobble */}
            <path d="M320 50 Q260 55 180 72" stroke="#a16207" strokeWidth="3" fill="none" strokeLinecap="round">
              <animate attributeName="d" values="M320 50 Q260 55 180 72;M320 50 Q260 50 180 68;M320 50 Q260 55 180 72" dur="0.6s" repeatCount="indefinite" />
            </path>

            {/* Zap mascot: leaning back, pulling rope, body wobbles with effort */}
            <g transform="translate(160, 70)">
              <g>
                <animateTransform attributeName="transform" type="translate" values="0 0; -3 0; 0 0; -3 0; 0 0" dur="0.5s" repeatCount="indefinite" />
                <ZapMascot pulling={true} done={false} />
              </g>
            </g>

            {/* Speech bubble */}
            <g transform="translate(100, 30)">
              <ellipse cx="0" cy="0" rx="28" ry="12" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" opacity="0.95" />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e40af">Heave!</text>
            </g>
          </svg>
        </div>

        <p className="text-xs text-blue-700/70 dark:text-blue-300/70">
          The server is fetching your {label.toLowerCase()}. This usually takes 5-30 seconds.
        </p>
      </div>
    );
  }

  /* ── Downloading phase: Zap tug-of-war with progress bag ──────────── */
  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 px-4 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-amber-900 dark:text-amber-100">
          {isDone ? "Got it! 🎉" : hasRealProgress ? `${pct}% — Zap is winning!` : `${label}…`}
        </span>
        <span className="text-xs font-medium text-amber-700/80 dark:text-amber-300/80">
          {speed > 0 ? `${formatBytes(speed)}/s` : "transferring…"}
        </span>
      </div>

      {/* Scene: Zap pulling rope, progress bag dragged closer */}
      <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-b from-amber-50/60 to-orange-50/40 dark:from-amber-900/30 dark:to-orange-950/20">
        <svg viewBox="0 0 400 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="progressBagGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Ground */}
          <rect x="0" y="95" width="400" height="25" fill="#92400e" opacity="0.12" />

          {/* Progress track (subtle) */}
          <rect x="0" y="88" width="400" height="4" rx="2" fill="#fde68a" opacity="0.4" />
          <rect x="0" y="88" width={`${pct * 4}`} height="4" rx="2" fill="#f97316" opacity="0.6" className="transition-all duration-300" />

          {/* Progress bag: starts at right, gets dragged left as pct increases */}
          <g transform={`translate(${380 - pct * 3.2}, 65)`} className="transition-all duration-500 ease-out">
            {/* Bag body */}
            <path d="M-18 0 Q-22 15 -16 25 L16 25 Q22 15 18 0 Q14 -4 0 -4 Q-14 -4 -18 0 Z" fill="url(#progressBagGrad)" stroke="#78350f" strokeWidth="2" />
            {/* Bag tie at top */}
            <rect x="-6" y="-8" width="12" height="5" rx="2" fill="#78350f" />
            {/* Label */}
            <text x="0" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">{isDone ? "DONE" : "ZIP"}</text>
            {/* Sparkles when done */}
            {isDone && (
              <>
                <text x="-22" y="-8" fontSize="10">✨</text>
                <text x="20" y="-5" fontSize="12">✨</text>
              </>
            )}
          </g>

          {/* Rope: from bag to Zap's hands, gets shorter as bag comes closer */}
          <path
            d={`M ${380 - pct * 3.2 - 18} 65 Q ${(380 - pct * 3.2 - 18 + 160) / 2} 75 160 72`}
            stroke="#a16207"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-500"
          >
            {!isDone && (
              <animate attributeName="stroke-width" values="3;3.5;3" dur="0.5s" repeatCount="indefinite" />
            )}
          </path>

          {/* Zap mascot: pulls and wobbles with effort, celebrates when done */}
          <g transform="translate(160, 70)">
            <g>
              {isDone ? (
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="0.6s" repeatCount="indefinite" />
              ) : (
                <animateTransform attributeName="transform" type="translate" values="0 0; -4 0; 0 0; -4 0; 0 0" dur="0.4s" repeatCount="indefinite" />
              )}
              <ZapMascot pulling={!isDone} done={isDone} />
            </g>
          </g>

          {/* Speech bubble */}
          {!isDone && pct > 10 && (
            <g transform="translate(100, 25)">
              <ellipse cx="0" cy="0" rx="32" ry="12" fill="#fff" stroke="#f97316" strokeWidth="1.5" opacity="0.95" />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9a3412">
                {pct < 50 ? "Pull!" : pct < 90 ? "Almost!" : "So close!"}
              </text>
            </g>
          )}
          {isDone && (
            <g transform="translate(100, 25)">
              <ellipse cx="0" cy="0" rx="35" ry="14" fill="#fff" stroke="#22c55e" strokeWidth="2" opacity="0.95" />
              <text x="0" y="5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#15803d">Yay! Got it!</text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-amber-800/70 dark:text-amber-200/70">
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
