import Link from "next/link";
import type { YearPageData } from "@/lib/year-pages-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  Zap,
  Trophy,
  Star,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  data: YearPageData;
}

// Reusable template that powers all five year-specific listing
// pages (/best-tiktok-downloader-2026, etc.). Each top-level page
// is a 30-line file that imports its data and renders this.
//
// Schema: Article + ItemList + FAQPage + BreadcrumbList in a single
// @graph. The ItemList is the headline schema — eligible for
// Google's "list" rich result and the format AI Overviews ingest
// when answering "best X tools" queries.

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full;
        const half = !filled && i === full && hasHalf;
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-muted-foreground"
            }`}
          />
        );
      })}
      <span className="ml-1 text-sm font-semibold text-foreground">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function YearPageTemplate({ data }: Props) {
  const url = `${SITE_URL}/${data.slug}`;

  const itemList = {
    "@type": "ItemList",
    "@id": url,
    name: data.h1,
    description: data.quickAnswer,
    numberOfItems: data.ranked.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: data.ranked.map((tool) => ({
      "@type": "ListItem",
      position: tool.rank,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        url: tool.href.startsWith("http")
          ? tool.href
          : `${SITE_URL}${tool.href}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web, iOS, Android, Windows, macOS",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    })),
  };

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: data.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `Best ${data.platformName} Downloader ${data.year}`,
        item: url,
      },
    ],
  };

  const article = {
    "@type": "Article",
    headline: data.h1,
    description: data.metaDescription,
    abstract: data.quickAnswer,
    url,
    datePublished: `${data.year}-01-01`,
    dateModified: data.dateModified,
    author: {
      "@type": "Organization",
      name: "DropZap Editorial Team",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "DropZap",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE_URL}/opengraph-image`,
    keywords: data.keywords.join(", "),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [article, itemList, faqPage, breadcrumbs],
  };

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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
        items={[
          { label: "Home", href: "/" },
          { label: `Best ${data.platformName} Downloader ${data.year}` },
        ]}
        className="max-w-5xl"
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            Updated for {data.year}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
          {data.h1}
        </h1>

        <aside
          className="mb-8 rounded-2xl border-l-4 border-purple-500 bg-purple-500/10 p-5"
          aria-label="Quick answer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">
            TL;DR — Our pick for {data.year}
          </div>
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            {data.quickAnswer}
          </p>
        </aside>

        <div className="text-xs text-muted-foreground mb-6">
          <strong className="text-foreground">Disclosure:</strong> DropZap
          (rank #1) is our own product. Rankings reflect honest measurements
          you can replicate yourself in 30 seconds with any{" "}
          {data.platformName} URL.
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-purple-400 prose-strong:text-foreground">
          {data.intro.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2>How we tested</h2>
          <p>{data.methodology}</p>
        </div>

        <div className="my-8">
          <AdBanner slot="top" />
        </div>

        <section className="my-10 space-y-6">
          <h2 className="text-3xl font-bold">The ranking</h2>
          {data.ranked.map((tool) => {
            const isExternal = tool.href.startsWith("http");
            return (
              <div
                key={`${tool.rank}-${tool.name}`}
                className={`relative p-6 rounded-2xl border transition-all ${
                  tool.isDropZap
                    ? "bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-pink-500/15 border-purple-500/40"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {tool.isDropZap && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white text-xs font-bold">
                    Editor&apos;s Pick
                  </div>
                )}

                <div className="flex flex-wrap items-start gap-4 justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-extrabold text-lg">
                      #{tool.rank}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold m-0">{tool.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {tool.tagline}
                      </div>
                    </div>
                  </div>
                  <StarRating value={tool.rating} />
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {tool.review}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                      Pros
                    </div>
                    <ul className="space-y-1">
                      {tool.pros.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                      Cons
                    </div>
                    <ul className="space-y-1">
                      {tool.cons.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Best for:
                    </span>{" "}
                    {tool.bestFor}
                  </div>
                  {isExternal ? (
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="nofollow noopener"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Visit {tool.name}
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Try {tool.name} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="my-10 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-600/10 to-pink-500/10 border border-purple-500/20 p-6">
          <h2 className="text-2xl font-bold mb-3">Verdict</h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            {data.verdict}
          </p>
          <Link
            href={data.toolPath}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity"
          >
            Try DropZap&apos;s {data.platformName} downloader
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>

        <div className="my-8">
          <AdBanner slot="middle" />
        </div>

        <section className="my-10">
          <h2 className="text-3xl font-bold mb-5">Frequently asked questions</h2>
          <div className="space-y-3">
            {data.faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white/5 border border-white/10 p-5 open:bg-white/10"
              >
                <summary className="cursor-pointer font-bold text-foreground list-none flex items-center justify-between">
                  {f.q}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
