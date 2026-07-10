import type { Metadata } from "next";
import Link from "next/link";
import { decodeShortUrl } from "@/lib/url-shortener";
import { Zap, Download, ExternalLink } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const url = decodeShortUrl(params.id);
  return {
    title: url ? "Download shared video with DropZap" : "Link not found — DropZap",
    description: url
      ? "A video was shared with you. Download it for free with DropZap — no watermark, no signup."
      : "This DropZap short link is invalid or has expired.",
    alternates: { canonical: `${SITE_URL}/d/${params.id}` },
  };
}

export default function ShortLinkPreviewPage({ params }: { params: { id: string } }) {
  const url = decodeShortUrl(params.id);
  const invalid = !url;

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-4 pt-16 pb-8">
        <div className="glass rounded-2xl p-8 text-center">
          {invalid ? (
            <>
              <h1 className="text-2xl font-bold mb-3">Invalid DropZap link</h1>
              <p className="text-muted-foreground mb-6">
                This short link could not be decoded. The sender may have shared a broken link.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
              >
                <Zap className="h-4 w-4 fill-white" />
                Go to DropZap
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-3">Someone shared a video with you</h1>
              <p className="text-muted-foreground mb-6">
                Click below to download it for free. No watermark, no signup, no daily limit.
              </p>

              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground break-all mb-6 text-left">
                {url}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`/?url=${encodeURIComponent(url)}`}
                  className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
                >
                  <Download className="h-5 w-5" />
                  Download with DropZap
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold border-2 border-purple-500/50 hover:bg-purple-500/10 transition-colors"
                >
                  View Original
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
