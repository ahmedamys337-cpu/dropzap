import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devicePages, findDevicePage } from "@/lib/device-pages-data";
import DevicePageTemplate from "@/components/DevicePageTemplate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const PARENT = "/reddit-video-downloader";

interface Props {
  // Reddit's variants are use-cases ("with-sound") rather than devices,
  // so the dynamic segment is named accordingly. Internally it still
  // maps to a `slug` field on DevicePage.
  params: { useCase: string };
}

export function generateStaticParams() {
  return (devicePages[PARENT] ?? []).map((p) => ({ useCase: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findDevicePage(PARENT, params.useCase);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `${SITE_URL}${PARENT}/${page.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}${PARENT}/${page.slug}`,
      title: page.metaTitle,
      description: page.metaDescription,
      modifiedTime: page.dateModified,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default function RedditUseCasePage({ params }: Props) {
  const page = findDevicePage(PARENT, params.useCase);
  if (!page) notFound();
  return <DevicePageTemplate page={page} />;
}
