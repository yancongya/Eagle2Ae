<template>
  <main class="bg-white dark:bg-gray-900 flex flex-col min-h-[calc(100vh-var(--navbar-height,0px))]">
    <div ref="pageRef" :style="[{ 'view-transition-name': 'preview' }, wrapperStyle]" class="flex flex-col">
      <section class="flex-1 min-h-0 w-full">
        <!-- Mobile: single preview (Panel 1) -->
        <div class="md:hidden h-full">
          <!-- 使用骨架屏 + 渐隐显示，移动端支持暂停/恢复第一个面板 -->
          <div
            ref="panel1ContainerRef"
            class="relative w-full h-full"
            :class="{ 'flash-border': panelFlash.panel1 }"
            :style="{ 'view-transition-name': 'pane-panel1' }"
          >
            <PanelFrame
              panel-id="panel1"
              :label="panelLabels.panel1"
              :src="panelSrc('panel1')"
              :loaded="panel1Loaded"
              :should-load="shouldLoadPanel1"
              variant="primary"
              @load="onPanel1Loaded"
            />
            <!-- 面板切换时的居中文案覆盖层（移动端也显示） -->
            <div v-if="panelSwitchOverlay.panel1?.visible" class="switch-overlay">
              <div class="switch-overlay__label">{{ panelSwitchOverlay.panel1.text }}</div>
            </div>
            <transition name="fade300">
              <PanelPlaceholder
                v-if="panel1Status === 'idle'"
                :panel-id="'panel1'"
                :label="panelLabels.panel1"
                :status="panel1Status"
                :mode="placeholderMode"
                :blur-radius="placeholderBlur"
                :enter-x="panelEnter.panel1?.x || null"
                :enter-y="panelEnter.panel1?.y || null"
                @activate="activatePanel('panel1')"
              />
            </transition>
          </div>
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
              <div ref="panel1ContainerRef" class="relative w-full h-full" :class="{ 'flash-border': panelFlash.panel1 }" :style="{ 'view-transition-name': 'pane-panel1' }">
                <PanelFrame 
                  panel-id="panel1"
                  :label="panelLabels.panel1"
                  :src="panelSrc('panel1')" 
                  :loaded="panel1Loaded"
                  :should-load="shouldLoadPanel1"
                  variant="primary"
                  @load="onPanel1Loaded"
                />
                <!-- 面板切换时的居中文案覆盖层 -->
                <div v-if="panelSwitchOverlay.panel1?.visible" class="switch-overlay">
                  <div class="switch-overlay__label">{{ panelSwitchOverlay.panel1.text }}</div>
                </div>
                <transition name="fade300">
                  <PanelPlaceholder
                    v-if="panel1Status === 'idle'"
                    :panel-id="'panel1'"
                    :label="panelLabels.panel1"
                    :status="panel1Status"
                    :mode="placeholderMode"
                    :blur-radius="placeholderBlur"
                    :enter-x="panelEnter.panel1?.x || null"
                    :enter-y="panelEnter.panel1?.y || null"
                    @activate="activatePanel('panel1')"
                  />
                </transition>
              </div>
            </pane>

            <!-- Right Pane (Container for vertical split) -->
            <pane :size="100 - sizes.left">
              <splitpanes horizontal @resized="handleInnerResized">
                <!-- Top-Right Pane (Panel 2 - 快速预览) -->
                <pane :size="sizes.top">
                  <div ref="panel2ContainerRef" class="relative w-full h-full" :class="{ 'flash-border': panelFlash.panel2 }" :style="{ 'view-transition-name': 'pane-panel2' }">
                <PanelFrame 
                  panel-id="panel2"
                  :label="panelLabels.panel2"
                  :src="panelSrc('panel2')" 
                  :loaded="panel2LoadedComputed"
                  :should-load="shouldLoadPanel2"
                  :hide-until-loaded="true"
                  :show-skeleton="false"
                  variant="secondary"
                  @load="onPanel2Loaded"
                />
                    <!-- 面板切换时的居中文案覆盖层 -->
                    <div v-if="panelSwitchOverlay.panel2?.visible" class="switch-overlay">
                      <div class="switch-overlay__label">{{ panelSwitchOverlay.panel2.text }}</div>
                    </div>
                    <transition name="fade300">
                      <PanelPlaceholder
                        v-if="panel2Status !== 'loaded'"
                        :panel-id="'panel2'"
                        :label="panelLabels.panel2"
                        :status="panel2Status"
                        :mode="placeholderMode"
                        :blur-radius="placeholderBlur"
                        :enter-x="panelEnter.panel2?.x || null"
                        :enter-y="panelEnter.panel2?.y || null"
                        @activate="activatePanel('panel2')"
                      />
                    </transition>
                  </div>
                </pane>
                <!-- Bottom-Right Pane (Panel 3 - 音频项目) -->
                <pane :size="sizes.bottom">
                  <div ref="panel3ContainerRef" class="relative w-full h-full" :class="{ 'flash-border': panelFlash.panel3 }" :style="{ 'view-transition-name': 'pane-panel3' }">
                <PanelFrame 
                  panel-id="panel3"
                  :label="panelLabels.panel3"
                  :src="panelSrc('panel3')" 
                  :loaded="panel3LoadedComputed"
                  :should-load="shouldLoadPanel3"
                  :hide-until-loaded="true"
                  :show-skeleton="false"
                  variant="tertiary"
                  @load="onPanel3Loaded"
                />
                    <!-- 面板切换时的居中文案覆盖层 -->
                    <div v-if="panelSwitchOverlay.panel3?.visible" class="switch-overlay">
                      <div class="switch-overlay__label">{{ panelSwitchOverlay.panel3.text }}</div>
                    </div>
                    <transition name="fade300">
                      <PanelPlaceholder
                        v-if="panel3Status !== 'loaded'"
                        :panel-id="'panel3'"
                        :label="panelLabels.panel3"
                        :status="panel3Status"
                        :mode="placeholderMode"
                        :blur-radius="placeholderBlur"
                        :enter-x="panelEnter.panel3?.x || null"
                        :enter-y="panelEnter.panel3?.y || null"
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
const wrapperStyle = computed(() => ({ height: 'calc(100vh - var(--navbar-height, 0px))' }));
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

  // Panel 1 支持暂停/恢复
  const shouldLoadPanel1 = ref(true);
  const shouldLoadPanel2 = ref(false);
  const shouldLoadPanel3 = ref(false);

