const SITE_URL = 'https://www.dropzap.digital';

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

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const platform = detectPlatform(url);

  const supportedEl = document.getElementById('statusSupported');
  const unsupportedEl = document.getElementById('statusUnsupported');
  const urlEl = document.getElementById('pageUrl');
  const downloadBtn = document.getElementById('downloadBtn');
  const homeBtn = document.getElementById('homeBtn');

  if (platform) {
    supportedEl.classList.remove('hidden');
    urlEl.textContent = url;
    urlEl.classList.remove('hidden');
    downloadBtn.href = `${SITE_URL}/?url=${encodeURIComponent(url)}`;
    downloadBtn.classList.remove('hidden');
    homeBtn.classList.add('hidden');
  } else {
    unsupportedEl.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
