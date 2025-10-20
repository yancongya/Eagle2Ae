<template>
  <section class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <Hero ref="heroRef" @scroll-to-feature="scrollToFeatureById" />
    <div class="container mx-auto px-6">
      <FeatureDetail
        v-for="(f, i) in features"
        :key="f.id"
        ref="featureRefs"
        :id="f.id"
        :title="f.title"
        :description-lines="f.descriptionLines"
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
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
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

      imageUrls: [

        '/images/features/feature-drag-import.png',

        '/images/features/feature-import-mode.png',

        '/images/features/feature-import-behavior.png',

        '/images/features/feature-export-layer.png',

        '/images/features/feature-presets.png',

      ],

    },

    {

      id: 'feature-format-support',

      title: featureMessages.formatSupport.title,

      descriptionLines: featureMessages.formatSupport.desc,

      imageUrls: [

        '/images/features/feature-import-mode.png',

        '/images/features/feature-presets.png',

        '/images/features/feature-drag-import.png',

        '/images/features/feature-export-layer.png',

        '/images/features/feature-import-behavior.png',

      ],

    },

    {

      id: 'feature-smart-options',

      title: featureMessages.smartOptions.title,

      descriptionLines: featureMessages.smartOptions.desc,

      imageUrls: [

        '/images/features/feature-import-behavior.png',

        '/images/features/feature-presets.png',

        '/images/features/feature-export-layer.png',

        '/images/features/feature-drag-import.png',

        '/images/features/feature-import-mode.png',

      ],

    },

    {

      id: 'feature-auto-sync',

      title: featureMessages.autoSync.title,

      descriptionLines: featureMessages.autoSync.desc,

      imageUrls: [

        '/images/features/feature-export-layer.png',

        '/images/features/feature-drag-import.png',

        '/images/features/feature-import-mode.png',

        '/images/features/feature-import-behavior.png',

        '/images/features/feature-presets.png',

      ],

    },

    {

      id: 'feature-presets',

      title: featureMessages.presets.title,

      descriptionLines: featureMessages.presets.desc,

      imageUrls: [

        '/images/features/feature-presets.png',

        '/images/features/feature-import-mode.png',

        '/images/features/feature-drag-import.png',

        '/images/features/feature-export-layer.png',

        '/images/features/feature-import-behavior.png',

      ],

    },

    {

      id: 'feature-performance',

      title: featureMessages.performance.title,

      descriptionLines: featureMessages.performance.desc,

      imageUrls: [

        '/images/features/feature-import-mode.png',

        '/images/features/feature-export-layer.png',

        '/images/features/feature-presets.png',

        '/images/features/feature-drag-import.png',

        '/images/features/feature-import-behavior.png',

      ],

    },

  ];

});

// ===== 分页滚动（Wheel Threshold Paging） =====
let snapTrigger; // 保留，分页启用时会 kill，移动端可回退使用
let pagingEnabled = false;
let isAnimating = false;
let deltaYAcc = 0;
let accDecayTimer = null;
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
let initialRevealAttempts = 0;
const attemptInitialReveal = () => {
  const MAX = 10;
  const DELAY_MS = 80;
  const tryReveal = () => {
    collectAnchors();
    const haveSections = anchors.length >= 2 && Array.isArray(featureRefs.value) && featureRefs.value.length > 0;
    if (haveSections) {
      revealCurrentSectionImmediately();
    } else if (initialRevealAttempts < MAX) {
      initialRevealAttempts++;
      setTimeout(tryReveal, DELAY_MS);
    }
  };
  tryReveal();
};
// 在刷新或首次渲染时，立即让当前可见段落进场，避免空白
const revealCurrentSectionImmediately = () => {
  // 优先使用视口检测，确保在子组件初始 gsap.set 之后也触发
  const triggerVisibleEnter = () => {
    const idxNow = getCurrentIndexByViewport();
    if (idxNow === 0) return;
    const refsNow = getCompRefs();
    const compNow = refsNow[idxNow];
    if (compNow && typeof compNow.playEnter === 'function') compNow.playEnter(0);
  };
  // 立即触发一次
  triggerVisibleEnter();
  // 在下一帧再次触发（确保 DOM/padding/图片尺寸稳定后）
  requestAnimationFrame(() => triggerVisibleEnter());
  // 在短延时后再触发一次（兜底处理子组件 nextTick 内的 gsap.set）
  setTimeout(() => triggerVisibleEnter(), 120);
};
// 在滚动动画完成后，统一触发进/出场（可选延迟）
const triggerEnterExitAfterScroll = (prevIdx, nextIdx, delay = 0) => {
  const refs = getCompRefs();
  const prevComp = refs[prevIdx];
  const nextComp = refs[nextIdx];
  const isPrevHero = prevIdx === 0;
  const isNextHero = nextIdx === 0;
  if (!isPrevHero && prevComp && typeof prevComp.playExit === 'function') prevComp.playExit(delay);
  if (!isNextHero && nextComp && typeof nextComp.playEnter === 'function') nextComp.playEnter(delay);
};

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
const scrollToIndex = (idx, prevIdx = getCurrentIndex()) => {
  isAnimating = true;
  let enterTriggered = false;
  gsap.to(window, {
    duration: 1.1,
    ease: 'power2.inOut',
    scrollTo: { y: positions[idx], autoKill: true },
    onStart: () => {
      const refs = getCompRefs();
      const prevComp = refs[prevIdx];
      const isPrevHero = prevIdx === 0;
      // Hero 不参与退场
      if (!isPrevHero && prevComp && typeof prevComp.playExit === 'function') prevComp.playExit(0);
    },
    onUpdate: function () {
       if (!enterTriggered && this.progress() >= 0.5) {
         enterTriggered = true;
         const refs = getCompRefs();
         const isNextHero = idx === 0;
         if (!isNextHero) {
           const nextComp = refs[idx];
           if (nextComp && typeof nextComp.playEnter === 'function') nextComp.playEnter(0);
         }
       }
     },
    onComplete: () => {
      isAnimating = false;
      if (!enterTriggered) {
        const refs = getCompRefs();
        const isNextHero = idx === 0;
        if (!isNextHero) {
          const nextComp = refs[idx];
          if (nextComp && typeof nextComp.playEnter === 'function') nextComp.playEnter(0);
        }
      }
    }
  });
};
const onWheel = (e) => {
  if (!pagingEnabled) return;
  // 拦截默认滚动，防止跟随页面滚动
  e.preventDefault();
  if (isAnimating) return;

  deltaYAcc += e.deltaY;
  // 若短时间内未继续滚动，重置累计量，避免误触发
  if (accDecayTimer) clearTimeout(accDecayTimer);
  accDecayTimer = setTimeout(() => { deltaYAcc = 0; }, 250);

  const THRESHOLD = Math.max(220, Math.floor(window.innerHeight * 0.25)); // 至少220px或视口25%
  if (Math.abs(deltaYAcc) >= THRESHOLD) {
    const dir = deltaYAcc > 0 ? 1 : -1; // 下/上
    deltaYAcc = 0;
    const cur = getCurrentIndex();
    const next = Math.min(positions.length - 1, Math.max(0, cur + dir));
    if (next !== cur) scrollToIndex(next, cur);
  }
};

