<template>
  <a id="scroll-up" class="scroll-up" href="#" @click.prevent="scrollToTop">
  	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  		<path d="M0 0h24v24H0z" fill="none"></path>
  		<path fill="rgba(255,255,255,1)" d="M11.9997 10.8284L7.04996 15.7782L5.63574 14.364L11.9997 8L18.3637 14.364L16.9495 15.7782L11.9997 10.8284Z">
  		</path>
  	</svg>
  </a>
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

const handleScroll = () => {
  const scrollUpElement = document.getElementById('scroll-up');
  if (scrollUpElement) {
    if (window.scrollY > scrollThreshold) {
      scrollUpElement.classList.add('_show-scroll');
    } else {
      scrollUpElement.classList.remove('_show-scroll');
    }
  }
};

const scrollToTop = () => {
  gsap.to(window, { duration: opts.value.animation.duration, scrollTo: 0, ease: opts.value.animation.ease });
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
  // 初始化一次显示与位置
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
  /* <reset-style> ============================ */
  a {
    text-decoration: none;
  }
  /* <main-style> ============================ */
  .scroll-up {
  position: fixed;
    right: 3rem;
    bottom: -50%;
    z-index: 10;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background-color: rgba(29, 29, 31, 0.7);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: bottom .4s, transform .4s;
  }

  .scroll-up:hover {
    transform: translateY(-.25rem);
  }

  /* Show scroll-up */
  ._show-scroll {
    bottom: 3rem;
  }

  @media (max-width: 1199.98px) {
    .scroll-up {
      right: 1rem;
    }
  }
</style>