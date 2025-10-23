// Sync language changes to iframes with View Transitions support

/**
 * Send language update message to iframe
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @param {string} language - The new language code (e.g., 'zh-CN', 'en-US')
 */
export function sendLanguageUpdateToIframe(iframe, language) {
  if (!iframe || !iframe.contentWindow) return;
  
  try {
    iframe.contentWindow.postMessage({
      type: 'LANGUAGE_UPDATE',
      language: language
    }, '*'); // Use '*' for same-origin or specify origin for security
  } catch (error) {
    console.warn('Failed to send language update to iframe:', error);
  }
}

/**
 * Setup language sync for all iframes in a container
 * @param {HTMLElement} container - Container element with iframes
 */
export function setupIframeLanguageSync(container) {
  if (!container) return;

  // Listen for language change events
  const handleLanguageChange = (event) => {
    const newLanguage = event.detail?.locale;
    if (!newLanguage) return;

    // Find all iframes in the container
    const iframes = container.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
      // Wait for iframe to be loaded
      if (iframe.contentWindow) {
        sendLanguageUpdateToIframe(iframe, newLanguage);
      }
    });
  };

  window.addEventListener('lang-changed', handleLanguageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('lang-changed', handleLanguageChange);
  };
}

/**
 * Setup language sync for a single iframe
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @returns {Function} Cleanup function
 */
export function setupSingleIframeLanguageSync(iframe) {
  if (!iframe) return () => {};

  const handleLanguageChange = (event) => {
    const newLanguage = event.detail?.locale;
    if (!newLanguage) return;
    sendLanguageUpdateToIframe(iframe, newLanguage);
  };

  window.addEventListener('lang-changed', handleLanguageChange);

  // Also send current language on mount
  const currentLang = localStorage.getItem('lang') || 'zh-CN';
  if (iframe.contentWindow) {
    sendLanguageUpdateToIframe(iframe, currentLang);
  }

  return () => {
    window.removeEventListener('lang-changed', handleLanguageChange);
  };
}
