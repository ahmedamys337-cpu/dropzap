import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternativePages } from "@/lib/alternatives-data";
import { blogPosts } from "@/lib/blog-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import { Zap, ArrowRight, Check, X } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return alternativePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = alternativePages.find((p) => p.slug === params.slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `${SITE_URL}/alternatives/${page.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/alternatives/${page.slug}`,
      title: page.metaTitle,
      description: page.metaDescription,
      modifiedTime: page.dateModified,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription },
  };
}

export default function AlternativePage({ params }: Props) {
  const page = alternativePages.find((p) => p.slug === params.slug);
  if (!page) notFound();

  const url = `${SITE_URL}/alternatives/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: page.metaTitle,
        description: page.metaDescription,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        dateModified: page.dateModified,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Alternatives", item: `${SITE_URL}/alternatives` },
          { "@type": "ListItem", position: 3, name: `${page.competitor} Alternative`, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "HowTo",
        name: `How to use DropZap as a ${page.competitor} alternative`,
        description: `Download ${page.primaryPlatform} content with DropZap in 3 steps.`,
        step: page.howToSteps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
    ],
  };

  // Resolve related blog post objects (skip any that don't exist).
  const related = page.relatedBlogPosts
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof blogPosts;

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="DropZap home">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              DropZap
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href={page.toolPath} className="hover:text-foreground transition-colors">{page.primaryPlatform}</Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `${page.competitor} Alternative` },
        ]}
      />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-6 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          {page.h1}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {page.intro}
        </p>
        <div className="mt-6">
          <Link
            href={page.toolPath}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Try DropZap&apos;s {page.primaryPlatform} Downloader
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pt-2">
        <AdBanner slot="top" />
      </div>

      {/* Side-by-side comparison table */}
      <section className="max-w-4xl mx-auto px-4 py-12" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          {page.competitor} vs DropZap — Feature Comparison
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-bold text-foreground w-2/5">Feature</th>
                <th scope="col" className="px-4 py-3 text-left font-bold text-foreground">{page.competitor}</th>
                <th scope="col" className="px-4 py-3 text-left font-bold text-foreground">DropZap</th>
              </tr>
            </thead>
            <tbody>
              {page.comparison.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-transparent" : "bg-foreground/[0.02]"}
                >
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground align-top">
                    {row.feature}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground align-top">
                    {row.highlight === "tie" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        {row.competitor}
                      </span>
                    ) : (
                      row.competitor
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium align-top">
                    <span className="inline-flex items-center gap-1.5">
                      {row.highlight !== "lose" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                      )}
                      {row.dropzap}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why users switch */}
      <section className="max-w-3xl mx-auto px-4 py-12" aria-labelledby="why-switch-heading">
        <h2 id="why-switch-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Why Users Switch from {page.competitor} to DropZap
        </h2>
        <ul className="space-y-4">
          {page.whySwitch.map((reason, i) => (
            <li key={i} className="glass rounded-xl p-5 flex gap-3">
              <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-muted-foreground leading-relaxed">{reason}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How to */}
      <section className="max-w-3xl mx-auto px-4 py-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          How to Use DropZap Instead of {page.competitor}
        </h2>
        <ol className="space-y-4">
          {page.howToSteps.map((step, i) => (
            <li key={i} className="glass rounded-xl p-5">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Step {i + 1}
              </div>
              <h3 className="font-bold mt-1 mb-2 text-foreground">{step.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <Link
            href={page.toolPath}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Open DropZap&apos;s {page.primaryPlatform} Downloader
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12" aria-labelledby="alt-faq-heading">
        <h2 id="alt-faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {page.faq.map((item, i) => (
            <details key={i} className="glass rounded-xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related blog posts */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Read More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="glass rounded-xl p-5 hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
                  {r.category}
                </span>
                <h3 className="font-bold mt-2 mb-1 text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-6">
        <AdBanner slot="bottom" />
      </div>

      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
