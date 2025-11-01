<template>
  <section id="hero-section" class="min-h-[calc(100vh-var(--navbar-height,0px))] min-h-[calc(100dvh-var(--navbar-height,0px))] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative" style="scroll-margin-top: var(--navbar-height, 0px)">
    <!-- Centering Container: use normal flow to avoid overlap with next section -->
    <div ref="heroInnerRef" class="w-full max-w-screen-2xl px-6" :style="innerStyle">

      <!-- Inner container with adjusted top padding -->
      <div class="pt-8 md:pt-24">
        <!-- Top Part: Title & Buttons -->
        <div class="text-center max-w-4xl mx-auto">
          <div class="overflow-hidden">
            <h1 ref="title" 
                class="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-4 cursor-pointer"
                @mouseenter="toggleTitle">
              <span class="title-part" data-role="eagle">Eagle</span>
              <span class="title-arrow mx-1" data-role="arrow" aria-hidden="true">👉</span>
              <span class="title-part" data-role="ae">AE</span>
              <span class="title-part"> {{ t('hero.bridge') }} </span>
            </h1>
          </div>
          <p ref="subtitle" class="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
            {{ t('hero.subtitle') }}
          </p>
          <div ref="buttons" class="space-x-4">
            <router-link to="/ae-preview" class="inline-flex justify-center w-36 md:w-44 px-4 py-2 text-base md:text-lg font-bold transition-all duration-300 transform rounded-xl hover:scale-105 has-sweep-light whitespace-nowrap"
                         style="background-color: var(--btn-ae-bg); border: 3px solid var(--btn-ae-border); color: var(--btn-ae-text);">
              {{ t('nav.aePreview') }}
            </router-link>
            <router-link to="/eagle-preview" class="inline-flex justify-center w-36 md:w-44 px-4 py-2 text-base md:text-lg font-bold transition-all duration-300 transform rounded-xl hover:scale-105 has-sweep-light whitespace-nowrap"
                         style="background-color: var(--btn-eagle-bg); border: 3px solid var(--btn-eagle-border); color: var(--btn-eagle-text);">
              {{ t('nav.eaglePreview') }}
            </router-link>
          </div>
        </div>

        <!-- Bottom Part: Feature Cards (Balanced Size) -->
        <div ref="cardsContainer" class="mx-auto mt-12 md:mt-24 w-full">
           <div class="grid grid-cols-3 lg:grid-cols-6 gap-6 md:gap-5 lg:gap-6" :style="{ perspective: '900px' }">
            <div v-for="(feature, index) in features" :key="feature.id"
                 :ref="el => { if (el) cardRefs[index] = el }"
                 @mouseenter="onCardEnter(feature.id)"
                 @mouseleave="onCardLeave"
                 :style="{ zIndex: hoveredCardId === feature.id ? 10 : 1 }"
                 class="flex flex-col items-center text-center cursor-pointer opacity-0 transition-all duration-300">
              <div @click="scrollTo(feature.id)"
                   :style="cardStyle(index)"
                   class="relative block rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg transition-all duration-300 bg-white/50 dark:bg-gray-800/50 aspect-[3/4] w-full">
                <img :src="feature.iconUrl" :alt="feature.title" class="absolute inset-0 h-full w-full object-cover rounded-xl md:rounded-2xl">
              </div>
              <h3 class="mt-2 font-bold text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">{{ feature.title }}</h3>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useI18n } from 'vue-i18n';

// Helper to check for object type
const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item));

// Deep merge utility to combine default and external configurations
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

// Default configuration for hero card interactions
const defaults = ref({
  transition: {
    durationMs: 420,
    timingFunction: 'cubic-bezier(.23,1,.32,1)'
  },
  hovered: {
    scale: 1.10,
    shadow: '0 24px 48px rgba(0,0,0,0.35)',
    yOffset: -24
  },
  unhovered: {
    cascadeDelayMs: 25,
    maxScaleReduction: 0.30,
    maxZDepth: -80,
    maxOpacityReduction: 0.70,
    maxBlurPx: 6,
    maxDownwardYOffset: 16
  },
  leaveDelayMs: 110
});

const externalConfig = ref({});
const opts = computed(() => deepMerge(defaults.value, externalConfig.value));


const { t, locale } = useI18n();

const emit = defineEmits(['scroll-to-feature']);

gsap.registerPlugin(ScrollToPlugin);

// Animation Refs
const title = ref(null);
const heroInnerRef = ref(null);
const scale = ref(1);
const innerStyle = computed(() => ({ transform: `scale(${scale.value})`, transformOrigin: 'top center' }));
let heroResizeObserver;
const readNavHeight = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '0px';
  return parseFloat(v) || 0;
};
const computeScale = () => {
  const el = heroInnerRef.value;
  if (!el) { scale.value = 1; return; }
  const available = Math.max(0, window.innerHeight - readNavHeight());
  const rect = el.getBoundingClientRect();
  const contentHeight = rect.height || available;
  const s = Math.min(1, available / contentHeight);
  scale.value = Math.max(0.75, s);
};
onMounted(async () => {
  await nextTick();
  computeScale();
  window.addEventListener('resize', computeScale);
  if ('ResizeObserver' in window && heroInnerRef.value) {
    heroResizeObserver = new ResizeObserver(computeScale);
    heroResizeObserver.observe(heroInnerRef.value);
  }
});
onUnmounted(() => {
  window.removeEventListener('resize', computeScale);
  if (heroResizeObserver) heroResizeObserver.disconnect();
});
const subtitle = ref(null);
const buttons = ref(null);
const cardsContainer = ref(null);
const cardRefs = ref([]); // To hold refs for each card

