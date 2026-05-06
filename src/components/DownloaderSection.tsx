"use client";

import type { ReactNode } from "react";

/**
 * Visual wrapper for one of several stacked downloader features on a single
 * platform page (e.g. Instagram's Reel / Reel-thumbnail / Photos cards).
 *
 * Each section gets:
 *   - a colored icon chip + bold title + small description ("what does this
 *     specific URL field accept and what file do I get?"),
 *   - a thin colored top border that matches the icon chip so the user can
 *     visually scan three stacked cards on a single page without confusing
 *     them,
 *   - children — the actual SimpleDownloader form for that feature.
 *
 * The component is presentational only; it owns no state. Caller passes in
 * the download form (typically <SimpleDownloader …/>) as children.
 */
export default function DownloaderSection({
  icon,
  title,
  description,
  iconBgClassName,
  borderColorClassName,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  /**
   * Tailwind classes for the icon chip background. Use the same gradient /
   * solid color as the section's primary call-to-action button so the eye
   * pairs them. Example: "bg-gradient-to-br from-purple-600 via-pink-600
   * to-orange-500".
   */
  iconBgClassName: string;
  /**
   * Tailwind border color class applied to the section's top divider.
   * Example: "border-pink-600/30". Pick a hue from the same family as
   * `iconBgClassName` for visual cohesion.
   */
  borderColorClassName: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border ${borderColorClassName} bg-foreground/[0.02] p-5 space-y-4`}
    >
      <header className="flex items-center gap-3 pb-2 border-b border-border/40">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-md text-white ${iconBgClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold leading-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
            {description}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
