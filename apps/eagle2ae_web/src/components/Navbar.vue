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
        <button @click="onToggleTheme($event)" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <!-- Sun Icon -->
          <svg v-if="!isDark" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.728 6.728l-1.414-1.414M6.686 6.686L5.272 5.272M18.728 5.272l-1.414 1.414M6.686 17.314l-1.414 1.414M12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>
          <!-- Moon Icon -->
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012 21a9 9 0 008.354-5.646z"/></svg>
        </button>
        <!-- 已移除旧的下载按钮 CTA -->
        <!-- Mobile menu toggle -->
        <button @click="isMobileOpen = !isMobileOpen" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden" aria-label="打开菜单" :aria-expanded="isMobileOpen">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </nav>
    <!-- Mobile menu -->
    <transition name="mobile-menu">
      <div v-if="isMobileOpen" class="absolute left-0 right-0 top-full md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-md z-[60] max-h-[75vh] overflow-y-auto">
        <div class="w-full px-6 py-2 flex flex-col space-y-2">
          <LanguageSwitcher class="self-end mb-2" />
          <router-link to="/" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{{ t('nav.home') }}</router-link>
          <router-link to="/ae-preview" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{{ t('nav.aePreview') }}</router-link>
          <router-link to="/eagle-preview" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{{ t('nav.eaglePreview') }}</router-link>
          <router-link to="/download" class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{{ t('nav.download') }}</router-link>
          
          <!-- 已移除旧的“详细文档”链接 -->
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

const { t } = useI18n();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const isMobileOpen = ref(false);
const router = useRouter();
router.afterEach(() => { isMobileOpen.value = false; });

const onToggleTheme = (e) => {
   const supports = typeof document !== 'undefined' && 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (!supports) { toggleDark(); return; }
 
   const x = e?.clientX ?? window.innerWidth / 2;
   const y = e?.clientY ?? window.innerHeight / 2;
 
   const transition = document.startViewTransition(() => {
     // 使用 VueUse 切换 dark 类
     toggleDark();
   });
 
   // 调整动画参数：更短、更柔和的 ease-in-out
   const DURATION = 520;
   const EASING = 'ease-in-out';
   const OLD_DELAY = 80; // 旧页面收缩稍后开始，避免过度重叠
 
   transition.ready.then(() => {
     const radius = Math.hypot(
       Math.max(x, window.innerWidth - x),
       Math.max(y, window.innerHeight - y)
     );
 
     // 新页面截图从点击点向外扩散
     document.documentElement.animate(
       { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
       { duration: DURATION, easing: EASING, pseudoElement: '::view-transition-new(root)' }
     );
 
     // 旧页面截图收缩（轻微延迟，增强质感）
     document.documentElement.animate(
       { clipPath: [`circle(${radius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] },
       { duration: DURATION, easing: EASING, delay: OLD_DELAY, pseudoElement: '::view-transition-old(root)' }
     );
   }).catch(() => {
     // 发生错误时回退
     toggleDark();
   });
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
</style>
