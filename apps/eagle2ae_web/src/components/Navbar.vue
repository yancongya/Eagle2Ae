<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md border-b border-white/20 dark:border-white/10 transition-colors duration-300 w-full">
    <nav class="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center">
      <!-- Logo -->
      <div class="flex-shrink-0 font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100 flex items-center">
        <router-link to="/" class="flex items-center group">
          <img src="/logo.png" alt="Logo" class="h-6 sm:h-7 md:h-8 mr-2" />
          <span class="font-bold" ref="navTitle">Eagle2Ae</span>
        </router-link>
      </div>



      <!-- Center: Navigation Links (with flex-grow wrapper) -->
      <div class="flex-1 min-w-0 px-4">
        <div class="hidden md:flex items-center justify-center sm:space-x-2 space-x-4 md:space-x-6 lg:space-x-8">
          <router-link to="/" class="nav-link-item nav-link-hides-at-custom text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap">
            {{ t('nav.home') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <router-link to="/ae-preview" class="nav-link-item text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap" @dblclick.prevent="onAePreviewDblClick" @mouseover="prefetchRoute('AE_Preview')">
            {{ t('nav.aePreview') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <router-link to="/eagle-preview" classs="nav-link-item text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap" @dblclick.prevent="onEaglePreviewDblClick" @mouseover="prefetchRoute('Eagle_Preview')">
            {{ t('nav.eaglePreview') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <router-link to="/download" class="nav-link-item nav-link-hides-at-custom text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap">
            {{ t('nav.download') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <router-link to="/about" class="nav-link-item nav-link-hides-at-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap">
            {{ t('nav.about.title') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <router-link to="/other" class="nav-link-item nav-link-hides-at-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap">
            {{ t('nav.other') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </router-link>
          <a :href="t('links.docs')" class="nav-link-item nav-link-hides-at-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group whitespace-nowrap">
            {{ t('nav.docs') }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </a>
        </div>
      </div>

      <!-- Right: Theme Toggle & Controls -->
      <div class="flex-shrink-0 flex items-center gap-2 md:gap-4">
        <LanguageSwitcher size="md" class="hidden md:block" />
        <!-- 移动端始终可见的语言切换 -->
        <LanguageSwitcher size="sm" class="md:hidden" @languageChanged="isMobileOpen = false"/>
        <!-- 纯 CSS 日/月切换控件 -->
        <label for="themeToggle" class="themeToggle st-sunMoonThemeToggleBtn w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-gray-600 dark:text-gray-300 cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.06] active:scale-[0.96]" aria-label="切换主题">
          <input type="checkbox" id="themeToggle" class="themeToggleInput" :checked="isDark" @click="onToggleTheme($event)" />
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" stroke="none">
            <mask id="moon-mask">
              <rect x="0" y="0" width="20" height="20" fill="white"></rect>
              <circle cx="11" cy="3" r="8" fill="black"></circle>
            </mask>
            <circle class="sunMoon" cx="10" cy="10" r="8" mask="url(#moon-mask)"></circle>
            <g>
              <circle class="sunRay sunRay1" cx="18" cy="10" r="1.5"></circle>
              <circle class="sunRay sunRay2" cx="14" cy="16.928" r="1.5"></circle>
              <circle class="sunRay sunRay3" cx="6" cy="16.928" r="1.5"></circle>
              <circle class="sunRay sunRay4" cx="2" cy="10" r="1.5"></circle>
              <circle class="sunRay sunRay5" cx="6" cy="3.1718" r="1.5"></circle>
              <circle class="sunRay sunRay6" cx="14" cy="3.1718" r="1.5"></circle>
            </g>
          </svg>
        </label>
        <!-- Mobile menu toggle -->
        <button ref="mobileMenuButtonRef" @click="toggleMenu" @mouseenter="!isMobile && (isMobileOpen = true)" class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 transition-transform duration-200 ease-out hover:scale-[1.05] active:scale-[0.95]" aria-label="打开菜单" :aria-expanded="isMobileOpen">
          <svg class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ease-out" :class="{ 'rotate-90': isMobileOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </nav>
    <!-- Mobile menu -->
    <transition name="mobile-menu">
      <div v-show="isMobileOpen" ref="mobileMenuRef" @mouseleave="!isMobile && (isMobileOpen = false)" class="absolute left-0 right-0 top-full md:hidden bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md border-t border-white/20 dark:border-white/10 rounded-b-xl z-50 max-h-[75vh] overflow-y-auto">
        <div class="w-full px-4 py-3 sm:py-4 flex flex-col space-y-2">
          <router-link to="/" class="mobile-nav-link">
            <span class="relative inline-block group">
              {{ t('nav.home') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <router-link to="/ae-preview" class="mobile-nav-link" @dblclick.prevent="onAePreviewDblClick" @mouseover="prefetchRoute('AE_Preview')">
            <span class="relative inline-block group">
              {{ t('nav.aePreview') }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <router-link to="/eagle-preview" class="mobile-nav-link" @dblclick.prevent="onEaglePreviewDblClick" @mouseover="prefetchRoute('Eagle_Preview')">
            <span class="relative inline-block group">
              {{ t('nav.eaglePreview') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <router-link to="/download" class="mobile-nav-link">
            <span class="relative inline-block group">
              {{ t('nav.download') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <router-link to="/about" class="mobile-nav-link">
            <span class="relative inline-block group">
              {{ t('nav.about.title') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <router-link to="/other" class="mobile-nav-link">
            <span class="relative inline-block group">
              {{ t('nav.other') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </router-link>
          <a :href="t('links.docs')" class="mobile-nav-link" @click="isMobileOpen = false">
            <span class="relative inline-block group">
              {{ t('nav.docs') }}
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
          </a>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { useDark, useToggle, onClickOutside } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { useDevice } from '@/composables/useDevice.js';
import { gsap } from 'gsap'

const { t } = useI18n();
const isDark = useDark({ storageKey: 'theme' });
const toggleDark = useToggle(isDark);
const isMobileOpen = ref(false);
const router = useRouter();
const route = useRoute();
const { isMobile, isSmallScreen, isTouchDevice } = useDevice();

const mobileMenuRef = ref(null);
const mobileMenuButtonRef = ref(null);
const navTitle = ref(null);
const isClickOutsideEnabled = ref(true);

onClickOutside(
  mobileMenuRef,
  () => {
    if (isClickOutsideEnabled.value) {
      isMobileOpen.value = false;
    }
  },
  { ignore: [mobileMenuButtonRef] }
);

const toggleMenu = () => {
  isMobileOpen.value = !isMobileOpen.value;
  if (isMobileOpen.value) {
    isClickOutsideEnabled.value = false;
    setTimeout(() => {
      isClickOutsideEnabled.value = true;
    }, 100);
  }
};

router.afterEach(() => { isMobileOpen.value = false; });

watch(isMobileOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      if (mobileMenuRef.value) {
        mobileEnter(mobileMenuRef.value, () => {});
      }
    });
  } else {
    if (mobileMenuRef.value) {
      mobileLeave(mobileMenuRef.value, () => {});
    }
  }
});

const onToggleTheme = (e) => {
  const supports = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultX = window.innerWidth - 4;
  const defaultY = 4;
  const x = (e && typeof e.clientX === 'number') ? e.clientX : defaultX;
  const y = (e && typeof e.clientY === 'number') ? e.clientY : defaultY;
  
  // 广播主题切换事件（包含点击坐标）
  window.dispatchEvent(new CustomEvent('themeToggle', {
    detail: { x, y, newTheme: !isDark.value ? 'dark' : 'light' }
  }));
  
  // 在主题切换动画期间，关闭局部组件的颜色过渡，避免“迟”和“生硬”
  const htmlEl = document.documentElement;
  const THEME_CLASS = 'theme-animating';
  const addAnimClass = () => htmlEl.classList.add(THEME_CLASS);
  const removeAnimClass = () => htmlEl.classList.remove(THEME_CLASS);

  if (!supports) {
    addAnimClass();
    toggleDark();
    // 短暂关闭局部过渡，交由 CSS 立即切换
    setTimeout(removeAnimClass, 160);
    return;
  }
  const transition = document.startViewTransition(() => { 
    addAnimClass();
    toggleDark(); 
  });
  const DURATION = 520;
  const EASING = 'ease-in-out';
  transition.ready.then(() => {
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: DURATION, easing: EASING, pseudoElement: '::view-transition-new(root)' });
  }).catch(() => { toggleDark(); }).finally(() => {
    // 动画结束后恢复局部过渡
    setTimeout(removeAnimClass, DURATION + 40);
  });
}

// 双击导航“AE 预览”重置布局
const onAePreviewDblClick = async (e) => {
  try { e?.preventDefault?.(); } catch {}
  if (route.name !== 'AE_Preview') {
    await router.push({ name: 'AE_Preview' });
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('reset-ae-layout'));
    });
  } else {
    window.dispatchEvent(new CustomEvent('reset-ae-layout'));
  }
  isMobileOpen.value = false;
};

// 双击导航“Eagle 预览”重置布局
const onEaglePreviewDblClick = async (e) => {
  try { e?.preventDefault?.(); } catch {}
  if (route.name !== 'Eagle_Preview') {
    await router.push({ name: 'Eagle_Preview' });
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('reset-eagle-layout'));
    });
  } else {
    window.dispatchEvent(new CustomEvent('reset-eagle-layout'));
  }
  isMobileOpen.value = false;
};

// GSAP: Mobile menu enter/leave animations with item stagger
const mobileEnter = (el, done) => {
  const links = el.querySelectorAll('a');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  tl.fromTo(el,
    { scaleY: 0, opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }
  );
  tl.fromTo(links,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, stagger: 0.07, duration: 0.3, ease: 'power3.out' },
    "-=0.2"
  );
};
const mobileLeave = (el, done) => {
  const links = el.querySelectorAll('a');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  // 1. Links move down and fade out
  tl.to(links, {
    opacity: 0,
    y: 15, // Move down
    stagger: 0.05,
    duration: 0.25,
    ease: 'power2.in'
  });
  // 2. Panel collapses upwards
  tl.to(el, {
    scaleY: 0,
    opacity: 0, // Also fade out the panel
    duration: 0.3,
    ease: 'power3.in'
  }, "-=0.2"); // Overlap for a smoother transition
};

// 标题乱码转场动画
onMounted(() => {
  if (!navTitle.value) return;

  const normalText = 'Eagle2Ae';
  const hoverText = 'Ae2Eagle';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let animationFrame = null;

  const el = navTitle.value;

  // 步骤1: 计算两种文本状态下的最大宽度
  el.textContent = normalText;
  const normalWidth = el.getBoundingClientRect().width;
  el.textContent = hoverText;
  const hoverWidth = el.getBoundingClientRect().width;
  const maxWidth = Math.ceil(Math.max(normalWidth, hoverWidth));

  // 步骤2: 将最大宽度应用为元素的固定宽度，防止抖动
  el.style.width = `${maxWidth}px`;
  el.style.display = 'inline-block'; // 确保 width 属性生效
  el.style.textAlign = 'center'; // 在固定宽度内容器居中

  const scrambleText = (fromText, toText, duration = 600) => {
    const startTime = Date.now();
    const textLength = Math.max(fromText.length, toText.length);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let result = '';
      for (let i = 0; i < textLength; i++) {
        const targetChar = toText[i] || '';

        if (progress === 1) {
          result += targetChar;
        } else {
          const charProgress = (progress * textLength - i) / 2;

          if (charProgress > 1) {
            result += targetChar;
          } else if (charProgress > 0) {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
          else {
            result += fromText[i] || '';
          }
        }
      }

      navTitle.value.textContent = result;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        navTitle.value.textContent = toText;
      }
    };

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    animate();
  };

  const linkElement = navTitle.value.closest('a');
  if (linkElement) {
    linkElement.addEventListener('mouseenter', () => {
      scrambleText(normalText, hoverText, 600);
    });

    linkElement.addEventListener('mouseleave', () => {
      scrambleText(hoverText, normalText, 600);
    });
  }

  navTitle.value.textContent = normalText;
});

const prefetchedRoutes = new Map();

const prefetchRoute = (routeName) => {
  if (prefetchedRoutes.has(routeName)) {
    return;
  }
  const routeRecord = router.getRoutes().find(r => r.name === routeName);
  if (routeRecord && typeof routeRecord.component === 'function') {
    prefetchedRoutes.set(routeName, true);
    routeRecord.component().catch(err => {
      console.error(`Failed to prefetch route ${routeName}:`, err);
      prefetchedRoutes.delete(routeName);
    });
  }
};
</script>

<style scoped>
/* Custom animation for slower pulse effect */
.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Fallback for CSS transition (仅在 JS 动画不可用时生效) */
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: max-height 250ms ease;
  overflow: hidden;
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  max-height: 0;
}
.mobile-menu-enter-to, .mobile-menu-leave-from {
  max-height: 500px;
}

/* New Interactive Link Styles */
.mobile-nav-link {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.625rem;
  font-weight: 500;
  color: #4a5568; /* gray-700 */
  text-decoration: none;
  transition: color 250ms ease-out, transform 150ms ease-out;
}

.dark .mobile-nav-link {
  color: #cbd5e0;
}

.mobile-nav-link:hover {
  color: #1a202c; /* gray-900 */
}

.dark .mobile-nav-link:hover {
  color: #fff;
}

.mobile-nav-link:active {
  transform: scale(0.96);
  transition-duration: 80ms;
}

/* Sun-Moon Toggle (pure CSS) */
.themeToggle { width: 2.1em; }
.st-sunMoonThemeToggleBtn { position: relative; cursor: pointer; }
.st-sunMoonThemeToggleBtn .themeToggleInput { opacity: 0; width: 100%; aspect-ratio: 1; }
.st-sunMoonThemeToggleBtn svg { position: absolute; left: 0; width: 100%; height: 100%; transition: transform 0.4s ease; transform: rotate(40deg); }
.st-sunMoonThemeToggleBtn svg .sunMoon { transform-origin: center center; transition: inherit; transform: scale(1); }
.st-sunMoonThemeToggleBtn svg .sunRay { transform-origin: center center; transform: scale(0); }
.st-sunMoonThemeToggleBtn svg mask > circle { transition: transform 0.64s cubic-bezier(0.41, 0.64, 0.32, 1.575); transform: translate(0px, 0px); }
.st-sunMoonThemeToggleBtn svg .sunRay2 { animation-delay: 0.05s !important; }
.st-sunMoonThemeToggleBtn svg .sunRay3 { animation-delay: 0.1s !important; }
.st-sunMoonThemeToggleBtn svg .sunRay4 { animation-delay: 0.17s !important; }
.st-sunMoonThemeToggleBtn svg .sunRay5 { animation-delay: 0.25s !important; }
.st-sunMoonThemeToggleBtn svg .sunRay5 { animation-delay: 0.29s !important; }
.st-sunMoonThemeToggleBtn svg .sunRay6 { animation-delay: 0.29s !important; }
.st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg { transform: rotate(90deg); }
.st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg mask > circle { transform: translate(16px, -3px); }
.st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg .sunMoon { transform: scale(0.55); }
.st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg .sunRay { animation: showRay1832 0.4s ease 0s 1 forwards; }
@keyframes showRay1832 { 0% { transform: scale(0); } 100% { transform: scale(1); } }

.nav-link-item {
  transition: opacity 0.3s ease, max-width 0.4s ease, margin 0.4s ease;
  overflow: hidden;
  white-space: nowrap; /* Ensure content doesn't wrap inside */
}

/* Hides 'Docs' at 1279px and below */
@media (max-width: 1279px) {
  .nav-link-hides-at-xl {
    max-width: 0;
    opacity: 0;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important; /* Ensure padding is also removed */
    padding-right: 0 !important;
  }
}

/* Hides 'About' and 'Other' at 1023px and below */
@media (max-width: 1023px) {
  .nav-link-hides-at-lg {
    max-width: 0;
    opacity: 0;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important; /* Ensure padding is also removed */
    padding-right: 0 !important;
  }
}

/* Hides 'Home' and 'Download' at 920px and below */
@media (max-width: 920px) {
  .nav-link-hides-at-custom {
    max-width: 0;
    opacity: 0;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important; /* Ensure padding is also removed */
    padding-right: 0 !important;
  }
}
</style>
