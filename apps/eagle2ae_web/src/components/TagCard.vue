<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="block" :title="localizedTitle">
    <div ref="cardRef" data-card class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
      <img :src="faviconSrc" @error="onFaviconError" :alt="localizedTitle" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-contain flex-shrink-0 will-change-transform" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 truncate">{{ localizedTitle }}</h3>
          <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">→</span>
        </div>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{{ localizedDesc }}</p>
      </div>
    </div>
  </a>
  
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cardHoverAnim } from '../utils/gsapAnimations';

const props = defineProps({
  title: { type: [String, Object], required: true },
  desc: { type: [String, Object], default: '' },
  link: { type: String, required: true },
  defaultIcon: { type: String, default: '/home.svg' }
});

const { locale, t } = useI18n();
const cardRef = ref(null);
let hover;

const getLocalized = (val) => {
  if (!val) return '';
  if (typeof val === 'string') {
    // 如果是翻译键且存在则返回翻译，否则当作文本
    const translated = t(val);
    return translated && translated !== val ? translated : val;
  }
  if (typeof val === 'object') {
    const loc = locale.value;
    if (typeof val[loc] === 'string') return val[loc];
    if (typeof val['en-US'] === 'string') return val['en-US'];
    if (typeof val['zh-CN'] === 'string') return val['zh-CN'];
    const first = Object.values(val).find(v => typeof v === 'string');
    return typeof first === 'string' ? first : '';
  }
  return '';
};

const localizedTitle = computed(() => getLocalized(props.title));
const localizedDesc = computed(() => getLocalized(props.desc));

// favicon 优先；失败回退默认图标（先默认，后替换，避免首次空白导致闪烁）
const faviconSrc = ref(props.defaultIcon);
const buildFaviconUrl = () => {
  try {
    const u = new URL(props.link);
    return `${u.protocol}//${u.host}/favicon.ico`;
  } catch {
    return props.defaultIcon;
  }
};
const onFaviconError = () => { faviconSrc.value = props.defaultIcon; };

onMounted(() => {
  // 异步尝试加载 favicon，成功后替换，失败保留默认
  const url = buildFaviconUrl();
  try {
    const test = new Image();
    test.onload = () => { faviconSrc.value = url; };
    test.onerror = () => { faviconSrc.value = props.defaultIcon; };
    test.src = url;
  } catch { faviconSrc.value = props.defaultIcon; }
  hover = cardHoverAnim(cardRef.value);
  const el = cardRef.value;
  if (!el) return;
  const onEnter = () => hover.enter();
  const onLeave = () => hover.leave();
  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);
  // 保存以便卸载
  el.__onEnter = onEnter;
  el.__onLeave = onLeave;
});

onUnmounted(() => {
  const el = cardRef.value;
  if (!el) return;
  try {
    el.removeEventListener('mouseenter', el.__onEnter);
    el.removeEventListener('mouseleave', el.__onLeave);
  } catch {}
});
</script>

<style scoped>
/* 细节阴影通过 JS 控制，样式保持简洁，与 Tailwind 风格统一 */
</style>