// Hover state
let hoverClearTimer = null;

const onCardEnter = (id) => {
  if (hoverClearTimer) { clearTimeout(hoverClearTimer); hoverClearTimer = null; }
  hoveredCardId.value = id;
};
const onCardLeave = () => {
  if (hoverClearTimer) { clearTimeout(hoverClearTimer); }
  hoverClearTimer = setTimeout(() => {
    hoveredCardId.value = null;
    hoverClearTimer = null;
  }, opts.value.leaveDelayMs);
};
const hoveredCardId = ref(null);
const isTitleFlipped = ref(false);
const hasPlayedOnce = ref(false);

// 计算当前悬浮卡片索引
const hoveredIndex = computed(() => {
  if (!hoveredCardId.value) return -1;
  return features.value.findIndex(f => f.id === hoveredCardId.value);
});

// 基于与悬浮卡片的距离，计算缩放与 Z 轴位移样式
const cardStyle = (index) => {
  const sel = hoveredIndex.value;
  const transition = {
    transitionTimingFunction: opts.value.transition.timingFunction,
    transitionDuration: `${opts.value.transition.durationMs}ms`,
    transitionProperty: 'transform, opacity, box-shadow, filter'
  };
  if (sel < 0) {
    return {
      transform: 'translateY(0) scale(1) translateZ(0)',
      opacity: 1,
      filter: 'blur(0px)',
      transformStyle: 'preserve-3d',
      willChange: 'transform, opacity, box-shadow, filter',
      ...transition
    };
  }
  const maxDist = Math.max(sel, features.value.length - 1 - sel);
  const dist = Math.abs(index - sel);
  const delayBase = opts.value.unhovered.cascadeDelayMs;
  const delayMs = `${Math.round(dist * delayBase)}ms`;

  if (dist === 0) {
    return {
      transform: `translateY(${opts.value.hovered.yOffset}px) scale(${opts.value.hovered.scale}) translateZ(0)`,
      opacity: 1,
      boxShadow: opts.value.hovered.shadow,
      filter: 'blur(0px)',
      transformStyle: 'preserve-3d',
      willChange: 'transform, opacity, box-shadow, filter',
      transitionDelay: '0ms',
      ...transition
    };
  }

  const t = maxDist === 0 ? 1 : dist / maxDist; // 0: 最近；1: 最远
  const easeInCubic = (x) => x * x * x;
  const u = easeInCubic(t);
  const scale = 1 - opts.value.unhovered.maxScaleReduction * u;
  const z = opts.value.unhovered.maxZDepth * u;
  const y = opts.value.unhovered.maxDownwardYOffset * u; // New downward offset logic
  const opacity = 1 - opts.value.unhovered.maxOpacityReduction * u;
  const blurMax = opts.value.unhovered.maxBlurPx;
  const blurPx = blurMax * u;

  return {
    transform: `translateY(${y}px) scale(${scale}) translateZ(${z}px)`,
    opacity,
    filter: `blur(${blurPx}px)`,
    transformStyle: 'preserve-3d',
    willChange: 'transform, opacity, box-shadow, filter',
    transitionDelay: delayMs,
    ...transition
  };
};
// Card Data & Scroll Logic
const features = computed(() => {
  // Depend on locale to re-compute when language changes
  const _ = locale.value;
  return [
    { id: 'feature-drag-drop', title: t('hero.featuresTitles.dragDrop'), iconUrl: '/images/features/feature-drag-import.png' },
    { id: 'feature-format-support', title: t('hero.featuresTitles.formatSupport'), iconUrl: '/images/features/feature-import-mode.png' },
    { id: 'feature-smart-options', title: t('hero.featuresTitles.smartOptions'), iconUrl: '/images/features/feature-import-behavior.png' },
    { id: 'feature-auto-sync', title: t('hero.featuresTitles.autoSync'), iconUrl: '/images/features/feature-export-layer.png' },
    { id: 'feature-presets', title: t('hero.featuresTitles.presets'), iconUrl: '/images/features/feature-presets.png' },
    { id: 'feature-performance', title: t('hero.featuresTitles.performance'), iconUrl: '/images/features/feature-import-mode.png' },
  ];
});

const scrollTo = (id) => {
  emit('scroll-to-feature', id);
};

// Helper function to split text into words and wrap them in spans
const splitTextIntoWords = (element) => {
  if (!element) return [];

  const text = element.textContent;
  element.innerHTML = ''; // Clear original content

  const words = text.split(' ');
  const wordSpans = [];

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.textContent = word;
    wordSpan.style.display = 'inline-block'; // Important for animation
    wordSpan.style.marginRight = '0.25em'; // Add some space between words
    element.appendChild(wordSpan);
    wordSpans.push(wordSpan);
  });
  return wordSpans;
};

