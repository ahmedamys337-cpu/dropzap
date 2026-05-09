import type { Metadata } from "next";
import Link from "next/link";
import { howToPages, PLATFORM_INFO } from "@/lib/how-to-pages-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Zap, ArrowRight } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "How-To Guides — Download Videos, Photos & More from Any Platform",
  description:
    "Step-by-step guides for downloading from Instagram, TikTok, Reddit, Twitter, Facebook, and Pinterest. Specific solutions for specific problems.",
  alternates: { canonical: `${SITE_URL}/how-to` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/how-to`,
    title: "DropZap How-To Guides",
    description:
      "Specific step-by-step guides for downloading from every major social platform.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

// Group pages by platform for the index — easier scanning than a
// flat list of 19 entries. Order matches the order entries appear
// in the data file (Instagram first, Pinterest last).
function groupByPlatform() {
  const groups: Record<string, typeof howToPages> = {};
  for (const page of howToPages) {
    if (!groups[page.platform]) groups[page.platform] = [];
    groups[page.platform].push(page);
  }
  return groups;
}

export default function HowToIndexPage() {
  const groups = groupByPlatform();
  const platformOrder: (keyof typeof PLATFORM_INFO)[] = [
    "instagram",
    "tiktok",
    "reddit",
    "twitter",
    "facebook",
    "pinterest",
  ];

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
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
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "How-To Guides" },
        ]}
        className="max-w-4xl"
      />

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          How-To Guides
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Specific step-by-step guides for specific download problems.
          Pick the platform you need.
        </p>

        {platformOrder.map((platformKey) => {
          const pages = groups[platformKey];
          if (!pages || pages.length === 0) return null;
          const info = PLATFORM_INFO[platformKey];
          return (
            <div key={platformKey} className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-2xl font-bold">{info.name}</h2>
                <Link
                  href={info.toolPath}
                  className="text-sm text-purple-400 hover:underline inline-flex items-center gap-1"
                >
                  Open the {info.name} tool <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/how-to/${page.slug}`}
                    className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all"
                  >
                    <div className="font-semibold text-foreground mb-1 line-clamp-2">
                      {page.title}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {page.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
