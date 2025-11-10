<template>
  <section class="min-h-[calc(100vh-var(--navbar-height,0px))] bg-gray-100 dark:bg-gray-900">
    <Hero ref="heroRef" @scroll-to-feature="scrollToFeatureById" />
    <div class="container mx-auto px-6">
      <FeatureDetail
        v-for="(f, i) in features"
        :key="f.id"
        ref="featureRefs"
        :id="f.id"
        :title="f.title"
        :description-lines="f.descriptionLines"
        :footer-text="f.footerText"
        :image-urls="f.imageUrls"
        :is-image-left="i % 2 === 0"
        :is-last="i === features.length - 1"
      />

      <div class="text-center mt-12">
        <router-link to="/download" class="text-indigo-600 dark:text-indigo-400 hover:underline">
          {{ t('home.downloadCta') }}
        </router-link>
      </div>
    </div>
    <Footer />
  </section>
</template>

<script setup>
import Hero from '@/components/Hero.vue';
import FeatureDetail from '@/components/FeatureDetail.vue';
import Footer from '@/components/Footer.vue';

// 大屏分页滚动：鼠标滚轮拦截，超过阈值后一次性滚动到下一锚点
import { ref, onMounted, onUnmounted, nextTick, computed, provide } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useI18n } from 'vue-i18n';

const { t, locale, tm } = useI18n();

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);



const features = computed(() => {

  // 依赖语言切换

  const _ = locale.value;

  const featureMessages = tm('home.features');



  return [

    {

      id: 'feature-drag-drop',

      title: featureMessages.dragDrop.title,

      descriptionLines: featureMessages.dragDrop.desc,

            footerText: 'home.features.dragDrop.footer',

                        imageUrls: [

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-import-mode.webp',

                          '/images/features/feature-import-behavior.webp',

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-presets.webp',

                        ],

                      },

                      {

                        id: 'feature-format-support',

                        title: featureMessages.formatSupport.title,

                        descriptionLines: featureMessages.formatSupport.desc,

                        footerText: 'home.features.formatSupport.footer',

                        imageUrls: [

                          '/images/features/feature-import-mode.webp',

                          '/images/features/feature-presets.webp',

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-import-behavior.webp',

                        ],

                      },

                      {

                        id: 'feature-smart-options',

                        title: featureMessages.smartOptions.title,

                        descriptionLines: featureMessages.smartOptions.desc,

                        footerText: 'home.features.smartOptions.footer',

                        imageUrls: [

                          '/images/features/feature-import-behavior.webp',

                          '/images/features/feature-presets.webp',

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-import-mode.webp',

                        ],

                      },

                      {

                        id: 'feature-auto-sync',

                        title: featureMessages.autoSync.title,

                        descriptionLines: featureMessages.autoSync.desc,

                        footerText: 'home.features.autoSync.footer',

                        imageUrls: [

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-import-mode.webp',

                          '/images/features/feature-import-behavior.webp',

                          '/images/features/feature-presets.webp',

                        ],

                      },

                      {

                        id: 'feature-presets',

                        title: featureMessages.presets.title,

                        descriptionLines: featureMessages.presets.desc,

                        footerText: 'home.features.presets.footer',

                        imageUrls: [

                          '/images/features/feature-presets.webp',

                          '/images/features/feature-import-mode.webp',

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-import-behavior.webp',

                        ],

                      },

                      {

                        id: 'feature-performance',

                        title: featureMessages.performance.title,

                        descriptionLines: featureMessages.performance.desc,

                        footerText: 'home.features.performance.footer',

                        imageUrls: [

                          '/images/features/feature-import-mode.webp',

                          '/images/features/feature-export-layer.webp',

                          '/images/features/feature-presets.webp',

                          '/images/features/feature-drag-import.webp',

                          '/images/features/feature-import-behavior.webp',

                        ],

          },

  ];

});

// ===== Lenis 驱动滚动（移除分页），使用 ScrollTrigger.snap 做柔和吸附 =====
let snapTrigger = null;
let anchors = [];
let positions = [];
let navHeight = 0;

