import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import BlogPostView, { buildPostMetadata } from "@/components/BlogPostView";

interface Props {
  params: { path: string[] };
}

function findPost(path: string[]) {
  if (path.length === 1) {
    // Legacy English-only route: /blog/[slug]
    return blogPosts.find((p) => !p.lang && p.slug === path[0]);
  }
  if (path.length === 2) {
    // Multilingual route: /blog/[lang]/[slug]
    return blogPosts.find((p) => p.lang === path[0] && p.slug === path[1]);
  }
  return undefined;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    path: post.lang ? [post.lang, post.slug] : [post.slug],
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost(params.path);
  if (!post) return {};
  const lang = post.lang ?? (params.path.length === 2 ? params.path[0] : undefined);
  return buildPostMetadata(post, lang);
}

export default function BlogPostPage({ params }: Props) {
  const post = findPost(params.path);
  if (!post) notFound();
  const lang = post.lang ?? (params.path.length === 2 ? params.path[0] : undefined);
  return <BlogPostView post={post} lang={lang} />;
}
