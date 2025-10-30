import { watch } from 'vue';

/**
 * Composable for handling iframe message communication
 * @param {Object} params - Configuration object
 * @param {Ref} params.pageRef - Reference to the page element
 * @param {Ref} params.locale - Current locale
 * @param {Ref} params.isDark - Dark mode state
 * @param {Object} params.panelLabels - Panel label mappings
 * @returns {Object} Message handling utilities
 */
export function useMessageHandling({ pageRef, locale, isDark, panelLabels }) {
  let lastSyncedLanguage = '';
  let lastThemeState = isDark.value;

  // Send language to iframe
  const syncLanguageToIframe = (iframe) => {
    try {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'LANGUAGE_UPDATE',
          language: locale.value
        }, '*');
      }
    } catch (error) {
      console.warn(`Failed to sync language to iframe: ${error.message}`);
    }
  };

  // Send panel info to iframe
  const syncPanelInfoToIframe = (iframe) => {
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
  const syncLanguageToAllIframes = (() => {
    let timeoutId = null;
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!pageRef.value) return;
        const iframes = pageRef.value.querySelectorAll('iframe');
        if (!iframes?.length) return;
        
        if (lastSyncedLanguage === locale.value) return;
        lastSyncedLanguage = locale.value;
        
        iframes.forEach(f => syncLanguageToIframe(f));
      }, 100);
    };
  })();

  // Theme sync to all iframes
  const syncThemeToAllIframes = (newTheme) => {
    if (lastThemeState === newTheme) return;
    lastThemeState = newTheme;
    
    if (!pageRef.value) return;
    const iframes = pageRef.value.querySelectorAll('iframe');
    if (!iframes?.length) return;
    
    iframes.forEach(iframe => {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'THEME_UPDATE',
          theme: newTheme ? 'dark' : 'light'
        }, '*');
      }
    });
  };

  // Message handlers
  const handleMessageFromIframe = (event) => {
    if (event.data?.type === 'EAGLE_EXTENSION_LOADED' || event.data?.type === 'AE_EXTENSION_LOADED') {
      syncLanguageToAllIframes();
    }
  };

  const handleThemeToggle = (event) => {
    const { newTheme } = event.detail;
    syncThemeToAllIframes(newTheme);
  };

  // Watchers
  watch(locale, syncLanguageToAllIframes);
  
  watch(isDark, (newValue) => {
    syncThemeToAllIframes(newValue);
  });

  return {
    syncLanguageToIframe,
    syncPanelInfoToIframe,
    syncLanguageToAllIframes,
    syncThemeToAllIframes,
    handleMessageFromIframe,
    handleThemeToggle
  };
}