import type { Metadata } from "next";
import CompetitorStatusPage from "@/components/CompetitorStatusPage";
import { checkStatus } from "@/lib/competitor-status";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Is SaveFrom.net Down Right Now? — Status Check & Free Alternative",
  description:
    "Check if SaveFrom.net is down today. Live status monitor plus a clean SaveFrom alternative for Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest and Threads.",
  keywords: ["is savefrom down", "savefrom not working", "savefrom down today", "savefrom alternative", "savefrom status"],
  alternates: { canonical: `${SITE_URL}/is-savefrom-down` },
};

export const dynamic = "force-dynamic";

export default async function IsSaveFromDownPage() {
  const status = await checkStatus("https://en.savefrom.net");
  return (
    <CompetitorStatusPage
      config={{
        name: "SaveFrom.net",
        url: "https://en.savefrom.net",
        slug: "savefrom",
        headline: "SaveFrom.net is often blocked, ad-heavy, or slow.",
        description:
          "SaveFrom.net supports many sites but is frequently blocked by networks and loaded with ads. Check the live status below and use DropZap for a cleaner, faster download.",
        alternativeHref: "/",
        alternativeLabel: "DropZap Downloader",
      }}
      status={status}
    />
  );
}
