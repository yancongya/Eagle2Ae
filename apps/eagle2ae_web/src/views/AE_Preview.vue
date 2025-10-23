<template>
  <main class="bg-white dark:bg-gray-900">
    <div ref="pageRef" :style="[{ 'view-transition-name': 'preview' }, wrapperStyle]" class="flex flex-col">
      <section class="flex-1 min-h-0 w-full">
        <!-- Mobile: single preview -->
        <div class="md:hidden h-full">
          <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
        </div>
        <!-- Desktop: three-pane preview -->
        <div class="hidden md:block h-full">
          <splitpanes class="default-theme" style="height: 100%">
            <!-- Left Pane (Main View) -->
            <pane :size="70">
              <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
            </pane>

            <!-- Right Pane (Container for vertical split) -->
            <pane :size="30">
              <splitpanes horizontal>
                <!-- Top-Right Pane -->
                <pane :size="50">
                  <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
                </pane>
                <!-- Bottom-Right Pane -->
                <pane :size="50">
                  <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
                </pane>
              </splitpanes>
            </pane>
          </splitpanes>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Splitpanes, Pane } from 'splitpanes';
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useDark } from '@vueuse/core';
import { injectLightThemeIntoIframe, removeLightThemeFromIframe } from '../utils/injectIframeLightTheme.js';
import { syncThemeToAllIframes } from '../utils/iframeThemeSync.js';
import gsap from 'gsap';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { locale } = useI18n();
const pageRef = ref(null);
const wrapperStyle = computed(() => ({ height: '100vh' }));
const isDark = useDark({ storageKey: 'theme' });

// Keep track of iframe load cleanup handlers
const cleanupFns = [];

const applyIframeTheme = () => {
  const root = pageRef.value;
  if (!root) return;
  const iframes = root.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  if (isDark.value) {
    iframes.forEach((f) => removeLightThemeFromIframe(f));
  } else {
    iframes.forEach((f) => injectLightThemeIntoIframe(f));
  }
};

const bindIframeLoadHandlers = () => {
  const root = pageRef.value;
  if (!root) return;
  const iframes = root.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  iframes.forEach((f) => {
    const onLoad = () => {
      // Re-apply theme when iframe reloads
      if (isDark.value) {
        removeLightThemeFromIframe(f);
      } else {
        injectLightThemeIntoIframe(f);
      }
      
      // Send current language to iframe
      syncLanguageToIframe(f);
    };
    f.addEventListener('load', onLoad);
    cleanupFns.push(() => f.removeEventListener('load', onLoad));
  });
};

// Function to send language to iframe
const syncLanguageToIframe = (iframe) => {
  if (iframe && iframe.contentWindow) {
    // Send language update to iframe
    iframe.contentWindow.postMessage({
      type: 'LANGUAGE_UPDATE',
      language: locale.value
    }, '*');
  }
};

// Function to sync language to all iframes
const syncLanguageToAllIframes = () => {
  const root = pageRef.value;
  if (!root) return;
  const iframes = root.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  
  iframes.forEach(f => {
    syncLanguageToIframe(f);
  });
};

onMounted(() => {
  gsap.set(pageRef.value, { opacity: 0, y: 12 });
  gsap.to(pageRef.value, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  applyIframeTheme();
  bindIframeLoadHandlers();
  
  // Setup message listener for communication from iframes
  window.addEventListener('message', handleMessageFromIframe);
  
  // 监听主题切换事件
  window.addEventListener('themeToggle', handleThemeToggle);
  
  // Sync language after a short delay to ensure iframes are loaded
  setTimeout(syncLanguageToAllIframes, 100);
});

onBeforeUnmount(() => {
  cleanupFns.splice(0).forEach((fn) => {
    try { fn(); } catch (_) {}
  });
  
  // Remove message listener
  window.removeEventListener('message', handleMessageFromIframe);
  window.removeEventListener('themeToggle', handleThemeToggle);
});

watch(isDark, (newValue) => {
  applyIframeTheme();
  
  // 向 iframe 发送主题更新消息
  const root = pageRef.value;
  if (!root) return;
  const iframes = root.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  
  iframes.forEach(iframe => {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'THEME_UPDATE',
        theme: newValue ? 'dark' : 'light'
      }, '*');
    }
  });
});

// Watch for language changes and sync to iframes
watch(locale, () => {
  syncLanguageToAllIframes();
});

// Handler for messages from iframes
const handleMessageFromIframe = (event) => {
  // Only process messages from our iframes
  if (event.data && event.data.type === 'EAGLE_EXTENSION_LOADED' || event.data.type === 'AE_EXTENSION_LOADED') {
    // Send current language to the iframe that just loaded
    syncLanguageToAllIframes();
  }
};

// Handler for theme toggle events
const handleThemeToggle = (event) => {
  const { x, y, newTheme } = event.detail;
  syncThemeToAllIframes(pageRef.value, newTheme, { x, y });
};
</script>

<style scoped>
</style>
