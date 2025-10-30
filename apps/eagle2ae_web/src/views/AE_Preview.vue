<template>
  <main class="bg-white dark:bg-gray-900">
    <div ref="pageRef" :style="[{ 'view-transition-name': 'preview' }, wrapperStyle]" class="flex flex-col">
      <section class="flex-1 min-h-0 w-full">
        <!-- Mobile: single preview (Panel 1) -->
        <div class="md:hidden h-full">
          <!-- 使用骨架屏 + 渐隐显示，移动端仅加载第一个面板 -->
          <PanelFrame
            panel-id="panel1"
            :label="panelLabels.panel1"
            src="/extensions/ae/index.html?panel=panel1"
            :loaded="panel1Loaded"
            :should-load="true"
            variant="primary"
            @load="onPanel1Loaded"
          />
        </div>
        <!-- Desktop: three-pane preview -->
        <div class="hidden md:block h-full">
          <splitpanes 
            :class="['default-theme', { 'no-anim': suppressAnim }]" 
            style="height: 100%"
            @resized="handleOuterResized"
          >
            <!-- Left Pane (Panel 1 - 默认配置) -->
            <pane :size="sizes.left">
              <div class="relative w-full h-full">
                <PanelFrame 
                  panel-id="panel1"
                  :label="panelLabels.panel1"
                  src="/extensions/ae/index.html?panel=panel1" 
                  :loaded="panel1Loaded"
                  :should-load="true"
                  variant="primary"
                  @load="onPanel1Loaded"
                />
              </div>
            </pane>

            <!-- Right Pane (Container for vertical split) -->
            <pane :size="100 - sizes.left">
              <splitpanes horizontal @resized="handleInnerResized">
                <!-- Top-Right Pane (Panel 2 - 快速预览) -->
                <pane :size="sizes.top">
                  <div ref="panel2ContainerRef" class="relative w-full h-full">
                <PanelFrame 
                  panel-id="panel2"
                  :label="panelLabels.panel2"
                  src="/extensions/ae/index.html?panel=panel2" 
                  :loaded="panel2LoadedComputed"
                  :should-load="shouldLoadPanel2"
                  :hide-until-loaded="true"
                  :show-skeleton="false"
                  variant="secondary"
                  @load="onPanel2Loaded"
                />
                    <transition name="fade300">
                      <PanelPlaceholder
                        v-if="panel2Status !== 'loaded'"
                        :panel-id="'panel2'"
                        :label="panelLabels.panel2"
                        :status="panel2Status"
                        :mode="placeholderMode"
                        :blur-radius="placeholderBlur"
                        @activate="activatePanel('panel2')"
                      />
                    </transition>
                  </div>
                </pane>
                <!-- Bottom-Right Pane (Panel 3 - 音频项目) -->
                <pane :size="sizes.bottom">
                  <div ref="panel3ContainerRef" class="relative w-full h-full">
                <PanelFrame 
                  panel-id="panel3"
                  :label="panelLabels.panel3"
                  src="/extensions/ae/index.html?panel=panel3" 
                  :loaded="panel3LoadedComputed"
                  :should-load="shouldLoadPanel3"
                  :hide-until-loaded="true"
                  :show-skeleton="false"
                  variant="tertiary"
                  @load="onPanel3Loaded"
                />
                    <transition name="fade300">
                      <PanelPlaceholder
                        v-if="panel3Status !== 'loaded'"
                        :panel-id="'panel3'"
                        :label="panelLabels.panel3"
                        :status="panel3Status"
                        :mode="placeholderMode"
                        :blur-radius="placeholderBlur"
                        @activate="activatePanel('panel3')"
                      />
                    </transition>
                  </div>
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
import { syncThemeToAllIframes, sendThemeOverrideToAllIframes, sendThemeOverrideToIframe, sendThemeUnlockToAllIframes } from '../utils/iframeThemeSync.js';
import gsap from 'gsap';
import { useI18n } from 'vue-i18n';
import PanelFrame from '../components/PanelFrame.vue';
import PanelPlaceholder from '../components/PanelPlaceholder.vue';
import { usePanelLoader } from '../composables/usePanelLoader.js';

const route = useRoute();
const { locale, t } = useI18n();
const pageRef = ref(null);
const wrapperStyle = computed(() => ({ height: '100vh' }));
const isDark = useDark({ storageKey: 'theme' });

// 面板标签文本：默认使用 manifest 中的面板名，若失败则使用简单回退
const panelLabels = ref({
  panel1: 'Eagle2Ae 1@烟囱鸭',
  panel2: 'Eagle2Ae 2@烟囱鸭',
  panel3: 'Eagle2Ae 3@烟囱鸭'
});

