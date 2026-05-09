import Link from "next/link";
import {
  Zap,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  FolderDown,
  AlertTriangle,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import type { MobilePageData } from "@/lib/mobile-pages-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  data: MobilePageData;
}

// Single template that powers /iphone-video-downloader and
// /android-video-downloader. The two pages are visually identical
// — every difference is data-driven from MobilePageData.
//
// Schema strategy:
//   - SoftwareApplication with operatingSystem set to "iOS" or
//     "Android" so Google's Knowledge Graph treats DropZap as a
//     first-class tool for that OS family.
//   - HowTo for the step-by-step (eligible for "How to" rich result).
//   - FAQPage for the FAQ block (eligible for FAQ rich snippet on
//     informational queries — note: Google now restricts FAQ rich
//     results to authority sites and government/health, but the
//     schema is still parsed by AI Overviews and Bing).
//   - BreadcrumbList for SERP breadcrumb display.
export default function MobileLandingPage({ data }: Props) {
  const url = `${SITE_URL}/${data.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": url,
      name: `DropZap — ${data.deviceLabel} Video Downloader`,
      description: data.metaDescription,
      url,
      applicationCategory: "MultimediaApplication",
      operatingSystem: data.operatingSystem,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1247",
      },
      featureList: data.platformLinks.map((p) => p.label).join(", "),
      browserRequirements: "Requires JavaScript and a modern browser",
    },
    {
      "@type": "HowTo",
      name: data.h1,
      description: data.quickAnswer,
      totalTime: "PT1M",
      tool: [
        { "@type": "HowToTool", name: data.deviceLabel },
        { "@type": "HowToTool", name: "Web browser" },
      ],
      step: data.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
        url: `${url}#step-${i + 1}`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: data.faq.map((f) => ({
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
          name: `${data.deviceLabel} Video Downloader`,
          item: url,
        },
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
          { label: `${data.deviceLabel} Video Downloader` },
        ]}
        className="max-w-5xl"
      />

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
            {data.deviceLabel} · {data.operatingSystem}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
          {data.h1}
        </h1>

        {/* TL;DR — mirrors the SoftwareApplication.description and
           HowTo.description in JSON-LD so the LLM citation surface
           matches the on-page text exactly. */}
        <aside
          className="mb-8 rounded-2xl border-l-4 border-purple-500 bg-purple-500/10 p-5"
          aria-label="Quick answer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">
            TL;DR
          </div>
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            {data.quickAnswer}
          </p>
        </aside>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity mb-10"
        >
          Open DropZap and paste a link
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
          {data.intro.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="my-10">
          <AdBanner slot="top" />
        </div>

        {/* Where files go — answers the #1 mobile FAQ as a dedicated
           highlighted section so it can win the featured snippet. */}
        <section className="my-10 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FolderDown className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold m-0">{data.whereFilesGo.heading}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed m-0">
            {data.whereFilesGo.body}
          </p>
        </section>

        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">
            Step-by-step on {data.deviceLabel}
          </h2>
          <ol className="space-y-4">
            {data.steps.map((step, i) => (
              <li
                key={i}
                id={`step-${i + 1}`}
                className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground mb-1">
                    {step.name}
                  </div>
                  <div className="text-muted-foreground leading-relaxed">
                    {step.text}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="my-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <h2 className="text-3xl font-bold m-0">
              {data.deviceLabel}-specific quirks worth knowing
            </h2>
          </div>
          <div className="space-y-4">
            {data.quirks.map((q, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20"
              >
                <div className="font-bold text-lg text-foreground mb-2">
                  {q.title}
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  {q.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">
            Per-platform downloaders for {data.deviceLabel}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.platformLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {link.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {link.blurb}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="my-10">
          <AdBanner slot="middle" />
        </div>

        <section className="my-12">
          <h2 className="text-3xl font-bold mb-6">Frequently asked questions</h2>
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
      </section>
    </main>
  );
}
