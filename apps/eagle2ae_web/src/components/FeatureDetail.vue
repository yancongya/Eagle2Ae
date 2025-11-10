<template>
  <section :id="id" ref="featureSection" class="relative py-12 sm:py-16 md:py-20 pb-24 sm:pb-24 md:pb-28 flex flex-col justify-start bg-gray-100 dark:bg-gray-900" :class="isLast ? 'min-h-[calc(82vh-var(--navbar-height,0px))]' : 'min-h-[calc(100vh-var(--navbar-height,0px))] min-h-[calc(100dvh-var(--navbar-height,0px))]'" :style="{ scrollMarginTop: 'var(--navbar-height, 0px)' }">
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
                <img :src="src" :alt="title" class="w-full h-full object-cover rounded-md" loading="lazy" />
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

    <!-- Footer Description: small screens in document flow, large screens overlay at bottom -->
    <transition
      appear
      enter-active-class="duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="duration-400 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="footerTextComputed && footerVisible" :class="footerContainerClass">
        <div class="max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto text-center">
          <p class="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-normal break-words">
            {{ footerTextComputed }}
          </p>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t, locale } = useI18n();

const props = defineProps({
  id: String,
  title: String,
  description: { type: String, default: '' },
  descriptionLines: { type: Array, default: () => [] },
  imageUrl: { type: String, default: '' }, // backward compatibility
  imageUrls: { type: Array, default: () => [] },
  // 新增：底部描述文本（支持 i18n 文本或多语言对象）
  footerText: { type: [String, Object], default: '' },
  isImageLeft: { type: Boolean, default: true },
  isLast: { type: Boolean, default: false }
});

const featureSection = ref(null);
const imageContainer = ref(null);
const textContainer = ref(null);
// 控制底部描述的进出场显示
const showFooter = ref(false);
// 小屏设备模式检测
const isSmallScreen = ref(false);
// 互斥状态注入：仅当本段为激活段时才允许显示
const activeFeatureId = inject('activeFeatureId', ref(null));
const setActiveFeatureId = inject('setActiveFeatureId', (id) => { activeFeatureId.value = id; });

// 可见性：由 showFooter 与互斥状态共同控制
const footerVisible = computed(() => showFooter.value && activeFeatureId?.value === props.id);
// 定位与布局：
// - 小屏：固定贴屏幕底部，考虑安全区；
// - 大屏：绝对定位覆盖在区块底部居中。
const footerContainerClass = computed(() => {
  if (isSmallScreen.value) {
    // 最后一个详情段：描述放在页脚上方，采用文档流布局避免覆盖页脚
    if (props.isLast) {
      return 'relative left-1/2 -translate-x-1/2 w-full px-4 z-20 mt-4 mb-[calc(env(safe-area-inset-bottom)+8px)]';
    }
    // 其他段：保持固定贴屏幕底部的展示方式
    return 'pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[calc(16px+env(safe-area-inset-bottom))] w-full px-4 z-30';
  }
  // 大屏：绝对定位覆盖在区块底部居中
  return 'pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-8 md:bottom-10 w-full px-4 sm:px-6 z-20';
});
const activeIndex = ref(0);
const swiperRef = ref(null);