const loadPanelLabelsFromManifest = async () => {
  try {
    const res = await fetch('/extensions/ae/CSXS/manifest.xml', { cache: 'no-store' });
    if (!res.ok) return;
    const xmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const map = { ...panelLabels.value };
    const extensions = Array.from(doc.querySelectorAll('DispatchInfoList > Extension'));
    extensions.forEach((ext) => {
      const id = ext.getAttribute('Id') || '';
      const menuEl = ext.querySelector('UI > Menu');
      const title = menuEl ? (menuEl.textContent || '').trim() : '';
      if (!title) return;
      if (id.endsWith('.panel1')) map.panel1 = title;
      else if (id.endsWith('.panel2')) map.panel2 = title;
      else if (id.endsWith('.panel3')) map.panel3 = title;
    });
    panelLabels.value = map;
  } catch (_) {
    // 静默失败，保留默认值
  }
};

// Keep track of iframe load cleanup handlers
const cleanupFns = [];

// 分步加载与加载状态
const panel1Loaded = ref(false);
const panel2Loaded = ref(false);
const panel3Loaded = ref(false);

const shouldLoadPanel2 = ref(false);
const shouldLoadPanel3 = ref(false);

// Hide PanelFrame skeleton until we actually start loading
const panel2LoadedComputed = computed(() => (shouldLoadPanel2.value ? panel2Loaded.value : true));
const panel3LoadedComputed = computed(() => (shouldLoadPanel3.value ? panel3Loaded.value : true));

// Placeholder preferences
const placeholderMode = ref('frosted'); // 'solid' | 'frosted' | 'empty'
const placeholderBlur = ref(18);

// Loader: sequential background loading with IO + memory guard
const panel2ContainerRef = ref(null);
const panel3ContainerRef = ref(null);
const loader = usePanelLoader({
  loadIntervalMs: 300,
  maxConcurrency: 1,
  timeoutMs: 12000,
  maxRetries: 2,
  memoryGuard: { enable: true, maxIframes: 3, maxHeapMB: 1024 },
});
const panel2Status = computed(() => loader.items.panel2?.status || 'queued');
const panel3Status = computed(() => loader.items.panel3?.status || 'queued');

const getIframeByPanelId = (id) => {
  const root = pageRef.value;
  if (!root) return null;
  return root.querySelector(`iframe[data-panel="${id}"]`);
};

const hydrateIframeContext = (iframeEl) => {
  if (!iframeEl) return;
  // Apply CSS/theme injection for DOM look
  if (isDark.value) removeLightThemeFromIframe(iframeEl);
  else injectLightThemeIntoIframe(iframeEl);
  // Send host override lock with current theme
  sendThemeOverrideToIframe(iframeEl, isDark.value ? 'dark' : 'light', true);
  // Language and panel info
  syncLanguageToIframe(iframeEl);
  syncPanelInfoToIframe(iframeEl);
};

const onPanel1Loaded = () => {
  panel1Loaded.value = true;
  // Ensure theme/ctx applied to freshly loaded panel1
  hydrateIframeContext(getIframeByPanelId('panel1'));
};

const onPanel2Loaded = () => {
  panel2Loaded.value = true;
  loader.notifyLoaded('panel2');
  // Ensure theme/ctx applied to panel2
  hydrateIframeContext(getIframeByPanelId('panel2'));
};

const onPanel3Loaded = () => {
  panel3Loaded.value = true;
  loader.notifyLoaded('panel3');
  // Ensure theme/ctx applied to panel3
  hydrateIframeContext(getIframeByPanelId('panel3'));
};

// ============== 面板尺寸持久化与首屏无动画 ==============
const STORAGE_KEY = 'ae_preview_split_sizes';
const DEFAULT_SIZES = Object.freeze({ left: 66, top: 50, bottom: 50 });
const sizes = ref({ ...DEFAULT_SIZES });
const suppressAnim = ref(true);

const loadSizes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.left === 'number') sizes.value.left = parsed.left;
    if (typeof parsed.top === 'number') sizes.value.top = parsed.top;
    if (typeof parsed.bottom === 'number') sizes.value.bottom = parsed.bottom;
  } catch {}
};

const saveSizes = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes.value));
  } catch {}
};

const handleOuterResized = (e) => {
  try {
    const panes = e?.panes || [];
    if (panes[0] && typeof panes[0].size === 'number') {
      sizes.value.left = Math.round(panes[0].size);
      // 右侧自动为 100 - left，无需单独保存
      saveSizes();
    }
  } catch {}
};

