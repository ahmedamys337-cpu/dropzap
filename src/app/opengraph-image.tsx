import { ImageResponse } from "next/og";

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
            fontSize: 30,
            color: "#e4e4e7",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Download videos from{" "}
          <span style={{ color: "#ef4444" }}>YouTube</span>,{" "}
          <span style={{ color: "#ec4899" }}>Instagram</span>,{" "}
          <span style={{ color: "#06b6d4" }}>TikTok</span> &{" "}
          <span style={{ color: "#ffffff" }}>Twitter/X</span>
        </p>

        {/* Badges */}
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {["100% Free", "No Watermark", "No Signup", "HD Quality"].map((badge) => (
            <div
              key={badge}
              style={{
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
