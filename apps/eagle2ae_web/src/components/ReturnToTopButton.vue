<template>
  <button v-if="showButton" @click="scrollToTop"
          :style="{ bottom: bottomPx }"
          class="fixed right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg transition-opacity duration-300 hover:opacity-80 z-50 no-drag">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Helper to check for object type
const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item));

// Deep merge utility
const deepMerge = (target, source) => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

// Default configuration
const defaults = ref({
  animation: {
    duration: 0.8,
    ease: "power2.out"
  }
});

const externalConfig = ref({});
const opts = computed(() => deepMerge(defaults.value, externalConfig.value));


gsap.registerPlugin(ScrollToPlugin);

const showButton = ref(false);
const scrollThreshold = 200; // 距离顶部像素阈值
const baseBottom = 16;
const bottomOffset = ref(baseBottom);
const bottomPx = computed(() => `${bottomOffset.value}px`);

const updateBottomOffset = () => {
  const footers = Array.from(document.querySelectorAll('footer'));
  if (!footers.length) { bottomOffset.value = baseBottom; return; }
  let minTop = Infinity;
  for (const f of footers) {
    const rect = f.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      minTop = Math.min(minTop, rect.top);
    }
  }
  if (minTop === Infinity) { bottomOffset.value = baseBottom; return; }
  const pushUp = Math.max(baseBottom, Math.max(0, window.innerHeight - minTop) + baseBottom);
  bottomOffset.value = pushUp;
};
const footerVisible = ref(false);
let footerObserver = null;
let domObserver = null;

const handleScroll = () => {
  showButton.value = window.scrollY > scrollThreshold;
  updateBottomOffset();
};

const scrollToTop = () => {
  gsap.to(window, { duration: opts.value.animation.duration, scrollTo: 0, ease: opts.value.animation.ease });
};

const attachFooterObserver = () => {
  if (!('IntersectionObserver' in window)) return;
  const footers = Array.from(document.querySelectorAll('footer'));
  if (!footers.length) return;
  if (footerObserver) footerObserver.disconnect();
  footerObserver = new IntersectionObserver((entries) => {
    footerVisible.value = entries.some(e => e.isIntersecting);
    updateBottomOffset();
  }, { root: null, threshold: 0 });
  footers.forEach(f => footerObserver.observe(f));
};

const observeDomForFooters = () => {
  if (!('MutationObserver' in window)) return;
  domObserver = new MutationObserver(() => { attachFooterObserver(); });
  domObserver.observe(document.body, { childList: true, subtree: true });
};

onMounted(async () => {
  try {
    const res = await fetch('/config/return-to-top.json', { cache: 'no-store' });
    if (res.ok) {
      externalConfig.value = await res.json();
    }
  } catch (e) {
    console.warn('ReturnToTopButton config not found, using defaults.', e);
  }

  window.addEventListener('scroll', handleScroll);
  attachFooterObserver();
  observeDomForFooters();
  // 初始化一次显示与位置
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (footerObserver) footerObserver.disconnect();
  if (domObserver) domObserver.disconnect();
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>