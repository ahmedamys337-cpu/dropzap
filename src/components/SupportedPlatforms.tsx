import Link from "next/link";

// "All Platforms Supported by DropZap" section — renders as a real
// <table> rather than a CSS grid because:
//   1. AI/answer engines (Perplexity, ChatGPT Search, Google AI
//      Overviews) parse <table> structurally and can quote rows
//      verbatim. CSS grids without semantic markup are usually
//      flattened or skipped.
//   2. Screen readers announce columns/rows correctly with proper
//      <thead>/<tbody>/<th scope> markup.
//   3. The two-column "Platform | Downloads available" structure is
//      genuinely tabular data, so the semantic match is correct.
//
// Each platform name links to its dedicated tool page so this section
// also functions as an internal-link hub (good for SEO PageRank flow).

interface Row {
  platform: string;
  href?: string; // omit for non-page items like "MP3 Converter"
  downloads: string;
}

const rows: Row[] = [
  { platform: "Instagram", href: "/instagram-downloader", downloads: "Reels (MP4), Photos (JPG), Carousels (ZIP)" },
  { platform: "TikTok", href: "/tiktok-downloader", downloads: "Videos without watermark (MP4)" },
  { platform: "TikTok to MP3", href: "/tiktok-to-mp3", downloads: "TikTok video audio → MP3" },
  { platform: "Twitter / X", href: "/twitter-video-downloader", downloads: "Videos (MP4), GIFs (MP4)" },
  { platform: "Facebook", href: "/facebook-video-downloader", downloads: "Videos (MP4), Reels (MP4), Photos (JPG), Albums (ZIP)" },
  { platform: "Reddit", href: "/reddit-video-downloader", downloads: "Videos with sound (MP4)" },
  { platform: "Pinterest", downloads: "Images (JPG), Videos (MP4)" },
  { platform: "Threads", downloads: "Videos (MP4), Images (JPG)" },
  { platform: "YouTube Thumbnails", downloads: "All sizes (JPG)" },
  { platform: "MP3 Converter", href: "/mp3-converter", downloads: "Any video file → MP3" },
];

export default function SupportedPlatforms() {
  return (
    <section
      className="max-w-4xl mx-auto px-4 py-12"
      aria-labelledby="platforms-heading"
    >
      <h2 id="platforms-heading" className="text-2xl sm:text-3xl font-bold text-center mb-2">
        All Platforms Supported by DropZap
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 max-w-2xl mx-auto">
        Every download type DropZap can produce, in one place. Click a platform to open its dedicated tool.
      </p>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left font-bold text-foreground w-1/3"
              >
                Platform
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-bold text-foreground"
              >
                Downloads Available
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.platform}
                className={i % 2 === 0 ? "bg-transparent" : "bg-foreground/[0.02]"}
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-semibold text-foreground align-top"
                >
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="text-purple-400 hover:underline"
                    >
                      {row.platform}
                    </Link>
                  ) : (
                    row.platform
                  )}
                </th>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {row.downloads}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
