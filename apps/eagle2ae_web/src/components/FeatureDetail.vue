<template>
  <section :id="id" ref="featureSection" class="py-12 sm:py-16 md:py-20 flex flex-col justify-start bg-gray-100 dark:bg-gray-900" :class="isLast ? 'min-h-[calc(82vh-var(--navbar-height,0px))]' : 'min-h-[calc(100vh-var(--navbar-height,0px))] min-h-[calc(100dvh-var(--navbar-height,0px))]'">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:items-start gap-12" :class="[isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse']">
        <!-- Image Stacked Cards -->
        <div ref="imageContainer" class="md:w-1/2 opacity-0">
          <div class="relative w-full overflow-visible feature-swiper-container">
            <Swiper
              :modules="[EffectCards, Pagination, A11y]"
              effect="cards"
              :cardsEffect="{ perSlideOffset: 8, perSlideRotate: 0.8, rotate: true, slideShadows: true }"
              :loop="false"
              :grabCursor="true"
              :pagination="{ clickable: true }"
              @swiper="onSwiper"
              @slideChange="onSlideChange"
              class="w-full aspect-[4/3] overflow-visible"
              :style="{ overflow: 'visible' }"
            >
              <SwiperSlide v-for="(src, i) in imageList" :key="i">
                <img :src="src" :alt="title" class="w-full h-full object-cover rounded-md" />
              </SwiperSlide>
            </Swiper>
            <span class="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md bg-black/50 text-white">
              {{ activeIndex + 1 }}/{{ totalImages }}
            </span>
          </div>
        </div>

        <!-- Text Content -->
        <div ref="textContainer" class="md:w-1/2 opacity-0" :class="{ 'md:text-right': isImageLeft }">
          <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{{ title }}</h2>
          <TransitionGroup
            tag="div"
            class="space-y-2"
            :css="false"
            appear
            @before-enter="beforeEnterLine"
            @enter="enterLine"
            @leave="leaveLine"
          >
            <div v-for="(line, idx) in visibleLines" :key="idx" :class="['flex', isImageLeft ? 'justify-end' : 'items-start']">
              <div v-if="!isImageLeft" class="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span class="text-sm md:text-base text-gray-600 dark:text-gray-400">{{ line }}</span>
              <div v-if="isImageLeft" class="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full ml-3 mt-2 flex-shrink-0"></div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Swiper imports for Webflow overlapping cards effect
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

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
      }
    });
  }
  return output;
};

// Default configuration
const defaults = ref({
  enterAnimation: {
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.05
  },
  exitAnimation: {
    duration: 0.6,
    ease: "power2.in"
  }
});

const externalConfig = ref({});
const opts = computed(() => deepMerge(defaults.value, externalConfig.value));


gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  id: String,
  title: String,
  description: { type: String, default: '' },
  descriptionLines: { type: Array, default: () => [] },
  imageUrl: { type: String, default: '' }, // backward compatibility
  imageUrls: { type: Array, default: () => [] },
  isImageLeft: { type: Boolean, default: true },
  isLast: { type: Boolean, default: false }
});

const featureSection = ref(null);
const imageContainer = ref(null);
const textContainer = ref(null);
const activeIndex = ref(0);
const swiperRef = ref(null);

// Build image list: prefer imageUrls, fallback to single imageUrl, finally local placeholders
const defaultPlaceholders = [
  '/images/features/feature-drag-import.png',
  '/images/features/feature-import-mode.png',
  '/images/features/feature-import-behavior.png',
  '/images/features/feature-export-layer.png',
  '/images/features/feature-presets.png',
];
const imageList = computed(() => {
  if (props.imageUrls && props.imageUrls.length > 0) return props.imageUrls;
  if (props.imageUrl) return [props.imageUrl];
  return defaultPlaceholders;
});
const totalImages = computed(() => imageList.value.length);

// Dynamic description lines
const lines = computed(() => {
  const total = totalImages.value;
  const raw = Array.isArray(props.descriptionLines) ? props.descriptionLines : [];
  const filtered = raw.filter(v => typeof v === 'string' && v.trim() !== '');

  // 如果提供了多条描述且数量不少于图片数，直接使用
  if (filtered.length >= total) return filtered;

  // 如果仅提供了 1 条或少量描述，按图片数量扩展（用最后一条填充）
  if (filtered.length > 0) {
    const last = filtered[filtered.length - 1];
    return Array.from({ length: total }, (_, i) => filtered[i] ?? last);
  }

  // 否则使用 description 作为基准并按图片数量生成
  const base = props.description || '此处为功能描述占位文本';
  return Array.from({ length: total }, () => base);
});

const visibleLines = computed(() => lines.value.slice(0, Math.min(activeIndex.value + 1, lines.value.length)));

// --- Theme detection ---
const isDarkMode = ref(false);

// Swiper events & controls
const updateSlideShadows = (swiper) => {
  if (!swiper) return;
  const slides = swiper.slides;
  const activeIndex = swiper.activeIndex;

  // Define shadow parameters for light mode
  const lightMode = {
    base: { y: 5, blur: 8, opacity: 0.15, color: 'rgba(0, 0, 0, ' },
    step: { y: 6, blur: 7, opacity: 0.20 },
  };

  // Define glow parameters for dark mode
  const darkMode = {
    base: { y: 0, blur: 10, opacity: 0.10, color: 'rgba(255, 255, 255, ' }, // Subtle white glow
    step: { y: 2, blur: 5, opacity: 0.10 }, // Glow grows slightly
  };

  const currentMode = isDarkMode.value ? darkMode : lightMode;

  const maxVisibleCards = 3;
  const maxDepth = maxVisibleCards - 1;

  slides.forEach((slide, index) => {
    const offset = index - activeIndex;

    if (offset > 0 && offset <= maxVisibleCards) {
      const depth = maxDepth - (offset - 1);

      const y = currentMode.base.y + depth * currentMode.step.y;
      const blur = currentMode.base.blur + depth * currentMode.step.blur;
      const opacity = Math.min(currentMode.base.opacity + depth * currentMode.step.opacity, 0.9);

      slide.style.filter = `drop-shadow(0 ${y}px ${blur}px ${currentMode.base.color}${opacity}))`;
      
      const shadowEl = slide.querySelector('.swiper-slide-shadow');
      if (shadowEl) shadowEl.style.opacity = '0';

    } else {
      slide.style.filter = 'none';
    }
  });
};

