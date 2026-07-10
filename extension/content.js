(() => {
  'use strict';

  const SITE_URL = 'https://www.dropzap.digital';

  // Platform detection patterns.
  const PATTERNS = {
    tiktok: /tiktok\.com\/(@[^/]+\/video\/\d+|t\/\d+)/,
    instagram: /instagram\.com\/(reel|p|stories)\/[^/?#]+/,
    facebook: /facebook\.com\/(watch\/?|reel\/|groups\/[^/]+\/posts\/|[^/]+\/videos\/|share\/v\/)/,
    fbWatch: /fb\.watch\//,
    twitter: /(twitter|x)\.com\/[^/]+\/status\/\d+/,
    reddit: /reddit\.com\/(r|u)\/[^/]+\/comments\/[^/]+/,
    pinterest: /pinterest\.com\/pin\/\d+/,
    threads: /threads\.net\/(@[^/]+\/post\/[^/]+|t\/[^/]+)/,
  };

  function detectPlatform(url) {
    for (const [name, regex] of Object.entries(PATTERNS)) {
      if (regex.test(url)) return name;
    }
    return null;
  }

  function getPageUrl() {
    // Some sites rewrite the URL without navigation; use the canonical link if present.
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical?.href || location.href;
  }

  function injectButton() {
    const url = getPageUrl();
    const platform = detectPlatform(url);
    if (!platform) return;

    // Avoid duplicate injection.
    if (document.getElementById('dropzap-fab')) return;

    const fab = document.createElement('a');
    fab.id = 'dropzap-fab';
    fab.href = `${SITE_URL}/?url=${encodeURIComponent(url)}`;
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.title = 'Download with DropZap';
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>DropZap</span>
    `;

    Object.assign(fab.style, {
      position: 'fixed',
      zIndex: '2147483647',
      bottom: '24px',
      right: '24px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      borderRadius: '9999px',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      textDecoration: 'none',
      boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.5), 0 8px 10px -6px rgba(168, 85, 247, 0.3)',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      lineHeight: '1',
    });

    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.05)';
      fab.style.boxShadow = '0 20px 35px -10px rgba(168, 85, 247, 0.6)';
    });
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1)';
      fab.style.boxShadow = '0 10px 25px -5px rgba(168, 85, 247, 0.5), 0 8px 10px -6px rgba(168, 85, 247, 0.3)';
    });

    document.body.appendChild(fab);
  }

  // Initial injection.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  // Re-inject on SPA navigation for TikTok, Instagram, X, Threads.
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const existing = document.getElementById('dropzap-fab');
      if (existing) existing.remove();
      // Give SPA a beat to update canonical URL.
      setTimeout(injectButton, 500);
    }
  }).observe(document, { subtree: true, childList: true });
})();
