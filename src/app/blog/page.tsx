import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, blogCategories } from "@/lib/blog-data";
import { Zap } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Blog — Video Downloading Tips, Guides & Tutorials",
  description: "Learn how to download videos from YouTube, TikTok, Instagram, Twitter & more. Tips, guides, and tutorials from DropZap.",
  keywords: ["video downloader blog", "download guide", "youtube downloader tips", "tiktok download guide"],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "DropZap Blog — Video Downloading Guides & Tips",
    description: "Expert guides on downloading videos from YouTube, TikTok, Instagram, Twitter, Facebook & Reddit.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "rss": `${SITE_URL}/feed.xml`,
  },
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                DropZap
              </span>
              <p className="text-[11px] text-muted-foreground leading-tight font-medium">Blog</p>
            </div>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/youtube-downloader" className="hover:text-foreground transition-colors">YouTube</Link>
            <Link href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            DropZap Blog
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Guides, tips, and tutorials for downloading videos from every platform.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-8">
          {blogCategories.map((cat) => (
            <span
              key={cat}
              className="text-xs font-semibold px-3 py-1 rounded-full glass text-muted-foreground"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.lang ? `${post.lang}/${post.slug}` : post.slug}
              href={post.lang ? `/blog/${post.lang}/${post.slug}` : `/blog/${post.slug}`}
              className="block glass rounded-xl p-5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h2 className="font-bold text-lg group-hover:text-purple-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {post.description}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 py-10 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