// Hide PanelFrame skeleton until we actually start loading
const panel2LoadedComputed = computed(() => (shouldLoadPanel2.value ? panel2Loaded.value : true));
const panel3LoadedComputed = computed(() => (shouldLoadPanel3.value ? panel3Loaded.value : true));

// Placeholder preferences
const placeholderMode = ref('frosted'); // 'solid' | 'frosted' | 'empty'
const placeholderBlur = ref(18);

// Loader: sequential background loading with IO + memory guard
const panel1ContainerRef = ref(null);
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
// Panel 1 的占位状态（无需 loader）：
const panel1Status = computed(() => {
  if (!shouldLoadPanel1.value) return 'idle';
  return panel1Loaded.value ? 'loaded' : 'loading';
});
// 暂停时的占位层入场坐标（页面坐标）
const panelEnter = ref({ panel1: null, panel2: null, panel3: null });

// 面板切换时的闪框与居中文案反馈
const panelFlash = ref({ panel1: false, panel2: false, panel3: false });
const panelSwitchOverlay = ref({ panel1: null, panel2: null, panel3: null });

// 主面板（panel1）闪烁颜色循环：蓝色 → 橙色 → 紫色
const flashCycle = [
  { border: 'rgba(59, 130, 246, 0.85)', shadow: 'rgba(59, 130, 246, 0.25)' }, // blue-500
  { border: 'rgba(245, 158, 11, 0.85)', shadow: 'rgba(245, 158, 11, 0.25)' }, // amber-500
  { border: 'rgba(139, 92, 246, 0.85)', shadow: 'rgba(139, 92, 246, 0.25)' }  // purple-500
];
const flashIdx = ref(0);

