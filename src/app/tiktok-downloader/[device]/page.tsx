import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devicePages, findDevicePage } from "@/lib/device-pages-data";
import DevicePageTemplate from "@/components/DevicePageTemplate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const PARENT = "/tiktok-downloader";

interface Props {
  params: { device: string };
}

export function generateStaticParams() {
  return (devicePages[PARENT] ?? []).map((p) => ({ device: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findDevicePage(PARENT, params.device);
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

export default function TikTokDevicePage({ params }: Props) {
  const page = findDevicePage(PARENT, params.device);
  if (!page) notFound();
  return <DevicePageTemplate page={page} />;
}
