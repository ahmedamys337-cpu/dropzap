import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

// Visible breadcrumb navigation rendered at the top of every dedicated
// tool page. Two purposes:
//   1. UX — users on long-tail SERP entries (e.g. arriving at
//      /reddit-video-downloader from a Google search) get a one-click
//      path back to the homepage and a sense of site structure.
//   2. SEO — pairs with the BreadcrumbList JSON-LD so Google can render
//      "Home › TikTok Downloader" instead of the raw URL in the SERP.
//
// The visible markup uses nav[aria-label="Breadcrumb"] + ol/li so screen
// readers announce it correctly. Current page is marked
// aria-current="page" rather than linked.

export interface Crumb {
  label: string;
  href?: string; // omit on the current page
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`max-w-6xl mx-auto px-4 pt-4 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
