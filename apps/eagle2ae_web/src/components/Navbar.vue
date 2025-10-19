<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300 w-full">
    <nav class="w-full px-6 py-4 flex justify-between items-center">
      <!-- Logo -->
      <div class="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center">
        <router-link to="/" class="flex items-center">
          <img src="/logo.png" alt="Logo" class="h-8 mr-2" />
          <span class="font-bold">Eagle2AE</span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-6">
        <router-link to="/" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
          {{ t('nav.home') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500 ease-in-out animate-pulse-slow"></span>
        </router-link>
        <router-link to="/ae-preview" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
          {{ t('nav.aePreview') }}
          <!-- Loading animation -->
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500 ease-in-out animate-pulse-slow"></span>
        </router-link>
        <router-link to="/eagle-preview" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
          {{ t('nav.eaglePreview') }}
          <!-- Loading animation -->
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500 ease-in-out animate-pulse-slow"></span>
        </router-link>
        <router-link to="/download" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
          {{ t('nav.download') }}
          <!-- Loading animation -->
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500 ease-in-out animate-pulse-slow"></span>
        </router-link>
        
        <!-- 已移除旧的“详细文档”链接 -->
      </div>

      <!-- Theme Toggle & CTA Button -->
      <div class="flex items-center gap-2 md:gap-4">
        <LanguageSwitcher size="md" class="hidden md:block" />
        <!-- 移动端始终可见的语言切换 -->
        <LanguageSwitcher size="sm" class="md:hidden" />
        <!-- 纯 CSS 日/月切换控件 -->
        <label for="themeToggle" class="themeToggle st-sunMoonThemeToggleBtn w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.06] active:scale-[0.96]" aria-label="切换主题">
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
        <!-- 已移除旧的下载按钮 CTA -->
        <!-- Mobile menu toggle -->
        <button @click="isMobileOpen = !isMobileOpen" class="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 transition-transform duration-200 ease-out hover:scale-[1.05] active:scale-[0.95]" aria-label="打开菜单" :aria-expanded="isMobileOpen">
          <svg class="w-6 h-6 transition-transform duration-200 ease-out" :class="{ 'rotate-90': isMobileOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </nav>
    <!-- Mobile menu -->
    <transition name="mobile-menu" @enter="mobileEnter" @leave="mobileLeave">
      <div v-if="isMobileOpen" class="absolute left-0 right-0 top-full md:hidden bg-white/80 dark:bg-gray-900/85 backdrop-blur-md border-t border-white/10 dark:border-white/10 shadow-lg rounded-b-2xl z-[60] max-h-[75vh] overflow-y-auto">
        <div class="w-full px-6 py-2 flex flex-col space-y-2">
          <router-link to="/" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">{{ t('nav.home') }}</router-link>
          <router-link to="/ae-preview" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">{{ t('nav.aePreview') }}</router-link>
          <router-link to="/eagle-preview" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">{{ t('nav.eaglePreview') }}</router-link>
          <router-link to="/download" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">{{ t('nav.download') }}</router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { gsap } from 'gsap'

const { t } = useI18n();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const isMobileOpen = ref(false);
const router = useRouter();
router.afterEach(() => { isMobileOpen.value = false; });

const onToggleTheme = (e) => {
  const supports = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supports) { toggleDark(); return; }
  const defaultX = window.innerWidth - 4;
  const defaultY = 4;
  const x = (e && typeof e.clientX === 'number') ? e.clientX : defaultX;
  const y = (e && typeof e.clientY === 'number') ? e.clientY : defaultY;
  const transition = document.startViewTransition(() => { toggleDark(); });
  const DURATION = 520;
  const EASING = 'ease-in-out';
  transition.ready.then(() => {
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: DURATION, easing: EASING, pseudoElement: '::view-transition-new(root)' });
  }).catch(() => { toggleDark(); });
}

// GSAP: Mobile menu enter/leave animations with item stagger
const mobileEnter = (el, done) => {
  const links = el.querySelectorAll('a')
  gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', onComplete: done })
  gsap.fromTo(links, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', stagger: 0.04 })
}
const mobileLeave = (el, done) => {
  gsap.to(el, { opacity: 0, y: -6, duration: 0.18, ease: 'power2.in', onComplete: done })
}
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
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: max-height 250ms ease, opacity 200ms ease, transform 200ms ease;
  overflow: hidden;
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}
.mobile-menu-enter-to, .mobile-menu-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
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
</style>
