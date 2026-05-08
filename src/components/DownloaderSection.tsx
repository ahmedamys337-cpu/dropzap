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
  borderLeftAccentClassName,
  hoverShadowClassName,
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
  /**
   * Optional thick (4px) accent stripe down the card's left edge. Use a
   * border-l-4 + border-l-<color> class string. Lets sibling cards on
   * the same page (e.g. IG Reel vs Photos) be color-coded at a glance.
   */
  borderLeftAccentClassName?: string;
  /**
   * Optional hover shadow color class (e.g. "hover:shadow-indigo-500/30").
   * Falls back to a neutral hover shadow when omitted.
   */
  hoverShadowClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={[
        "group rounded-xl border bg-foreground/[0.02] p-5 space-y-4",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        hoverShadowClassName ?? "hover:shadow-foreground/10",
        borderColorClassName,
        borderLeftAccentClassName ?? "",
      ].join(" ")}
    >
      <header className="flex items-center gap-3 pb-2 border-b border-border/40">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-md text-white transition-transform duration-300 group-hover:scale-110 ${iconBgClassName}`}
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
