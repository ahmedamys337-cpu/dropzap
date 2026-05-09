import type { Metadata } from "next";
import Link from "next/link";
import { glossaryEntries } from "@/lib/glossary-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap, BookOpen } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Glossary — Video, Streaming, and Downloader Terms Explained",
  description:
    "Plain-English definitions of the technical terms behind video downloading: MP4, H.264, DASH, HLS, FFmpeg, bitrate, watermarks, and more.",
  alternates: { canonical: `${SITE_URL}/glossary` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/glossary`,
    title: "DropZap Glossary",
    description:
      "Plain-English definitions of video, streaming, and downloader terms.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function GlossaryIndexPage() {
  // Sort alphabetically by term for the index. Easier to scan than
  // the data-file order, which groups by topic.
  const sorted = [...glossaryEntries].sort((a, b) =>
    a.term.localeCompare(b.term),
  );

  // DefinedTermSet schema turns the index page into a first-class
  // glossary entity. Google's Knowledge Graph and AI Overviews can
  // ingest the whole set as a coherent reference.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/glossary`,
    name: "DropZap Glossary",
    url: `${SITE_URL}/glossary`,
    description:
      "Plain-English definitions of video, streaming, and downloader terms.",
    hasDefinedTerm: sorted.map((e) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/glossary/${e.slug}`,
      name: e.term,
      description: e.shortDefinition,
      url: `${SITE_URL}/glossary/${e.slug}`,
    })),
  };

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              DropZap
            </span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/how-to"
              className="hover:text-foreground transition-colors"
            >
              How-To
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Glossary" }]}
        className="max-w-4xl"
      />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="h-7 w-7 text-purple-400" />
          <h1 className="text-4xl font-extrabold tracking-tight">Glossary</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          Plain-English definitions of the technical terms behind video
          downloading. Click any term for the full definition and context.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {sorted.map((entry) => (
            <Link
              key={entry.slug}
              href={`/glossary/${entry.slug}`}
              className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all"
            >
              <div className="font-bold text-lg text-foreground mb-1">
                {entry.term}
              </div>
              {entry.aliases && entry.aliases.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  {entry.aliases.join(" · ")}
                </div>
              )}
              <div className="text-sm text-muted-foreground line-clamp-3">
                {entry.shortDefinition}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