// Helper function to split text into characters and wrap them in spans
const splitTextIntoChars = (element) => {
  if (!element) return [];

  const text = element.textContent;
  element.innerHTML = ''; // Clear original content

  const chars = text.split(''); // Split by characters
  const charSpans = [];

  chars.forEach((char, index) => {
    const charSpan = document.createElement('span');
    charSpan.textContent = char === ' ' ? '\u00A0' : char; // Preserve space
    charSpan.style.display = 'inline-block'; // Important for animation
    element.appendChild(charSpan);
    charSpans.push(charSpan);
  });
  return charSpans;
};

const buildEnterTimeline = async () => {
  const subtitleWords = splitTextIntoWords(subtitle.value);
  await nextTick();
  gsap.set([title.value, ...subtitleWords, buttons.value, cardRefs.value], { opacity: 0, y: 30 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(title.value, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0)
    .to(cardRefs.value, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, 0.2)
    .to(subtitleWords, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }, 0.4)
    .to(buttons.value, { y: 0, opacity: 1, duration: 0.6 }, 0.65);
};

onMounted(async () => {
  try {
    const res = await fetch('/config/hero-cards.json', { cache: 'no-store' });
    if (res.ok) {
      externalConfig.value = await res.json();
    }
  } catch (e) {
    console.warn('Hero cards config not found, using defaults.', e);
  }

  await buildEnterTimeline();
  hasPlayedOnce.value = true;
});

const playEnter = (delay = 0) => {
  gsap.delayedCall(delay, () => {
    if (!hasPlayedOnce.value) {
      buildEnterTimeline();
      hasPlayedOnce.value = true;
    }
  });
};
const playExit = (delay = 0) => {
  gsap.to([title.value, buttons.value, cardRefs.value], { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in', delay });
};

defineExpose({ playEnter, playExit });

// Title hover toggle functions
const flipText3D = (el, newText) => {
  if (!el) return;
  gsap.killTweensOf(el);
  gsap.to(el, {
    duration: 0.25,
    rotationY: 90,
    transformPerspective: 600,
    transformOrigin: '50% 50%',
    ease: 'power2.in',
    onComplete: () => {
      el.textContent = newText;
      gsap.set(el, { rotationY: -90 });
      gsap.to(el, {
        duration: 0.35,
        rotationY: 0,
        ease: 'power2.out'
      });
    }
  });
};

const applyTitleState = (flip) => {
  if (!title.value) return;
  const eaglePart = title.value.querySelector('[data-role="eagle"]');
  const aePart = title.value.querySelector('[data-role="ae"]');
  const arrowPart = title.value.querySelector('[data-role="arrow"]');

  if (flip) {
    flipText3D(eaglePart, 'AE');
    flipText3D(aePart, 'Eagle');
    flipText3D(arrowPart, '👈');
  } else {
    flipText3D(eaglePart, 'Eagle');
    flipText3D(aePart, 'AE');
    flipText3D(arrowPart, '👉');
  }
};

const toggleTitle = () => {
  isTitleFlipped.value = !isTitleFlipped.value;
  applyTitleState(isTitleFlipped.value);
};

// Title reset function is no longer needed with hover toggle
// const resetTitleAnimation = () => {};

// Watch for container width changes and update the cards animation accordingly
watch(cardsContainer, (newVal) => {
  if (newVal) {
    gsap.set(cardRefs.value, { clearProps: 'all' });
  }
});
</script>

<style scoped>
  #hero-section {
    --btn-ae-bg: rgb(156, 152, 255);
    --btn-ae-border: rgb(81, 61, 197);
    --btn-ae-text: rgb(4, 1, 91);
    --btn-eagle-bg: rgb(177, 213, 255);
    --btn-eagle-border: rgb(36, 116, 221);
    --btn-eagle-text: rgb(12, 30, 54);
  }

  .dark #hero-section {
    --btn-ae-bg: rgb(0, 0, 91);
    --btn-ae-border: rgb(82, 59, 196);
    --btn-ae-text: rgb(153, 153, 255);
    --btn-eagle-bg: rgb(0, 37, 63);
    --btn-eagle-border: rgb(0, 98, 201);
    --btn-eagle-text: rgb(161, 216, 255);
  }
  .has-sweep-light {
    position: relative;
    overflow: hidden; /* Ensure sweep light stays within bounds */
  }

  .has-sweep-light::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%; /* Start off-screen to the left */
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3), /* Light sweep color */
      transparent
    );
    transition: transform 0.5s ease-in-out; /* Smooth transition for sweep */
    transform: skewX(-20deg); /* Optional: add a slight skew for effect */
    z-index: 1; /* Ensure it's above button background but below text */
  }

  .has-sweep-light:hover::before {
    transform: translateX(200%) skewX(-20deg); /* Move across the button */
  }
  
  /* Title part styling for animation */
  .title-part {
    display: inline-block;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
  .title-arrow {
    display: inline-block;
  }
</style>