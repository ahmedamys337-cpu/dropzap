"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Routes where ads should not load. Exact match and sub-routes are blocked.
const LEGAL_PATHS = ["/privacy", "/terms", "/dmca"];

function isLegalPage(path: string | null) {
  if (!path) return false;
  return LEGAL_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export default function AdsterraAds() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLegalPage(pathname)) return;
    if (loadedRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    loadedRef.current = true;

    const configs = [
      { key: "21eeee1bf19c9831ef94e5861e4041bc", height: 90, width: 728 },
      { key: "8f5ab175ed15860124d6de8f263e3f77", height: 60, width: 468 },
    ];

    configs.forEach(({ key, height, width }) => {
      const opts = document.createElement("script");
      opts.textContent = `
        atOptions = {
          'key' : '${key}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      container.appendChild(opts);

      const script = document.createElement("script");
      script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      script.async = true;
      container.appendChild(script);
    });
  }, [mounted, pathname]);

  if (!mounted || isLegalPage(pathname)) return null;

  return (
    <>
      <Script
        src="https://pl30087661.effectivecpmnetwork.com/7e/da/3a/7eda3aedc8736e42270e448f7f5531a6.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://pl30087662.effectivecpmnetwork.com/65/f9/20/65f920d880821ea5435bf95e085e0b30.js"
        strategy="lazyOnload"
      />
      <div id="container-5bc8ac44c319f4229556e677c20a528d" />
      <Script
        async
        data-cfasync="false"
        src="https://pl30087663.effectivecpmnetwork.com/5bc8ac44c319f4229556e677c20a528d/invoke.js"
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="adsterra-banners" />
    </>
  );
}