const handleInnerResized = (e) => {
  try {
    const panes = e?.panes || [];
    if (panes[0] && typeof panes[0].size === 'number') sizes.value.top = Math.round(panes[0].size);
    if (panes[1] && typeof panes[1].size === 'number') sizes.value.bottom = Math.round(panes[1].size);
    saveSizes();
  } catch {}
};

// 重置到默认布局并保存，且临时关闭动画避免跳变
const resetLayoutToDefault = () => {
  suppressAnim.value = true;
  sizes.value = { ...DEFAULT_SIZES };
  saveSizes();
  requestAnimationFrame(() => { suppressAnim.value = false; });
};

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
      
      // Host-driven override: follow site theme and lock
      sendThemeOverrideToIframe(f, isDark.value ? 'dark' : 'light', true);

      // Send current language to iframe
      syncLanguageToIframe(f);
      
      // Send panel info to iframe
      syncPanelInfoToIframe(f);
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

// Function to send panel info to iframe
const syncPanelInfoToIframe = (iframe) => {
  if (iframe && iframe.contentWindow) {
    const panelId = iframe.getAttribute('data-panel');
    if (panelId) {
      iframe.contentWindow.postMessage({
        type: 'PANEL_INFO',
        panelId: `com.yanrouya.eagle2ae.${panelId}`,
        panelName: panelLabels.value[panelId]
      }, '*');
    }
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
  // 先加载上次尺寸，避免初始从 50/50 跳到目标尺寸
  loadSizes();
  gsap.set(pageRef.value, { opacity: 0, y: 12 });
  gsap.to(pageRef.value, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  applyIframeTheme();
  bindIframeLoadHandlers();
  // 从 AE 扩展 manifest 读取面板显示名称
  loadPanelLabelsFromManifest();
  
  // Setup message listener for communication from iframes
  window.addEventListener('message', handleMessageFromIframe);
  
  // 监听主题切换事件
  window.addEventListener('themeToggle', handleThemeToggle);
  // 监听来自 Navbar 的重置布局事件
  window.addEventListener('reset-ae-layout', resetLayoutToDefault);
  
  // Sync language after a short delay to ensure iframes are loaded
  setTimeout(syncLanguageToAllIframes, 100);

  // Enforce AE extension to light theme with lock as soon as iframes are ready
  setTimeout(() => {
    if (pageRef.value) {
      sendThemeOverrideToAllIframes(pageRef.value, isDark.value ? 'dark' : 'light', true);
    }
  }, 150);

  // 下一帧移除分割面板动画抑制
  requestAnimationFrame(() => { suppressAnim.value = false; });
});

onBeforeUnmount(() => {
  cleanupFns.splice(0).forEach((fn) => {
    try { fn(); } catch (_) {}
  });
  // Unlock theme for safety (iframes may persist briefly)
  if (pageRef.value) {
    sendThemeUnlockToAllIframes(pageRef.value);
  }
  
  // Remove message listener
  window.removeEventListener('message', handleMessageFromIframe);
  window.removeEventListener('themeToggle', handleThemeToggle);
  window.removeEventListener('reset-ae-layout', resetLayoutToDefault);
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

  // 同步宿主锁定到扩展侧，保持与站点主题一致
  if (pageRef.value) {
    sendThemeOverrideToAllIframes(pageRef.value, newValue ? 'dark' : 'light', true);
  }
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

// Register panels with loader after mount
onMounted(() => {
  // Register panel2/3 for IO-based scheduling. Only panel1 loads immediately.
  loader.register('panel2', panel2ContainerRef.value, shouldLoadPanel2);
  loader.register('panel3', panel3ContainerRef.value, shouldLoadPanel3);
});

function activatePanel(id) {
  if (id === 'panel2') shouldLoadPanel2.value = true;
  if (id === 'panel3') shouldLoadPanel3.value = true;
  loader.activate(id);
}

function retryPanel(id) {
  loader.retry(id);
}
</script>

<style scoped>
/* 关闭分割面板的过渡动画（用于首帧或重置时） */
.no-anim .splitpanes__pane,
.no-anim .splitpanes__splitter {
  transition: none !important;
}

/* 300ms fade for placeholder mount/unmount */
.fade300-enter-active,
.fade300-leave-active { transition: opacity 0.7s cubic-bezier(.25,.8,.25,1); }
.fade300-enter-from,
.fade300-leave-to { opacity: 0; }
</style>
