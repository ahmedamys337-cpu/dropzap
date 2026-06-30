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
      { key: "21eeee1bf19c9831ef94e5861e4041bc", height: 90, width: 728, containerId: "container-21eeee1bf19c9831ef94e5861e4041bc" },
      { key: "8f5ab175ed15860124d6de8f263e3f77", height: 60, width: 468, containerId: "container-8f5ab175ed15860124d6de8f263e3f77" },
    ];

    // Render each banner ad in its own iframe so every ad gets its own
    // global atOptions and document scope. This prevents the race condition
    // that happens when multiple Adsterra scripts share the same page.
    configs.forEach(({ key, height, width, containerId }) => {
      const adContainer = document.createElement("div");
      adContainer.id = containerId;
      adContainer.style.display = "inline-block";
      adContainer.style.maxWidth = "100%";
      container.appendChild(adContainer);

      const iframe = document.createElement("iframe");
      iframe.width = String(width);
      iframe.height = String(height);
      iframe.scrolling = "no";
      iframe.style.border = "0";
      iframe.style.overflow = "hidden";
      iframe.style.maxWidth = "100%";
      iframe.style.background = "transparent";
      iframe.title = "Advertisement";
      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>html,body{margin:0;padding:0;overflow:hidden;width:100%;height:100%;background:transparent;}</style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '${key}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
          </body>
        </html>
      `;

      adContainer.appendChild(iframe);

      // Detect if the ad actually rendered content (not just blank)
      setTimeout(() => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          const hasContent = iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.length > 100;
          console.log(`[Adsterra] ${key}: ${hasContent ? "rendered" : "empty/no fill"}`);
        } catch (e) {
          console.log(`[Adsterra] ${key}: cross-origin check skipped`);
        }
      }, 3000);
    });
  }, [mounted, pathname]);

  if (!mounted || isLegalPage(pathname)) return null;

  return (
    <>
      <Script
        src="https://pl30087661.effectivecpmnetwork.com/7e/da/3a/7eda3aedc8736e42270e448f7f5531a6.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://pl30087662.effectivecpmnetwork.com/65/f9/20/65f920d880821ea5435bf95e085e0b30.js"
        strategy="afterInteractive"
      />
      <div id="container-5bc8ac44c319f4229556e677c20a528d" className="min-h-[90px] min-w-[320px] max-w-[728px] w-full mx-auto overflow-hidden" />
      <Script
        async
        data-cfasync="false"
        src="https://pl30087663.effectivecpmnetwork.com/5bc8ac44c319f4229556e677c20a528d/invoke.js"
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="adsterra-banners flex flex-wrap justify-center items-center gap-3 p-3 w-full" />
    </>
  );
}