const showSwitchFeedback = (paneId, targetId) => {
  try {
    const text = panelLabels.value?.[targetId] || targetId;
    // 如果是主面板，按循环设置闪烁颜色
    if (paneId === 'panel1' && panel1ContainerRef?.value) {
      flashIdx.value = (flashIdx.value + 1) % flashCycle.length;
      const palette = flashCycle[flashIdx.value];
      panel1ContainerRef.value.style.setProperty('--flash-color', palette.border);
      panel1ContainerRef.value.style.setProperty('--flash-shadow-color', palette.shadow);
    }
    panelFlash.value[paneId] = true;
    panelSwitchOverlay.value[paneId] = { visible: true, text };
    setTimeout(() => {
      panelFlash.value[paneId] = false;
      if (panelSwitchOverlay.value[paneId]) panelSwitchOverlay.value[paneId].visible = false;
    }, 1000);
  } catch (_) {}
};

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
  // 同时恢复默认面板顺序映射
  assignments.value = { ...DEFAULT_ASSIGNMENTS };
  saveAssignments();
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
    const paneId = iframe.getAttribute('data-panel');
    const assignedId = paneId ? (assignments.value[paneId] || paneId) : null;
    if (assignedId) {
      iframe.contentWindow.postMessage({
        type: 'PANEL_INFO',
        panelId: `com.yanrouya.eagle2ae.${assignedId}`,
        panelName: panelLabels.value[assignedId]
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
  // 加载每个 Pane 当前绑定的面板顺序（持久化）
  loadAssignments();
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

  // 渐进式自动加载面板2与面板3，避免初始空白占位
  // 面板1不使用队列，保持即时加载
  // 保持原始行为：仅 panel1 默认加载；panel2/3 等待用户点击占位层后再激活
  
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
    return;
  }
  // Demo: 点击扩展里的“演示模式”图标，请求宿主切换该 Pane 的面板（1→2→3）
  if (event?.data?.type === 'SWITCH_PANEL_REQUEST') {
    try {
      const root = pageRef.value;
      if (!root) return;
      const iframes = root.querySelectorAll('iframe');
      let paneId = null;
      for (const f of iframes) {
        if (f.contentWindow === event.source) {
          paneId = f.getAttribute('data-panel');
          break;
        }
      }
      if (!paneId) return;
      const sequence = ['panel1', 'panel2', 'panel3'];
      const current = assignments.value[paneId] || paneId;
      const idx = sequence.indexOf(current);
      const next = sequence[(idx + 1) % sequence.length];
      // 切换前触发闪框与居中文案反馈（800ms）
      showSwitchFeedback(paneId, next);
      const apply = () => {
        assignments.value[paneId] = next;
        saveAssignments();
      };
      const supports = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (supports) {
        try { document.startViewTransition(() => apply()); } catch { apply(); }
      } else {
        apply();
      }
    } catch {}
  }
  // Ctrl+Shift 点击扩展按钮：请求暂停当前 Pane，使其变为未加载状态
  if (event?.data?.type === 'PAUSE_PANEL_REQUEST') {
    try {
      const root = pageRef.value;
      if (!root) return;
      const iframes = root.querySelectorAll('iframe');
      let paneId = null;
      let clickX = null;
      let clickY = null;
      for (const f of iframes) {
        if (f.contentWindow === event.source) {
          paneId = f.getAttribute('data-panel');
          const rect = f.getBoundingClientRect();
          const cx = typeof event?.data?.clientX === 'number' ? event.data.clientX : rect.width / 2;
          const cy = typeof event?.data?.clientY === 'number' ? event.data.clientY : rect.height / 2;
          clickX = rect.left + cx;
          clickY = rect.top + cy;
          break;
        }
      }
      if (!paneId) return;
      // 记录占位层入场坐标，用于圆形遮罩动画
      panelEnter.value[paneId] = { x: clickX, y: clickY };
      const pause = () => {
        if (paneId === 'panel1') {
          shouldLoadPanel1.value = false;
          panel1Loaded.value = false;
        } else if (paneId === 'panel2') {
          shouldLoadPanel2.value = false;
          panel2Loaded.value = false;
          if (loader.items.panel2) {
            loader.items.panel2.activated = false;
            loader.items.panel2.status = 'idle';
          }
        } else if (paneId === 'panel3') {
          shouldLoadPanel3.value = false;
          panel3Loaded.value = false;
          if (loader.items.panel3) {
            loader.items.panel3.activated = false;
            loader.items.panel3.status = 'idle';
          }
        }
      };
      const supports = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (supports) {
        try { document.startViewTransition(() => pause()); } catch { pause(); }
      } else {
        pause();
      }
    } catch {}
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
  if (id === 'panel1') {
    shouldLoadPanel1.value = true;
    panelEnter.value.panel1 = null;
    return; // 面板1不使用 loader 队列
  }
  if (id === 'panel2') shouldLoadPanel2.value = true;
  if (id === 'panel3') shouldLoadPanel3.value = true;
  panelEnter.value[id] = null;
  loader.activate(id);
}

function retryPanel(id) {
  loader.retry(id);
}

// ================= 面板顺序持久化与 src 计算 =================
const ASSIGNMENT_STORAGE_KEY = 'ae_preview_assigned_panels';
const DEFAULT_ASSIGNMENTS = Object.freeze({ panel1: 'panel1', panel2: 'panel2', panel3: 'panel3' });
const assignments = ref({ ...DEFAULT_ASSIGNMENTS });

const loadAssignments = () => {
  try {
    const raw = localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    ['panel1', 'panel2', 'panel3'].forEach((k) => {
      const v = parsed?.[k];
      if (v === 'panel1' || v === 'panel2' || v === 'panel3') assignments.value[k] = v;
    });
  } catch {}
};

const saveAssignments = () => {
  try { localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments.value)); } catch {}
};