const onSwiper = (swiper) => {
  swiperRef.value = swiper;
  updateSlideShadows(swiper);
};
const onSlideChange = (swiper) => {
  activeIndex.value = swiper.realIndex ?? swiper.activeIndex;
  updateSlideShadows(swiper);
};
const next = () => { swiperRef.value?.slideNext(); };
const prev = () => { swiperRef.value?.slidePrev(); };
const setIndex = (i) => {
  if (!swiperRef.value) return;
  if (swiperRef.value.params?.loop && typeof swiperRef.value.slideToLoop === 'function') {
    swiperRef.value.slideToLoop(i);
  } else {
    swiperRef.value.slideTo(i);
  }
};

let ctx;
let themeObserver; // Declare here

// 供父级调用：分页滚动完成后再触发（大屏）
const playEnter = (delay = 0) => {
  const imageX = props.isImageLeft ? -100 : 100;
  gsap.to(imageContainer.value, { x: 0, opacity: 1, duration: opts.value.enterAnimation.duration, ease: opts.value.enterAnimation.ease, delay });
  gsap.to(textContainer.value, { x: 0, opacity: 1, duration: opts.value.enterAnimation.duration, ease: opts.value.enterAnimation.ease, delay: delay + opts.value.enterAnimation.stagger });
};
const playExit = (delay = 0) => {
  const imageX = props.isImageLeft ? -100 : 100;
  gsap.to(imageContainer.value, { x: imageX, opacity: 0, duration: opts.value.exitAnimation.duration, ease: opts.value.exitAnimation.ease, delay });
  gsap.to(textContainer.value, { x: -imageX, opacity: 0, duration: opts.value.exitAnimation.duration, ease: opts.value.exitAnimation.ease, delay });
};

defineExpose({ playEnter, playExit });

onMounted(async () => {
  try {
    const res = await fetch('/config/feature-detail.json', { cache: 'no-store' });
    if (res.ok) {
      externalConfig.value = await res.json();
    }
  } catch (e) {
    console.warn('Feature detail config not found, using defaults.', e);
  }

  // --- Theme detection logic ---
  isDarkMode.value = document.documentElement.classList.contains('dark');
  themeObserver = new MutationObserver(() => {
    const newIsDarkMode = document.documentElement.classList.contains('dark');
    if (newIsDarkMode !== isDarkMode.value) {
      isDarkMode.value = newIsDarkMode;
      if (swiperRef.value) {
        updateSlideShadows(swiperRef.value); // Re-apply shadows on theme change
      }
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  // --- End Theme detection logic ---

  nextTick(() => {
    const imageX = props.isImageLeft ? -100 : 100; // 左/右方向
    // 初始状态：离场且透明
    gsap.set(imageContainer.value, { x: imageX, opacity: 0 });
    gsap.set(textContainer.value, { x: -imageX, opacity: 0 });

    const show = (delay = 0) => {
      gsap.to(imageContainer.value, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay });
      gsap.to(textContainer.value, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: delay + 0.05 });
      if (swiperRef.value) updateSlideShadows(swiperRef.value); // Ensure shadows are set on show
    };
    const hide = (delay = 0) => {
      gsap.to(imageContainer.value, { x: imageX, opacity: 0, duration: 0.6, ease: 'power2.in', delay });
      gsap.to(textContainer.value, { x: -imageX, opacity: 0, duration: 0.6, ease: 'power2.in', delay });
    };

    // 小屏使用 ScrollTrigger；大屏由 Home.vue 调度进出场
    if (window.innerWidth < 1024) {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: featureSection.value,
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => show(),
          onEnterBack: () => show(),
          onLeave: () => hide(),
          onLeaveBack: () => hide(),
        });
      });
    }

    // 大屏由父级 Home.vue 调度，已在顶层暴露 playEnter/playExit
    // Initial shadow application if not handled by ScrollTrigger
    if (window.innerWidth >= 1024 && swiperRef.value) {
        updateSlideShadows(swiperRef.value);
    }
  });
});

onUnmounted(() => {
  if (ctx) ctx.revert();
  // Clean up theme observer
  if (themeObserver) themeObserver.disconnect();
});

const beforeEnterLine = (el) => {
  gsap.set(el, { opacity: 0, y: 8 });
};
const enterLine = (el, done) => {
  gsap.to(el, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', onComplete: done });
};
const leaveLine = (el, done) => {
  gsap.to(el, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', onComplete: done });
};
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 250ms ease, transform 300ms ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 简洁圆点分页样式 */
:deep(.swiper-pagination) {
  bottom: 10px;
}
:deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  margin: 0 4px;
}
:deep(.swiper-pagination-bullet-active) {
  background: #fff;
  width: 8px;
  height: 8px;
}

/* 强化后置卡片阴影 (现在由JS动态控制) */

/* --- Global Hover Effect --- */
.feature-swiper-container {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  border-radius: 0.375rem; /* 6px */
}

.feature-swiper-container:hover {
  transform: scale(1.03);
  box-shadow: 0 25px 40px -15px rgba(0, 0, 0, 0.35);
}
</style>
