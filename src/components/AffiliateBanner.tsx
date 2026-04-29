"use client";

interface AffiliateBannerProps {
  placement: "sidebar" | "inline" | "footer";
  className?: string;
}

// Affiliate links and banners — replace with your actual affiliate URLs
const affiliateOffers = [
  {
    name: "NordVPN",
    tagline: "Stay private while downloading",
    description: "Protect your privacy with the #1 VPN. 68% off + 3 months free.",
    url: "#", // Replace with affiliate URL
    cta: "Get NordVPN Deal",
    color: "from-blue-700 to-blue-900",
  },
  {
    name: "Surfshark VPN",
    tagline: "Unlimited devices, one price",
    description: "Best budget VPN for downloading. 82% off + 2 months free.",
    url: "#", // Replace with affiliate URL
    cta: "Get Surfshark",
    color: "from-teal-600 to-teal-800",
  },
  {
    name: "ExpressVPN",
    tagline: "The fastest VPN",
    description: "Ultra-fast speeds for smooth downloading. 49% off annual plan.",
    url: "#", // Replace with affiliate URL
    cta: "Try ExpressVPN",
    color: "from-red-600 to-red-800",
  },
];

export default function AffiliateBanner({ placement, className = "" }: AffiliateBannerProps) {
  // Rotate through offers based on placement to show variety
  const offerIndex = placement === "sidebar" ? 0 : placement === "inline" ? 1 : 2;
  const offer = affiliateOffers[offerIndex % affiliateOffers.length];

  if (placement === "sidebar") {
    return (
      <div className={`glass rounded-xl p-4 ${className}`}>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Sponsored</p>
        <div className={`bg-gradient-to-r ${offer.color} rounded-lg p-4`}>
          <p className="text-white font-bold text-sm">{offer.name}</p>
          <p className="text-white/80 text-xs mt-1">{offer.tagline}</p>
          <p className="text-white/70 text-xs mt-2">{offer.description}</p>
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block mt-3 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {offer.cta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Sponsored</p>
      <a
        href={offer.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={`block bg-gradient-to-r ${offer.color} rounded-lg p-4 hover:opacity-95 transition-opacity`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold">{offer.name} — {offer.tagline}</p>
            <p className="text-white/70 text-sm mt-1">{offer.description}</p>
          </div>
          <span className="shrink-0 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg">
            {offer.cta}
          </span>
        </div>
      </a>
    </div>
  );
}