const panelSrc = (paneId) => {
  const assignedId = assignments.value[paneId] || paneId;
  return `/extensions/ae/index.html?panel=${assignedId}`;
};
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

/* View Transition: pane switch fade+scale for each pane */
@keyframes vt-fade-scale {
  from { opacity: 0; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
}

:root::view-transition-old(pane-panel1),
:root::view-transition-new(pane-panel1),
:root::view-transition-old(pane-panel2),
:root::view-transition-new(pane-panel2),
:root::view-transition-old(pane-panel3),
:root::view-transition-new(pane-panel3) {
  animation: vt-fade-scale 420ms ease-out;
}

/* 面板切换时闪框效果（800ms） */
.flash-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--flash-color, rgba(99, 102, 241, 0.85)); /* default indigo */
  border-radius: 10px;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 0 0 2px var(--flash-shadow-color, rgba(99, 102, 241, 0.35)), 0 8px 24px var(--flash-shadow-color, rgba(99, 102, 241, 0.25));
  animation: flashBox 1500ms ease-out forwards;
}

@keyframes flashBox {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* 面板切换居中文案覆盖层（800ms 渐隐） */
.switch-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: switchFade 1500ms ease-out forwards;
}
.switch-overlay__label {
  padding: 0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #111827; /* gray-900 */
}
:root.dark .switch-overlay__label { color: #F9FAFB; /* gray-50 */ }

@keyframes switchFade {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.985); }
}
</style>
