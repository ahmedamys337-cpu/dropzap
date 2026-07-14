import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  howToPages,
  PLATFORM_INFO,
  type HowToPage,
} from "@/lib/how-to-pages-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return howToPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const page = howToPages.find((p) => p.slug === params.slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `${SITE_URL}/how-to/${page.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/how-to/${page.slug}`,
      title: page.title,
      description: page.description,
      modifiedTime: page.dateModified,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

// Pick 3 related how-to pages for the "Read next" rail. Prefers
// pages targeting the same platform (more topically relevant) and
// falls back to other platforms only if not enough same-platform
// pages exist.
function pickRelated(current: HowToPage): HowToPage[] {
  const samePlat = howToPages.filter(
    (p) => p.slug !== current.slug && p.platform === current.platform,
  );
  const otherPlat = howToPages.filter(
    (p) => p.slug !== current.slug && p.platform !== current.platform,
  );
  return [...samePlat, ...otherPlat].slice(0, 3);
}

export default function HowToPage({ params }: Props) {
  const page = howToPages.find((p) => p.slug === params.slug);
  if (!page) notFound();

  const url = `${SITE_URL}/how-to/${page.slug}`;
  const platform = PLATFORM_INFO[page.platform];
  const related = pickRelated(page);

  // Compose the @graph: Article + HowTo + FAQPage + BreadcrumbList.
  // Each schema is a separate citable entity for AI / answer engines.
  // The HowTo block is the highest-leverage one for these long-tail
  // queries because Google's "How to" rich results sometimes still
  // show in mobile SERPs even after the broader rich-result removal.
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: page.title,
      description: page.description,
      abstract: page.quickAnswer,
      url,
      datePublished: page.dateModified,
      dateModified: page.dateModified,
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
      keywords: page.keywords.join(", "),
      about: {
        "@type": "Thing",
        name: platform.name,
      },
    },
    {
      "@type": "HowTo",
      name: page.title,
      description: page.quickAnswer,
      totalTime: "PT1M",
      tool: { "@type": "HowToTool", name: "DropZap" },
      step: page.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "How-To Guides",
          item: `${SITE_URL}/how-to`,
        },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
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
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href={platform.toolPath}
              className="hover:text-foreground transition-colors"
            >
              {platform.name} Tool
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
          { label: "How-To Guides", href: "/how-to" },
          { label: page.title },
        ]}
        className="max-w-4xl"
      />

      <article className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
            {platform.name}
          </span>
          <span className="text-xs text-muted-foreground">How-To Guide</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          {page.title}
        </h1>

        {/* Author + last-reviewed line — same E-E-A-T pattern as the
           blog template. Visible date and Person-typed author both
           feed Google's Helpful Content signals. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
          <span className="inline-flex items-center gap-1">
            By{" "}
            <a
              href="/about"
              className="font-semibold text-foreground hover:underline"
            >
              DropZap Editorial Team
            </a>
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Last reviewed{" "}
            <time
              dateTime={page.dateModified}
              className="font-medium text-foreground"
            >
              {new Date(page.dateModified).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </span>
        </div>

        {/* TL;DR callout — first-class LLM citation surface. Same
           text fed to Article.abstract in JSON-LD. */}
        <aside
          className="mb-8 rounded-2xl border-l-4 border-purple-500 bg-purple-500/10 p-5"
          aria-label="Quick answer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">
            TL;DR — Quick Answer
          </div>
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            {page.quickAnswer}
          </p>
        </aside>

        <div className="prose prose-invert prose-lg max-w-none mt-8 prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground prose-strong:text-foreground">
          {page.intro.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <h2>Step-by-step instructions</h2>
          <ol>
            {page.steps.map((step, i) => (
              <li key={i}>
                <strong>{step.name}.</strong> {step.text}
              </li>
            ))}
          </ol>

          {/* Inline CTA to the matching tool page. Internal-link
             concentration to the actual conversion surface is one of
             the few SEO levers we have on a thin programmatic page —
             a clear primary CTA above the fold of the article body. */}
          <div className="not-prose my-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-600/10 to-pink-500/10 p-6 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-2">
              Ready to download?
            </div>
            <Link
              href={platform.toolPath}
              className="inline-flex items-center gap-2 text-lg font-bold text-foreground hover:text-purple-400 transition-colors"
            >
              Open the {platform.name} downloader
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <h2>About {platform.name} downloads</h2>
          <p>{platform.quality}</p>

          <h2>Frequently asked questions</h2>
          {page.faqs.map((faq, i) => (
            <div key={i}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}

          <h2>Is it legal to download {platform.name} content?</h2>
          <p>{platform.legal}</p>
        </div>

        {/* Related how-to rail. Same-platform first, then other
           platforms. Three is the sweet spot — enough internal
           link weight to matter, few enough that users actually
           click through rather than scroll past. */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Read next</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/how-to/${r.slug}`}
                  className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all"
                >
                  <div className="text-xs font-semibold text-purple-400 mb-1.5 uppercase tracking-wide">
                    {PLATFORM_INFO[r.platform].name}
                  </div>
                  <div className="font-semibold text-foreground line-clamp-2">
                    {r.title}
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
