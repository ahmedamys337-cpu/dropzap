import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { glossaryEntries, type GlossaryEntry } from "@/lib/glossary-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return glossaryEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const entry = glossaryEntries.find((e) => e.slug === params.slug);
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords,
    alternates: { canonical: `${SITE_URL}/glossary/${entry.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/glossary/${entry.slug}`,
      title: entry.title,
      description: entry.description,
      modifiedTime: entry.dateModified,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
  };
}

function relatedEntries(current: GlossaryEntry): GlossaryEntry[] {
  return current.related
    .map((slug) => glossaryEntries.find((e) => e.slug === slug))
    .filter(Boolean) as GlossaryEntry[];
}

export default function GlossaryEntryPage({ params }: Props) {
  const entry = glossaryEntries.find((e) => e.slug === params.slug);
  if (!entry) notFound();

  const url = `${SITE_URL}/glossary/${entry.slug}`;
  const related = relatedEntries(entry);

  // @graph: DefinedTerm + DefinedTermSet (parent glossary), Article
  // (so the page is also citable as long-form content), and
  // BreadcrumbList. DefinedTerm is the highest-leverage schema for
  // glossary content — Google's Knowledge Graph and AI Overviews
  // both treat it as a first-class definition source.
  const graph: Record<string, unknown>[] = [
    {
      "@type": "DefinedTerm",
      "@id": url,
      name: entry.term,
      ...(entry.aliases ? { alternateName: entry.aliases } : {}),
      description: entry.shortDefinition,
      url,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        "@id": `${SITE_URL}/glossary`,
        name: "DropZap Glossary",
        url: `${SITE_URL}/glossary`,
      },
    },
    {
      "@type": "Article",
      headline: entry.title,
      description: entry.description,
      abstract: entry.shortDefinition,
      url,
      datePublished: entry.dateModified,
      dateModified: entry.dateModified,
      author: {
        "@type": "Person",
        name: "DropZap Editorial Team",
        url: `${SITE_URL}/about`,
      },
      publisher: {
        "@type": "Organization",
        name: "DropZap",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon-512.png`,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: `${SITE_URL}/opengraph-image`,
      keywords: entry.keywords.join(", "),
      about: { "@type": "DefinedTerm", name: entry.term },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Glossary",
          item: `${SITE_URL}/glossary`,
        },
        { "@type": "ListItem", position: 3, name: entry.term, item: url },
      ],
    },
  ];

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

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
              href="/glossary"
              className="hover:text-foreground transition-colors"
            >
              Glossary
            </Link>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Glossary", href: "/glossary" },
          { label: entry.term },
        ]}
        className="max-w-4xl"
      />

      <article className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href="/glossary"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to glossary
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
            Glossary
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {entry.term}
        </h1>
        {entry.aliases && entry.aliases.length > 0 && (
          <div className="text-sm text-muted-foreground mb-6">
            Also known as:{" "}
            <span className="text-foreground">{entry.aliases.join(", ")}</span>
          </div>
        )}

        {/* The canonical 1-2 sentence definition. This is the LLM
           citation surface — it mirrors the DefinedTerm.description
           in JSON-LD so on-page text and structured data agree. */}
        <aside
          className="mb-8 rounded-2xl border-l-4 border-purple-500 bg-purple-500/10 p-5"
          aria-label="Definition"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">
            Definition
          </div>
          <p className="text-base sm:text-lg text-foreground leading-relaxed font-medium">
            {entry.shortDefinition}
          </p>
        </aside>

        <div className="prose prose-invert prose-lg max-w-none mt-8 prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
          {entry.longDefinition.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {entry.relatedTool && (
          <div className="not-prose my-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-600/10 to-pink-500/10 p-6 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-2">
              Try it for yourself
            </div>
            <Link
              href={entry.relatedTool.href}
              className="inline-flex items-center gap-2 text-lg font-bold text-foreground hover:text-purple-400 transition-colors"
            >
              {entry.relatedTool.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related terms</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/glossary/${r.slug}`}
                  className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all"
                >
                  <div className="font-semibold text-foreground mb-1">
                    {r.term}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {r.shortDefinition}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
