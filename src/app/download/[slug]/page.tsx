import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { programmaticPages } from "@/lib/programmatic-seo";
import AdBanner from "@/components/AdBanner";
import { Zap, ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return programmaticPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = programmaticPages.find((p) => p.slug === params.slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `${SITE_URL}/download/${page.slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/download/${page.slug}`,
      title: page.title,
      description: page.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default function ProgrammaticPage({ params }: Props) {
  const page = programmaticPages.find((p) => p.slug === params.slug);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${SITE_URL}/download/${page.slug}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
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
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          {page.h1}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{page.description}</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-4">
        <Link
          href={page.platformSlug}
          className="block glass rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group"
        >
          <p className="font-bold text-lg mb-2">Open {page.platform} Downloader</p>
          <p className="text-sm text-muted-foreground mb-4">
            Paste your {page.platform} URL and download instantly
          </p>
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg group-hover:opacity-90 transition-opacity">
            Go to {page.platform} Downloader
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <AdBanner slot="top" className="max-w-3xl mx-auto px-4 my-4" />

      <article className="max-w-3xl mx-auto px-4 py-8">
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-li:text-muted-foreground
            prose-strong:text-foreground
          "
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </article>

      <AdBanner slot="bottom" className="max-w-3xl mx-auto px-4 mb-8" />

      <footer className="py-10 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs text-muted-foreground">
            <Link href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</Link>
            <Link href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram</Link>
            <Link href="/twitter-video-downloader" className="hover:text-foreground transition-colors">Twitter/X</Link>
            <Link href="/facebook-video-downloader" className="hover:text-foreground transition-colors">Facebook</Link>
            <Link href="/reddit-video-downloader" className="hover:text-foreground transition-colors">Reddit</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
