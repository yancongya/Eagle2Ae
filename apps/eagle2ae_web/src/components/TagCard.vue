<template>
  <a
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    class="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
    :title="titleAttributeContent"
  >
    <div
      data-card
      class="flex h-full items-center gap-3 rounded-lg border bg-slate-50 p-3 transition-all duration-200 ease-out dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-600 hover:scale-[1.04] hover:shadow-lg hover:border-blue-500/60 dark:hover:bg-neutral-800 active:scale-[1.02] active:shadow-md sm:gap-4 sm:p-4"
    >
      <img
        :src="faviconSrc"
        @error="onFaviconError"
        :alt="localizedTitle"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        class="h-8 w-8 flex-shrink-0 rounded-md object-contain sm:h-10 sm:w-10"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="truncate text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">{{ localizedTitle }}</h3>
          <span class="hidden text-xs text-gray-400 dark:text-gray-500 sm:inline">→</span>
        </div>
        <p class="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{{ localizedDesc }}</p>
      </div>
    </div>
  </a>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  title: { type: [String, Object], required: true },
  desc: { type: [String, Object], default: '' },
  link: { type: String, required: true },
  hoverDesc: { type: [String, Object], default: '' },
  defaultIcon: { type: String, default: '/home.svg' }
});

const { locale, t } = useI18n();

const getLocalized = (val) => {
  if (!val) return '';
  if (typeof val === 'string') {
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
const localizedHoverDesc = computed(() => getLocalized(props.hoverDesc));

// 决定 title 属性最终显示什么内容
const titleAttributeContent = computed(() => {
  return localizedHoverDesc.value || localizedTitle.value;
});

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
  const url = buildFaviconUrl();
  try {
    const test = new Image();
    test.onload = () => { faviconSrc.value = url; };
    test.onerror = () => { faviconSrc.value = props.defaultIcon; };
    test.src = url;
  } catch { faviconSrc.value = props.defaultIcon; }
});
</script>

<style scoped>
/* 交互效果现在由 Tailwind 的伪类 (hover, active, focus-visible) 控制 */
</style>