// Background service worker for DropZap extension.
// Currently lightweight: keeps the extension active and handles future analytics.

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({
      url: 'https://www.dropzap.digital/extension?installed=1',
    });
  }
});
