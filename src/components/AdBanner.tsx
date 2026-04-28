"use client";

interface AdBannerProps {
  slot: "top" | "middle" | "bottom" | "sidebar";
  className?: string;
}

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  // Ad sizes per slot
  const sizes: Record<string, { width: string; height: string }> = {
    top: { width: "728px", height: "90px" },       // Leaderboard
    middle: { width: "100%", height: "250px" },     // Medium Rectangle
    bottom: { width: "728px", height: "90px" },     // Leaderboard
    sidebar: { width: "300px", height: "250px" },   // Medium Rectangle
  };

  const size = sizes[slot] || sizes.middle;

  return (
    <div
      className={`flex items-center justify-center mx-auto ${className}`}
      style={{ maxWidth: size.width, minHeight: size.height }}
    >
      {/*
        === REPLACE THIS WITH YOUR ACTUAL AD CODE ===

        For Adsterra:
        <script async src="//www.highperformanceformat.com/YOUR_ID"></script>

        For Google AdSense:
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true" />

        For PropellerAds:
        Paste the script they give you here
      */}
      <div
        id={`ad-${slot}`}
        className="w-full h-full rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center"
        style={{ minHeight: size.height }}
      >
        <span className="text-xs text-muted-foreground">Advertisement</span>
      </div>
    </div>
  );
}
