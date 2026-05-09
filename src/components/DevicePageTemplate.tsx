import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import { Zap, ArrowRight } from "lucide-react";
import type { DevicePage } from "@/lib/device-pages-data";
import { blogPosts } from "@/lib/blog-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

// Shared layout for the 5 device-specific landing pages.
//
// Centralizing the markup here means a single visual change (header,
// breadcrumb, FAQ rendering, etc.) cascades to every device page.
// Each route file is tiny — it just resolves which DevicePage data
// to feed in via generateStaticParams + generateMetadata.

export default function DevicePageTemplate({
  page,
}: {
  page: DevicePage;
}) {
  const url = `${SITE_URL}${page.toolPath}/${page.slug}`;

  // BreadcrumbList + HowTo + FAQPage emitted as a single @graph so
  // Google parses them together. Article schema is intentionally
  // omitted (these are landing pages, not articles).
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
          {
            "@type": "ListItem",
            position: 2,
            name: page.toolName,
            item: `${SITE_URL}${page.toolPath}`,
          },
          { "@type": "ListItem", position: 3, name: page.variantLabel, item: url },
        ],
      },
      {
        "@type": "HowTo",
        name: page.h1,
        description: page.intro,
        step: page.howToSteps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

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
              <Link href={page.toolPath} className="hover:text-foreground transition-colors">{page.toolName}</Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: page.toolName, href: page.toolPath },
          { label: page.variantLabel },
        ]}
      />

      <section className="max-w-4xl mx-auto px-4 pt-6 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{page.h1}</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {page.intro}
        </p>
        <div className="mt-6">
          <Link
            href={page.toolPath}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Open the {page.toolName}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pt-2">
        <AdBanner slot="top" />
      </div>

      {/* Long-form sections */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-10
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
          prose-li:text-muted-foreground
          prose-strong:text-foreground
          prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        ">
          {page.sections.map((sec) => (
            <section key={sec.heading}>
              <h2>{sec.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: sec.html }} />
            </section>
          ))}
        </div>
      </article>

      {/* HowTo step cards */}
      <section className="max-w-3xl mx-auto px-4 py-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Quick Reference: Step-by-Step
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
            Open the {page.toolName}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12" aria-labelledby="device-faq-heading">
        <h2 id="device-faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
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
