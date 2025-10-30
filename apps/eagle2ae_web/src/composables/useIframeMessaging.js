// Removed unused ref import

/**
 * Composable for handling iframe communication
 * @returns {Object} Messaging utilities
 */
export function useIframeMessaging() {
  const loadedIframes = new Set();
  let lastSyncedLanguage = '';
  let lastThemeState = null;

  // Send language to iframe
  const syncLanguageToIframe = (iframe, language) => {
    try {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'LANGUAGE_UPDATE',
          language
        }, '*');
      }
    } catch (error) {
      console.warn(`Failed to sync language to iframe: ${error.message}`);
    }
  };

  // Send panel info to iframe
  const syncPanelInfoToIframe = (iframe, panelLabels) => {
    try {
      if (iframe?.contentWindow) {
        const panelId = iframe.getAttribute('data-panel');
        if (panelId && panelLabels[panelId]) {
          iframe.contentWindow.postMessage({
            type: 'PANEL_INFO',
            panelId: `com.yanrouya.eagle2ae.${panelId}`,
            panelName: panelLabels[panelId]
          }, '*');
        }
      }
    } catch (error) {
      console.warn(`Failed to sync panel info to iframe: ${error.message}`);
    }
  };

  // Debounced language sync
  const createDebouncedLanguageSync = (pageRef, locale) => {
    let timeoutId = null;
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!pageRef.value) return;
        const iframes = pageRef.value.querySelectorAll('iframe');
        if (!iframes?.length) return;
        
        if (lastSyncedLanguage === locale.value) return;
        lastSyncedLanguage = locale.value;
        
        iframes.forEach(f => syncLanguageToIframe(f, locale.value));
      }, 100);
    };
  };

  // Theme sync to iframes
  const syncThemeToIframes = (pageRef, isDark) => {
    if (lastThemeState === isDark.value) return;
    lastThemeState = isDark.value;
    
    if (!pageRef.value) return;
    const iframes = pageRef.value.querySelectorAll('iframe');
    if (!iframes?.length) return;
    
    iframes.forEach(iframe => {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'THEME_UPDATE',
          theme: isDark.value ? 'dark' : 'light'
        }, '*');
      }
    });
  };

  return {
    loadedIframes,
    syncLanguageToIframe,
    syncPanelInfoToIframe,
    createDebouncedLanguageSync,
    syncThemeToIframes
  };
}