// 组件 refs：与 anchors 顺序一致 [Hero, ...FeatureDetails]
const heroRef = ref(null);
const featureRefs = ref([]);
const getCompRefs = () => [heroRef.value, ...featureRefs.value];

// 通过视口检测获取当前应显示的段索引
const getCurrentIndexByViewport = () => {
  const navbarHeight = readNavHeight();
  const topThreshold = navbarHeight + 40;
  const viewportCenter = window.innerHeight / 2;
  const elems = anchors.filter(Boolean);
  if (!Array.isArray(elems) || elems.length === 0) return 0;

  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < elems.length; i++) {
    const el = elems[i];
    const rect = el.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, topThreshold));
    const centerDist = Math.abs((rect.top + rect.height / 2) - viewportCenter);
    const score = visibleHeight - centerDist * 0.2;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
};
// 移除 Home 统一进出场调度，改由各段自身 ScrollTrigger 控制

const readNavHeight = () => {
  const navVar = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '0px';
  return parseFloat(navVar) || 0;
};
// Navbar height helper
const getNavbarHeight = () => readNavHeight();

function collectAnchors() {
  const navbarHeight = readNavHeight();
  const hero = document.getElementById('hero-section');
  const frs = Array.isArray(featureRefs.value) ? featureRefs.value : [];
  const sections = frs.map(ref => ref?.$el || ref).filter(Boolean);
  anchors = [hero, ...sections];

  const pos = anchors.map(el => {
    const top = el.offsetTop;
    return Math.max(0, top - navbarHeight);
  });

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  positions = pos.map(y => Math.min(y, maxY));
}
const getCurrentIndex = () => {
  const y = window.scrollY;
  let idx = 0;
  let dist = Math.abs(positions[0] - y);
  for (let i = 1; i < positions.length; i++) {
    const d = Math.abs(positions[i] - y);
    if (d < dist) { dist = d; idx = i; }
  }
  return idx;
};
const scrollToIndex = (idx) => {
  const y = positions[idx] ?? 0;
  if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
    window.__lenis.scrollTo(y, { duration: 1.0 });
  } else {
    gsap.to(window, { duration: 1.0, ease: 'power2.inOut', scrollTo: { y } });
  }
};

// 移除分页开启/关闭逻辑与 overscrollBehavior 改写

// 启用 ScrollTrigger 的 snap 按锚点吸附（与 Lenis 平滑滚动兼容）
const buildSnap = () => {
  // 先计算一次当前 anchors 的像素位置
  const computeClamped = () => {
    const maxYVal = document.documentElement.scrollHeight - window.innerHeight;
    const clamped = positions.map(y => Math.min(y, maxYVal));
    return { clamped, maxY: maxYVal };
  };

  if (snapTrigger) snapTrigger.kill();
  let { clamped } = computeClamped();

  snapTrigger = ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    snap: (value) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!clamped || clamped.length === 0) return value;
      const y = value * max; // 进度 -> 像素
      const nearest = clamped.reduce((prev, curr) => (
        Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
      ), clamped[0]);
      return nearest / max; // 像素 -> 进度
    },
    onRefresh: () => {
      const res = computeClamped();
      clamped = res.clamped;
    }
  });
};
const rebuild = () => {
  navHeight = readNavHeight();
  collectAnchors();
  buildSnap();
};

onMounted(async () => {
  await nextTick();
  rebuild();
  window.addEventListener('resize', rebuild);
});

onUnmounted(() => {
  window.removeEventListener('resize', rebuild);
  if (snapTrigger) { snapTrigger.kill(); snapTrigger = null; }
});
const scrollToFeatureById = (id) => {
  const idxInFeatures = features.value.findIndex(f => f.id === id);
  const targetIdx = idxInFeatures >= 0 ? idxInFeatures + 1 : 1; // anchors: [Hero, ...features]，找不到则回退到第一个功能段
  scrollToIndex(targetIdx);
};
</script>
// 互斥：当前激活的详情区块
const activeFeatureId = ref(null);
const setActiveFeatureId = (id) => { activeFeatureId.value = id; };
provide('activeFeatureId', activeFeatureId);
provide('setActiveFeatureId', setActiveFeatureId);