import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { injectLightThemeIntoIframe, removeLightThemeFromIframe } from '../utils/injectIframeLightTheme.js';
import gsap from 'gsap';

/**
 * Composable for managing iframe loading and theming
 * @returns {Object} Iframe management utilities
 */
export function useIframeManager() {
  const isDark = useDark({ storageKey: 'vueuse-color-scheme' });
  /** @type {Set<string>} */
  const loadedIframes = new Set();
  /** @type {Array<Function>} */
  const cleanupFns = [];

  // 渐进式加载状态
  const panelLoaded = ref({
    panel1: false,
    panel2: false,
    panel3: false
  });

  const panelShouldLoad = ref({
    panel1: false,
    panel2: false,
    panel3: false
  });

  // 计算加载进度
  const loadingProgress = computed(() => {
    const loadedCount = Object.values(panelLoaded.value).filter(Boolean).length;
    const shouldLoadCount = Object.values(panelShouldLoad.value).filter(Boolean).length;
    
    if (shouldLoadCount === 0) return 0;
    
    const TOTAL_PANELS = 3;
    const PROGRESS_WEIGHT = 50;
    
    const baseProgress = (shouldLoadCount / TOTAL_PANELS) * PROGRESS_WEIGHT;
    const completeProgress = (loadedCount / TOTAL_PANELS) * PROGRESS_WEIGHT;
    
    return Math.min(100, baseProgress + completeProgress);
  });

  // 获取 iframe src
  const getIframeSrc = (panelId) => {
    return `/extensions/ae/index.html?panel=${panelId}`;
  };

  // 判断面板是否应该加载
  const shouldLoadPanel = (panelId) => {
    return panelShouldLoad.value[panelId];
  };

  // iframe 加载完成回调
  const onIframeLoad = (panelId) => {
    setTimeout(() => {
      panelLoaded.value[panelId] = true;
      
      const iframe = document.querySelector(`iframe[data-panel="${panelId}"]`);
      if (iframe) {
        gsap.fromTo(iframe, 
          { opacity: 0 }, 
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }, 150);
  };

  // 渐进式加载面板
  const progressiveLoadPanels = () => {
    const LOAD_DELAYS = [0, 600, 1200];
    const PANELS = ['panel1', 'panel2', 'panel3'];
    
    const loadWithIdleCallback = (callback, fallbackDelay) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: fallbackDelay });
      } else {
        setTimeout(callback, fallbackDelay);
      }
    };
    
    PANELS.forEach((panel, index) => {
      if (index === 0) {
        panelShouldLoad.value[panel] = true;
      } else {
        loadWithIdleCallback(() => {
          panelShouldLoad.value[panel] = true;
        }, LOAD_DELAYS[index]);
      }
    });
  };

  // 应用主题到 iframe
  const applyIframeTheme = (pageRef) => {
    if (!pageRef) return;
    const iframes = pageRef.querySelectorAll('iframe');
    if (!iframes?.length) return;
    
    if (isDark.value) {
      iframes.forEach(f => removeLightThemeFromIframe(f));
    } else {
      iframes.forEach(f => injectLightThemeIntoIframe(f));
    }
  };

  // 清理函数
  const cleanup = () => {
    cleanupFns.splice(0).forEach(fn => {
      try { fn(); } catch (_) {}
    });
    loadedIframes.clear();
  };

  return {
    panelLoaded,
    panelShouldLoad,
    loadingProgress,
    getIframeSrc,
    shouldLoadPanel,
    onIframeLoad,
    progressiveLoadPanels,
    applyIframeTheme,
    cleanup,
    cleanupFns,
    loadedIframes
  };
}