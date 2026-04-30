import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Bug, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact DropZap — Support & Feedback",
  description:
    "Get in touch with the DropZap team. Send us bug reports, feature requests, business inquiries, or DMCA notices.",
  robots: { index: true, follow: true },
};

const contactOptions = [
  {
    icon: MessageCircle,
    title: "General Support",
    description:
      "Questions about how to use DropZap, browser compatibility, or general feedback.",
    email: "dropzap.contact@gmail.com",
    subject: "Support",
    color: "text-blue-500",
  },
  {
    icon: Bug,
    title: "Bug Reports",
    description:
      "Found something broken? Tell us the URL you were trying, what platform, and what went wrong.",
    email: "dropzap.contact@gmail.com",
    subject: "Bug Report",
    color: "text-orange-500",
  },
  {
    icon: Briefcase,
    title: "Business & Partnerships",
    description:
      "Advertising inquiries, API access, white-label, or partnership opportunities.",
    email: "dropzap.contact@gmail.com",
    subject: "Business Inquiry",
    color: "text-purple-500",
  },
  {
    icon: Mail,
    title: "DMCA / Copyright",
    description:
      "Submit a DMCA takedown notice or counter-notification. See our DMCA policy first.",
    email: "dropzap.contact@gmail.com",
    subject: "DMCA Notice",
    color: "text-red-500",
  },
];

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
      >
        ← Back to DropZap
      </Link>

      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-muted-foreground mb-10">
        We respond to every email within 24-48 hours.
      </p>

      <div className="space-y-4">
        {contactOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.email}
              className="p-6 rounded-xl border border-border bg-card flex gap-4 items-start"
            >
              <div className="shrink-0">
                <Icon className={`h-7 w-7 ${opt.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {opt.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {opt.description}
                </p>
                <a
                  href={`mailto:${opt.email}?subject=${encodeURIComponent(`[${opt.subject}] `)}`}
                  className="text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                  {opt.email}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-xl border border-border bg-muted/40">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Before you email us
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Please check these resources first — your question may already be answered:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            →{" "}
            <Link href="/blog" className="text-foreground underline">
              Help articles &amp; guides on the blog
            </Link>
          </li>
          <li>
            →{" "}
            <Link href="/about" className="text-foreground underline">
              About DropZap
            </Link>
          </li>
          <li>
            →{" "}
            <Link href="/privacy" className="text-foreground underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            →{" "}
            <Link href="/terms" className="text-foreground underline">
              Terms of Service
            </Link>
          </li>
          <li>
            →{" "}
            <Link href="/dmca" className="text-foreground underline">
              DMCA / Copyright Policy
            </Link>
          </li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground mt-10">
        DropZap is operated independently. We are not affiliated with YouTube,
        Instagram, TikTok, Twitter/X, Facebook, or Reddit.
      </p>
    </main>
  );
}