// Build image list: prefer imageUrls, fallback to single imageUrl, finally local placeholders
const defaultPlaceholders = [
  '/images/features/feature-drag-import.webp',
  '/images/features/feature-import-mode.webp',
  '/images/features/feature-import-behavior.webp',
  '/images/features/feature-export-layer.webp',
  '/images/features/feature-presets.webp',
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

// 底部描述的 i18n 解析（支持字符串键或多语言对象）
const getLocalized = (val) => {
  if (!val) return '';
  if (typeof val === 'string') {
    // 始终将字符串视为 i18n 键
    const translated = t(val);
    // 如果找到翻译且与键不同，则返回翻译
    // 否则，返回键本身（如果键为空则返回空字符串）
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

const footerTextComputed = computed(() => getLocalized(props.footerText));

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
let io; // IntersectionObserver for reliable visibility
let mq; // matchMedia for small screen detection
const handleMq = (e) => { isSmallScreen.value = !!e.matches; };

// 供父级调用：分页滚动完成后再触发（大屏）
const playEnter = (delay = 0) => {
  const imageX = props.isImageLeft ? -100 : 100;
  
  // 确保从正确的初始状态开始动画，避免底部快速位移
  if (delay === 0) {
    gsap.set(imageContainer.value, { x: imageX, opacity: 0 });
    gsap.set(textContainer.value, { x: -imageX, opacity: 0 });
  }
  
  gsap.to(imageContainer.value, { 
    x: 0, 
    opacity: 1, 
    duration: opts.value.enterAnimation.duration, 
    ease: opts.value.enterAnimation.ease, 
    delay,
    clearProps: 'transform'
  });
  gsap.to(textContainer.value, { 
    x: 0, 
    opacity: 1, 
    duration: opts.value.enterAnimation.duration, 
    ease: opts.value.enterAnimation.ease, 
    delay: delay + opts.value.enterAnimation.stagger,
    clearProps: 'transform'
  });
  
  // 确保阴影正确应用
  if (swiperRef.value) {
    setTimeout(() => updateSlideShadows(swiperRef.value), delay * 1000 + 100);
  }
};

const playExit = (delay = 0) => {
  const imageX = props.isImageLeft ? -100 : 100;
  gsap.to(imageContainer.value, { 
    x: imageX, 
    opacity: 0, 
    duration: opts.value.exitAnimation.duration, 
    ease: opts.value.exitAnimation.ease, 
    delay 
  });
  gsap.to(textContainer.value, { 
    x: -imageX, 
    opacity: 0, 
    duration: opts.value.exitAnimation.duration, 
    ease: opts.value.exitAnimation.ease, 
    delay 
  });
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

  // --- Small screen detection ---
  try {
    mq = window.matchMedia('(max-width: 640px)');
    isSmallScreen.value = mq.matches;
    if (mq.addEventListener) mq.addEventListener('change', handleMq);
    else if (mq.addListener) mq.addListener(handleMq);
  } catch {}

  // --- IntersectionObserver for footer visibility ---
  try {
    io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      // 小屏：区块在视口中且可见比例达到一定阈值时显示，避免与相邻 section 重叠同时显示
      // 大屏：需要一定可见比例以触发覆盖显示。
      showFooter.value = isSmallScreen.value
        ? (entry.isIntersecting && entry.intersectionRatio > 0.2)
        : (entry.isIntersecting && entry.intersectionRatio > 0.08);
    }, { threshold: [0, 0.08, 0.15, 0.3, 0.5, 1] });
    if (featureSection.value) io.observe(featureSection.value);
  } catch {}

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
    
    // 确保初始状态正确设置，避免刷新后的位移问题
    const setInitialState = () => {
      gsap.set(imageContainer.value, { x: imageX, opacity: 0, clearProps: 'transform' });
      gsap.set(textContainer.value, { x: -imageX, opacity: 0, clearProps: 'transform' });
    };
    
    // 立即设置初始状态
    setInitialState();
    
    // 延迟再次设置，确保覆盖任何可能的样式冲突
    setTimeout(setInitialState, 10);

    const show = (delay = 0) => {
      // 在动画开始前再次确保初始状态
      if (delay === 0) {
        gsap.set(imageContainer.value, { x: imageX, opacity: 0 });
        gsap.set(textContainer.value, { x: -imageX, opacity: 0 });
      }
      
      gsap.to(imageContainer.value, { 
        x: 0, 
        opacity: 1, 
        duration: opts.value.enterAnimation.duration, 
        ease: opts.value.enterAnimation.ease, 
        delay,
        clearProps: 'transform' 
      });
      gsap.to(textContainer.value, { 
        x: 0, 
        opacity: 1, 
        duration: opts.value.enterAnimation.duration, 
        ease: opts.value.enterAnimation.ease, 
        delay: delay + opts.value.enterAnimation.stagger,
        clearProps: 'transform'
      });
      if (swiperRef.value) updateSlideShadows(swiperRef.value);
    };
    
    const hide = (delay = 0) => {
      gsap.to(imageContainer.value, { 
        x: imageX, 
        opacity: 0, 
        duration: opts.value.exitAnimation.duration, 
        ease: opts.value.exitAnimation.ease, 
        delay 
      });
      gsap.to(textContainer.value, { 
        x: -imageX, 
        opacity: 0, 
        duration: opts.value.exitAnimation.duration, 
        ease: opts.value.exitAnimation.ease, 
        delay 
      });
    };

    // 所有屏幕均使用 ScrollTrigger 控制进/出场，Lenis 提供平滑滚动
    ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: featureSection.value,
        // 使用“定位点”：当本段顶部到达视口中心时进入；底部到达视口中心时离开
        start: 'top center',
        end: 'bottom center',
        onEnter: () => { setActiveFeatureId(props.id); show(); showFooter.value = true; },
        onEnterBack: () => { setActiveFeatureId(props.id); show(); showFooter.value = true; },
        onLeave: () => { if (activeFeatureId?.value === props.id) setActiveFeatureId(null); hide(); showFooter.value = false; },
        onLeaveBack: () => { if (activeFeatureId?.value === props.id) setActiveFeatureId(null); hide(); showFooter.value = false; },
      });
    });

    // 初始阴影应用
    if (swiperRef.value) {
      updateSlideShadows(swiperRef.value);
    }
  });
});

onUnmounted(() => {
  if (ctx) ctx.revert();
  // Clean up theme observer
  if (themeObserver) themeObserver.disconnect();
  // Clean up IntersectionObserver
  if (io && featureSection.value) io.unobserve(featureSection.value);
  io = null;
  // Clean up matchMedia
  if (mq) {
    if (mq.removeEventListener) mq.removeEventListener('change', handleMq);
    else if (mq.removeListener) mq.removeListener(handleMq);
  }
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
