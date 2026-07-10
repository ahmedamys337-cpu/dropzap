import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap, Globe, Download, CheckCircle2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

interface CountryConfig {
  code: string;
  name: string;
  language: string;
  greeting: string;
  headline: string;
  description: string;
  emphasis: string[];
  ctaTool: { label: string; href: string };
  keywords: string[];
}

const countries: Record<string, CountryConfig> = {
  in: {
    code: "IN",
    name: "India",
    language: "English",
    greeting: "Best video downloader for India",
    headline: "Free Video Downloader for India — No Daily Limit",
    description:
      "Download Instagram Reels, TikTok videos without watermark, Facebook videos, Twitter/X videos, and more. DropZap works on Jio, Airtel, and WiFi without signup.",
    emphasis: ["TikTok (via VPN regions)", "Instagram Reels", "Facebook", "Twitter/X", "YouTube thumbnails", "MP3 converter"],
    ctaTool: { label: "Start Downloading", href: "/" },
    keywords: [
      "video downloader india",
      "free video downloader india",
      "instagram reel downloader india",
      "tiktok downloader india",
      "facebook video downloader india",
      "twitter video downloader india",
      "download videos without watermark india",
    ],
  },
  id: {
    code: "ID",
    name: "Indonesia",
    language: "English",
    greeting: "Pengunduh video gratis untuk Indonesia",
    headline: "Free Video Downloader for Indonesia — Tanpa Watermark",
    description:
      "DropZap is a fast, free video downloader that works great on Telkomsel, IndiHome, XL, and Tri. Save TikTok, Instagram Reels, Facebook, and Twitter/X videos without watermark.",
    emphasis: ["TikTok tanpa watermark", "Instagram Reels", "Facebook", "Twitter/X", "Pinterest", "MP3 converter"],
    ctaTool: { label: "Mulai Mengunduh", href: "/" },
    keywords: [
      "download video indonesia",
      "tiktok downloader indonesia",
      "download tiktok tanpa watermark",
      "instagram downloader indonesia",
      "facebook video downloader indonesia",
      "pengunduh video gratis",
    ],
  },
  br: {
    code: "BR",
    name: "Brazil",
    language: "Portuguese",
    greeting: "Baixador de vídeos grátis para o Brasil",
    headline: "Baixador de Vídeos Grátis para o Brasil — Sem Marca d'Água",
    description:
      "Baixe vídeos do TikTok, Instagram Reels, Facebook, Twitter/X e Pinterest sem marca d'água. Funciona na Vivo, Claro, TIM e Oi, sem cadastro.",
    emphasis: ["TikTok sem marca d'água", "Instagram Reels", "Facebook", "Twitter/X", "Pinterest", "MP3"],
    ctaTool: { label: "Começar a Baixar", href: "/" },
    keywords: [
      "baixador de vídeos brasil",
      "baixar tiktok sem marca d'agua",
      "download instagram reels brasil",
      "baixar video do facebook",
      "baixador de video gratis",
      "twitter video downloader brasil",
    ],
  },
  de: {
    code: "DE",
    name: "Germany",
    language: "German",
    greeting: "Kostenloser Video-Downloader für Deutschland",
    headline: "Kostenloser Video-Downloader für Deutschland — Ohne Wasserzeichen",
    description:
      "Laden Sie TikTok, Instagram Reels, Facebook, Twitter/X und Pinterest Videos ohne Wasserzeichen herunter. Keine Registrierung, kein Limit, DSGSA-konformer Datenschutz.",
    emphasis: ["TikTok ohne Wasserzeichen", "Instagram Reels", "Facebook", "Twitter/X", "Pinterest", "MP3 Konverter"],
    ctaTool: { label: "Jetzt herunterladen", href: "/" },
    keywords: [
      "video downloader deutschland",
      "tiktok downloader deutschland",
      "tiktok ohne wasserzeichen",
      "instagram downloader deutschland",
      "facebook video downloader deutschland",
      "kostenloser video downloader",
    ],
  },
  ph: {
    code: "PH",
    name: "Philippines",
    language: "English",
    greeting: "Free video downloader for the Philippines",
    headline: "Free Video Downloader for the Philippines — No Watermark",
    description:
      "Download TikTok, Instagram Reels, Facebook, Twitter/X, and Pinterest videos without watermark. Works great on Globe, Smart, and PLDT. No signup needed.",
    emphasis: ["TikTok without watermark", "Instagram Reels", "Facebook", "Twitter/X", "Pinterest", "MP3 converter"],
    ctaTool: { label: "Start Downloading", href: "/" },
    keywords: [
      "video downloader philippines",
      "tiktok downloader philippines",
      "download tiktok no watermark philippines",
      "instagram downloader philippines",
      "facebook video downloader philippines",
      "free video downloader philippines",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(countries).map((country) => ({ country }));
}

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
  const cfg = countries[params.country.toLowerCase()];
  if (!cfg) return {};
  return {
    title: cfg.headline,
    description: cfg.description,
    keywords: cfg.keywords,
    alternates: { canonical: `${SITE_URL}/${params.country.toLowerCase()}/video-downloader` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${params.country.toLowerCase()}/video-downloader`,
      title: cfg.headline,
      description: cfg.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default function CountryVideoDownloaderPage({ params }: { params: { country: string } }) {
  const cfg = countries[params.country.toLowerCase()];
  if (!cfg) return null;

  const tools = [
    { label: "TikTok", href: "/tiktok-downloader", desc: cfg.emphasis[0] },
    { label: "Instagram", href: "/instagram-downloader", desc: "Reels, photos & carousels" },
    { label: "Facebook", href: "/facebook-video-downloader", desc: "Videos & Reels" },
    { label: "Twitter/X", href: "/twitter-video-downloader", desc: "Videos & GIFs" },
    { label: "Pinterest", href: "/pinterest-video-downloader", desc: "Images & videos" },
    { label: "Threads", href: "/threads-downloader", desc: "Videos & photos" },
  ];

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            {cfg.name}
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/20 text-purple-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <Globe className="h-4 w-4" />
          {cfg.greeting}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          {cfg.headline}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {cfg.description}
        </p>
        <Link
          href={cfg.ctaTool.href}
          className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
        >
          <Download className="h-5 w-5" />
          {cfg.ctaTool.label}
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Popular tools in {cfg.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass rounded-xl p-5 hover:bg-white/10 transition-colors block"
            >
              <h3 className="font-bold mb-1">{tool.label} Downloader</h3>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Why users in {cfg.name} choose DropZap</h2>
        <div className="space-y-3">
          {[
            "No account, no email, and no phone number required",
            "Works on mobile data and public WiFi networks",
            "Downloads start in 3–5 seconds",
            "No watermark on TikTok downloads",
            "Unlimited downloads, no daily cap",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
