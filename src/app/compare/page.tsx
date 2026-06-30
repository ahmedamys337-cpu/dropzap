import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Best Free Video Downloader Comparison 2026 — DropZap vs Competitors",
  description:
    "Compare DropZap against SnapTik, ssstik, MusicallyDown, SnapInsta, iGram, SaveTik, TikMate, TikTokIO. See which free downloader is best for TikTok, Instagram, Facebook, Reddit.",
  keywords: [
    "best video downloader comparison",
    "tiktok downloader comparison",
    "instagram downloader comparison",
    "free downloader comparison 2026",
    "snaptik vs dropzap",
    "ssstik vs dropzap",
    "best free downloader",
    "downloader comparison table",
  ],
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/compare`,
    title: "Best Free Video Downloader Comparison 2026 — DropZap vs Competitors",
    description:
      "Compare DropZap against 8 competitors. See which free downloader is best for TikTok, Instagram, Facebook, Reddit.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is the best free TikTok downloader in 2026?", acceptedAnswer: { "@type": "Answer", text: "DropZap is the best free TikTok downloader in 2026. It has no watermark, no daily limit, no signup, and no subscription. SnapTik now charges $4.99/month for watermark-free downloads." } },
        { "@type": "Question", name: "Is SnapTik still free?", acceptedAnswer: { "@type": "Answer", text: "No. SnapTik switched to a paid subscription model in late 2025. The free tier now adds SnapTik's own watermark. Watermark-free downloads require a $4.99–$9.99/month subscription." } },
        { "@type": "Question", name: "Which downloader has no daily limit?", acceptedAnswer: { "@type": "Answer", text: "DropZap is the only downloader with no daily limit AND no subscription. ssstik, MusicallyDown, SnapInsta, iGram, SaveTik, TikMate, and TikTokIO all cap free downloads." } },
        { "@type": "Question", name: "What is the best free Instagram downloader?", acceptedAnswer: { "@type": "Answer", text: "DropZap is the best free Instagram downloader. It downloads Reels, photos, carousels (as ZIP), and IGTV with no login, no watermark, and no daily limit." } },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Comparison", item: `${SITE_URL}/compare` },
      ],
    },
  ],
};

const competitors = [
  { name: "DropZap", url: "/", free: true, watermark: false, dailyLimit: false, signup: false, instagram: true, reddit: true, twitter: true, facebook: true, threads: true, pinterest: true, mp3: true, ads: "Minimal", best: true },
  { name: "SnapTik", url: "/snaptik-alternative", free: false, watermark: false, dailyLimit: false, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Heavy", best: false },
  { name: "ssstik", url: "/alternatives/ssstik", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Moderate", best: false },
  { name: "MusicallyDown", url: "/alternatives/musicallydown", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: true, ads: "Heavy", best: false },
  { name: "SnapInsta", url: "/alternatives/snapinsta", free: true, watermark: false, dailyLimit: true, signup: false, instagram: true, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Moderate", best: false },
  { name: "iGram", url: "/alternatives/igram", free: true, watermark: false, dailyLimit: true, signup: false, instagram: true, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Moderate", best: false },
  { name: "SaveTik", url: "/alternatives/savetik", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Heavy", best: false },
  { name: "TikMate", url: "/alternatives/tikmate", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Heavy", best: false },
  { name: "TikTokIO", url: "/alternatives/tiktokio", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: false, threads: false, pinterest: false, mp3: false, ads: "Moderate", best: false },
  { name: "GetVid", url: "/alternatives/getvid", free: true, watermark: false, dailyLimit: true, signup: false, instagram: false, reddit: false, twitter: false, facebook: true, threads: false, pinterest: false, mp3: false, ads: "Heavy", best: false },
  { name: "SaveFrom", url: "/alternatives/savefrom", free: true, watermark: false, dailyLimit: true, signup: false, instagram: true, reddit: true, twitter: true, facebook: true, threads: true, pinterest: true, mp3: false, ads: "Heavy", best: false },
];

export default function ComparePage() {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              DropZap
            </span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/tools" className="hover:text-foreground transition-colors">All Tools</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Free Downloader Comparison{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            — 2026
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          We tested 11 video downloaders. Here&apos;s how DropZap compares to SnapTik, ssstik, 
          MusicallyDown, SnapInsta, iGram, SaveTik, TikMate, TikTokIO, GetVid, and SaveFrom.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="glass rounded-2xl p-4 sm:p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-bold">Feature</th>
                {competitors.map((c) => (
                  <th key={c.name} className={`text-center py-3 px-2 font-bold ${c.best ? "text-blue-500" : ""}`}>
                    {c.best ? "⭐ " : ""}{c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">100% Free</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.free ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">No Watermark</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.watermark ? <XCircle className="h-5 w-5 text-red-500 mx-auto" /> : <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">No Daily Limit</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.dailyLimit ? <XCircle className="h-5 w-5 text-red-500 mx-auto" /> : <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">No Signup</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.signup ? <XCircle className="h-5 w-5 text-red-500 mx-auto" /> : <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Instagram</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.instagram ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Reddit (with sound)</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.reddit ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Twitter / X</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.twitter ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Facebook</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.facebook ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Threads</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.threads ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">Pinterest</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.pinterest ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-2 font-medium">MP3 Conversion</td>
                {competitors.map((c) => (
                  <td key={c.name} className="text-center py-3 px-2">
                    {c.mp3 ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">Ad Level</td>
                {competitors.map((c) => (
                  <td key={c.name} className={`text-center py-3 px-2 text-xs ${c.ads === "Minimal" ? "text-green-500 font-bold" : c.ads === "Heavy" ? "text-red-500" : "text-yellow-500"}`}>
                    {c.ads}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
        <div className="space-y-4 text-muted-foreground">
          <p><strong className="text-foreground">SnapTik is no longer free.</strong> As of late 2025, SnapTik charges $4.99–$9.99/month for watermark-free downloads. The free tier adds SnapTik&apos;s own watermark. DropZap is the best free SnapTik alternative.</p>
          <p><strong className="text-foreground">All competitors have daily limits.</strong> ssstik, MusicallyDown, SnapInsta, iGram, SaveTik, TikMate, TikTokIO, GetVid, and SaveFrom all cap free downloads per day. DropZap has no daily limit.</p>
          <p><strong className="text-foreground">DropZap supports 7 platforms.</strong> Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, and Threads. Most competitors only support 1-2 platforms.</p>
          <p><strong className="text-foreground">DropZap has minimal ads.</strong> No redirect ads, no fake download buttons, no popups. Most competitors have heavy banner ads and pop-unders.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Read Detailed Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.filter((c) => !c.best).map((c) => (
            <Link
              key={c.name}
              href={c.url}
              className="glass rounded-xl p-5 hover:-translate-y-0.5 transition-transform block"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground">DropZap vs {c.name}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Full comparison with features, pricing, and limitations.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "What is the best free TikTok downloader in 2026?", a: "DropZap is the best free TikTok downloader in 2026. It has no watermark, no daily limit, no signup, and no subscription. SnapTik now charges $4.99/month for watermark-free downloads." },
            { q: "Is SnapTik still free?", a: "No. SnapTik switched to a paid subscription model in late 2025. The free tier now adds SnapTik's own watermark. Watermark-free downloads require a $4.99–$9.99/month subscription." },
            { q: "Which downloader has no daily limit?", a: "DropZap is the only downloader with no daily limit AND no subscription. ssstik, MusicallyDown, SnapInsta, iGram, SaveTik, TikMate, and TikTokIO all cap free downloads." },
            { q: "What is the best free Instagram downloader?", a: "DropZap is the best free Instagram downloader. It downloads Reels, photos, carousels (as ZIP), and IGTV with no login, no watermark, and no daily limit." },
          ].map((item, i) => (
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

      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DropZap. For personal use only. Respect content creators&apos; rights.
          </p>
        </div>
      </footer>
    </main>
  );
}