const enablePaging = () => {
  pagingEnabled = true;
  navHeight = readNavHeight();
  collectAnchors();
  // 禁用原 Snap，避免冲突
  if (snapTrigger) { snapTrigger.kill(); snapTrigger = null; }
  // 在 window 与 document 同步监听，确保各浏览器场景均可拦截滚轮
  window.addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('wheel', onWheel, { passive: false });
};
const disablePaging = () => {
  pagingEnabled = false;
  window.removeEventListener('wheel', onWheel);
  document.removeEventListener('wheel', onWheel);
  deltaYAcc = 0;
  if (accDecayTimer) { clearTimeout(accDecayTimer); accDecayTimer = null; }
};

// 仍保留 Snap 作为小屏（<1024px）的回退方案
const buildSnap = () => {
  if (window.innerWidth >= 1024) {
    if (snapTrigger) { snapTrigger.kill(); snapTrigger = null; }
    return;
  }

  // 计算当前锚点的 clamp 列表与 maxY
  const computeClamped = () => {
    const navbarHeight = readNavHeight();
    const hero = document.getElementById('hero-section');
    const frs = Array.isArray(featureRefs.value) ? featureRefs.value : [];
    const sections = frs.map(ref => ref?.$el || ref).filter(Boolean);
    const anchorsSmall = [hero, ...sections];

    const positionsSmall = anchorsSmall.map(el => {
      const top = el.offsetTop;
      return Math.max(0, top - navbarHeight);
    });
    const maxYVal = document.documentElement.scrollHeight - window.innerHeight;
    return { clamped: positionsSmall.map(y => Math.min(y, maxYVal)), maxY: maxYVal };
  };

  if (snapTrigger) snapTrigger.kill();
  let { clamped } = computeClamped();

  // 使用动态 end，避免刷新后端点不更新；刷新时仅更新数据，避免递归重建
  snapTrigger = ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    snap: (value) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!clamped || clamped.length === 0) return value; // 安全兜底：无锚点则不更改
      const y = value * max; // GSAP 传入的是进度(0-1)，需映射到像素
      const nearest = clamped.reduce((prev, curr) => {
        return Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev;
      }, clamped[0]);
      return nearest / max;
    },
    onRefresh: () => {
      const res = computeClamped();
      clamped = res.clamped; // 更新数据，不递归重建
    }
  });
};
const rebuild = () => {
  navHeight = readNavHeight();
  collectAnchors();
  if (window.innerWidth >= 1024) {
    enablePaging();
  } else {
    disablePaging();
    buildSnap();
  }
  attemptInitialReveal();
};

onMounted(async () => {
  await nextTick();
  rebuild();
  window.addEventListener('resize', rebuild);
});

onUnmounted(() => {
  window.removeEventListener('resize', rebuild);
  disablePaging();
  if (snapTrigger) { snapTrigger.kill(); snapTrigger = null; }
});
const scrollToFeatureById = (id) => {
  const idxInFeatures = features.value.findIndex(f => f.id === id);
  const targetIdx = idxInFeatures >= 0 ? idxInFeatures + 1 : 1; // anchors: [Hero, ...features]，找不到则回退到第一个功能段
  const prevIdx = getCurrentIndex();
  scrollToIndex(targetIdx, prevIdx);
};
</script>