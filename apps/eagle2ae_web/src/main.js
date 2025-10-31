import { createApp } from 'vue';
import App from './App.vue';
import 'splitpanes/dist/splitpanes.css'; // Import splitpanes style
import router from './router'; // 引入 router
import './style.css';
import { useDark } from '@vueuse/core'; // Import useDark
import { i18n } from './i18n';
import { initCustomCursor } from './utils/CustomCursor';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { registerSW } from 'virtual:pwa-register';

// Initialize dark mode early to prevent FOUC
-useDark({ storageKey: 'theme', initialValue: 'dark' }); // Force dark mode
+useDark({ storageKey: 'theme' }); // Use persisted theme or system preference

// 初始化自定义延迟光标（仅默认态显示）
initCustomCursor();

// 注册 GSAP 插件并初始化 Lenis（与 ScrollTrigger 同步）
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  autoRaf: false,
  smoothWheel: true,
  lerp: 0.1,
  duration: 1.0,
  gestureOrientation: 'vertical',
  wheelMultiplier: 1,
  overscroll: true,
});

// Lenis 与 ScrollTrigger 同步更新 [0]
lenis.on('scroll', ScrollTrigger.update); // [0]
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // [0]
});
gsap.ticker.lagSmoothing(0); // [0]

// 全屏启用 Lenis，并暴露到 window 以供组件调用
lenis.start();
window.__lenis = lenis;

const app = createApp(App);

app.use(router); // 使用 router
app.use(i18n); // 使用 i18n

app.mount('#app');

// 注册 Service Worker（自动更新），以启用 PWA 预缓存
try { registerSW({ immediate: true }); } catch {}

// 页面空闲时预取“其他页”与下载页核心 JSON，提升回访体验
try {
  const idle = (cb) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(cb) : setTimeout(cb, 500));
  idle(async () => {
    try {
      const idxRes = await fetch('/config/links/groups.json');
      if (idxRes.ok) {
        const idx = await idxRes.json();
        const files = Array.isArray(idx.groups) ? idx.groups.map(g => g.file).filter(Boolean) : [];
        // 预取每个组文件
        files.forEach(fn => { fetch(`/config/links/${fn}`).catch(() => {}); });
      }
    } catch {}
    // 下载页配置也预取
    try { await fetch('/config/download.json'); } catch {}
  });
} catch {}