import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import AdBanner from "@/components/AdBanner";
import { Zap, ArrowLeft } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "DropZap" },
    publisher: {
      "@type": "Organization",
      name: "DropZap",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{post.readTime}</span>
          <time className="text-xs text-muted-foreground" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
          {post.title}
        </h1>

        <AdBanner slot="top" />

        <div
          className="prose prose-invert prose-lg max-w-none mt-8
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-10">
          <AdBanner slot="bottom" />
        </div>

        <div className="mt-10 glass rounded-xl p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Ready to start downloading?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try DropZap — the fastest free video downloader for all platforms.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Open DropZap
          </Link>
        </div>
      </article>

      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
