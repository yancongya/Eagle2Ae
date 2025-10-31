import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AE_Preview from '../views/AE_Preview.vue';
import Eagle_Preview from '../views/Eagle_Preview.vue';
import Download from '../views/Download.vue';
import About from '../views/About.vue';
import Other from '../views/Other.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/ae-preview',
    name: 'AE_Preview',
    component: AE_Preview,
  },
  {
    path: '/eagle-preview',
    name: 'Eagle_Preview',
    component: Eagle_Preview,
  },
  {
    path: '/download',
    name: 'Download',
    component: Download,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/other',
    name: 'Other',
    component: Other,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/ae-preview',
      name: 'AE_Preview',
      component: AE_Preview,
    },
    {
      path: '/eagle-preview',
      name: 'Eagle_Preview',
      component: Eagle_Preview,
    },
    {
      path: '/download',
      name: 'Download',
      component: Download,
    },
    {
      path: '/about',
      name: 'About',
      component: About,
    },
    {
      path: '/other',
      name: 'Other',
      component: Other,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // 1) 浏览器的前进/后退：恢复保存位置
    if (savedPosition) return savedPosition;

    // 2) 刷新页面：让浏览器自己恢复滚动位置
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length && navEntries[0].type === 'reload';
    if (isReload) return false; // 不干预，保持原位置或浏览器恢复

    // 3) 锚点滚动：平滑滚动到对应元素
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }

    // 4) 普通路由跳转：滚动到顶部
    return { left: 0, top: 0 };
  }
});

// ===== Global View Transitions for all route navigations =====
let vtNavigating = false;
router.beforeEach((to, from, next) => {
  const supported = typeof document !== 'undefined' && 'startViewTransition' in document;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supported || reducedMotion || vtNavigating) return next();
  vtNavigating = true;
  document.startViewTransition(() => {
    next();
  }).finished.finally(() => {
    vtNavigating = false;
  });
});

router.afterEach((to) => {
  const doc = document.documentElement;
  if (!doc) return;
  // 清理所有 route-* 类，避免累积
  const toRemove = Array.from(doc.classList).filter((cls) => cls.startsWith('route-'));
  toRemove.forEach((cls) => doc.classList.remove(cls));
  doc.classList.add(`route-${to.name}`);
});

export default router;
