<template>
  <main class="bg-white dark:bg-gray-900">
    <div ref="pageRef" :style="[{ 'view-transition-name': 'preview' }, wrapperStyle]" class="flex flex-col">
      <section class="flex-1 min-h-0 w-full">
        <!-- Mobile: single preview -->
        <div class="md:hidden h-full">
          <PanelFrame
            panel-id="panel1"
            label="Eagle 预览 1"
            src="/extensions/eagle/index.html"
            :loaded="panel1Loaded"
            :should-load="true"
            variant="primary"
            @load="onPanel1Loaded"
          />
        </div>
        <!-- Desktop: three-pane preview -->
        <div class="hidden md:block h-full">
          <splitpanes :class="['default-theme', { 'no-anim': suppressAnim }]" style="height: 100%" @resized="handleOuterResized">
            <!-- Left Pane -->
            <pane :size="sizes.left">
              <div class="relative w-full h-full">
                <PanelFrame 
                  panel-id="panel1"
                  label="Eagle 预览 1"
                  src="/extensions/eagle/index.html" 
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
                <!-- Top-Right Pane -->
                <pane :size="sizes.top">
                  <div ref="panel2ContainerRef" class="relative w-full h-full">
                    <PanelFrame 
                      panel-id="panel2"
                      label="Eagle 预览 2"
                      src="/extensions/eagle/index.html" 
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
                        :label="'Eagle 预览 2'"
                        :status="panel2Status"
                        :mode="placeholderMode"
                        :blur-radius="placeholderBlur"
                        @activate="activatePanel('panel2')"
                      />
                    </transition>
                  </div>
                </pane>
                <!-- Bottom-Right Pane -->
                <pane :size="sizes.bottom">
                  <div ref="panel3ContainerRef" class="relative w-full h-full">
                    <PanelFrame 
                      panel-id="panel3"
                      label="Eagle 预览 3"
                      src="/extensions/eagle/index.html" 
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
                        :label="'Eagle 预览 3'"
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
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useDark } from '@vueuse/core';
import PanelFrame from '../components/PanelFrame.vue';
import PanelPlaceholder from '../components/PanelPlaceholder.vue';
import { injectLightThemeIntoIframe, removeLightThemeFromIframe } from '../utils/injectIframeLightTheme.js';
import { syncThemeToAllIframes } from '../utils/iframeThemeSync.js';
import { usePanelLoader } from '../composables/usePanelLoader.js';
import gsap from 'gsap';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { locale } = useI18n();
const pageRef = ref(null);
const wrapperStyle = computed(() => ({ height: '100vh' }));
const isDark = useDark({ storageKey: 'theme' });

// Keep track of iframe load cleanup handlers
const cleanupFns = [];

// 分步加载与加载状态
const panel1Loaded = ref(false);
const panel2Loaded = ref(false);
const panel3Loaded = ref(false);

const shouldLoadPanel2 = ref(false);
const shouldLoadPanel3 = ref(false);

// 在未开始加载前将 loaded 视为 true，以便保持 iframe 透明且不影响布局
const panel2LoadedComputed = computed(() => (shouldLoadPanel2.value ? panel2Loaded.value : true));
const panel3LoadedComputed = computed(() => (shouldLoadPanel3.value ? panel3Loaded.value : true));

// Eagle 预览占位层状态与参数（复刻 AE 效果）
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
const placeholderMode = ref('frosted');
const placeholderBlur = ref(18);

const broadcastThemeToAllIframes = () => {
  const root = pageRef.value;
  if (!root) return;
  const iframes = root.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  const theme = isDark.value ? 'dark' : 'light';
  iframes.forEach((iframe) => {
    try {
      iframe.contentWindow?.postMessage({ type: 'THEME_UPDATE', theme }, '*');
    } catch {}
  });
};

const onPanel1Loaded = async () => {
  panel1Loaded.value = true;
  // 立刻应用主题与语言到当前已存在 iframe
  applyIframeTheme();
  syncLanguageToAllIframes();
  broadcastThemeToAllIframes();
  // Eagle 预览：不自动激活其他面板，等待用户点击占位层
  await nextTick();
  bindIframeLoadHandlers();
};

const onPanel2Loaded = async () => {
  panel2Loaded.value = true;
  loader.notifyLoaded('panel2');
  applyIframeTheme();
  syncLanguageToAllIframes();
  broadcastThemeToAllIframes();
  // Eagle 预览：不自动激活第三面板，等待用户点击占位层
  await nextTick();
  bindIframeLoadHandlers();
};

const onPanel3Loaded = () => {
  panel3Loaded.value = true;
  loader.notifyLoaded('panel3');
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

// ============== 面板尺寸持久化与首屏无动画 ==============
const STORAGE_KEY = 'eagle_preview_split_sizes';
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

const resetLayoutToDefault = () => {
  suppressAnim.value = true;
  sizes.value = { ...DEFAULT_SIZES };
  saveSizes();
  requestAnimationFrame(() => { suppressAnim.value = false; });
};

onMounted(() => {
  // 恢复上次尺寸，避免首帧跳变
  loadSizes();
  gsap.set(pageRef.value, { opacity: 0, y: 12 });
  gsap.to(pageRef.value, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  applyIframeTheme();
  bindIframeLoadHandlers();
  
  // Setup message listener for communication from iframes
  window.addEventListener('message', handleMessageFromIframe);
  
  // 监听主题切换事件
  window.addEventListener('themeToggle', handleThemeToggle);
  // 监听重置事件
  window.addEventListener('reset-eagle-layout', resetLayoutToDefault);
  
  // Sync language after a short delay to ensure iframes are loaded
  setTimeout(syncLanguageToAllIframes, 100);

  // 下一帧打开动画
  requestAnimationFrame(() => { suppressAnim.value = false; });
});

// 注册面板到调度器：按需加载并管理占位层状态
onMounted(() => {
  loader.register('panel2', panel2ContainerRef.value, shouldLoadPanel2);
  loader.register('panel3', panel3ContainerRef.value, shouldLoadPanel3);
});

onBeforeUnmount(() => {
  cleanupFns.splice(0).forEach((fn) => {
    try { fn(); } catch (_) {}
  });
  
  // Remove message listener
  window.removeEventListener('message', handleMessageFromIframe);
  window.removeEventListener('themeToggle', handleThemeToggle);
  window.removeEventListener('reset-eagle-layout', resetLayoutToDefault);
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
  if (event.data && event.data.type === 'EAGLE_EXTENSION_LOADED') {
    // Send current language to the iframe that just loaded
    syncLanguageToAllIframes();
  }
};

// Handler for theme toggle events
const handleThemeToggle = (event) => {
  const { x, y, newTheme } = event.detail;
  syncThemeToAllIframes(pageRef.value, newTheme, { x, y });
};

// 点击占位层激活面板加载（在后面加载并保持占位层直至 loaded）
function activatePanel(id) {
  if (id === 'panel2') shouldLoadPanel2.value = true;
  if (id === 'panel3') shouldLoadPanel3.value = true;
  loader.activate(id);
}
</script>

<style scoped>
/* 关闭分割面板的过渡动画（用于首帧或重置时） */
.no-anim .splitpanes__pane,
.no-anim .splitpanes__splitter {
  transition: none !important;
}

/* 700ms fade for placeholder mount/unmount */
.fade300-enter-active,
.fade300-leave-active { transition: opacity 0.7s cubic-bezier(.25,.8,.25,1); }
.fade300-enter-from,
.fade300-leave-to { opacity: 0; }
</style>
