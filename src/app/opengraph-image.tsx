import { ImageResponse } from "next/og";

// Edge runtime is required: on Node runtime, @vercel/og fails at build
// time inside `next build` (TypeError: Invalid URL when fileURLToPath()'s
// a font binary). The 5xx Google flagged in Search Console for this route
// was almost certainly a Render free-tier cold-start (instances spin
// down after ~15 min idle and the first request times out). Upgrading
// the Render plan or warming the route via an external pinger fixes
// that without changing the runtime.
export const runtime = "edge";
export const alt = "DropZap — Free Media Downloader";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a1a 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Icon + Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg, #3b82f6, #7c3aed, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Lightning bolt */}
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
              <path d="M17 6L9 18h6l-2 8 10-12h-6l2-8z" fill="white" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                background: "linear-gradient(90deg, #3b82f6, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                lineHeight: 1,
                letterSpacing: "-2px",
              }}
            >
              DropZap
            </span>
            <span style={{ fontSize: 22, color: "#a1a1aa", marginTop: 4, letterSpacing: 2 }}>
              MEDIA DOWNLOADER
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#e4e4e7",
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.4,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 14px",
          }}
        >
          <span>Download videos from</span>
          <span style={{ color: "#ef4444", fontWeight: 700 }}>YouTube</span>
          <span style={{ color: "#ec4899", fontWeight: 700 }}>Instagram</span>
          <span style={{ color: "#06b6d4", fontWeight: 700 }}>TikTok</span>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>Twitter/X</span>
          <span style={{ color: "#3b82f6", fontWeight: 700 }}>Facebook</span>
          <span style={{ color: "#f97316", fontWeight: 700 }}>Reddit</span>
        </p>

        {/* Badges */}
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {["100% Free", "No Watermark", "No Signup", "HD Quality"].map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 99,
                padding: "8px 20px",
                fontSize: 18,
                color: "#d4d4d8",
              }}
            >
              ✓ {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
