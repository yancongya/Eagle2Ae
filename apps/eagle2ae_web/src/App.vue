<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-200 overflow-x-hidden">
    <Navbar />
    <router-view v-slot="{ Component }">
      <div ref="routeContainer" class="page-transition-layer" :style="pageLayerStyle">
        <component :is="Component" />
      </div>
    </router-view>
    <!-- 已根据偏好移除过渡期间遮罩层 -->
    <!-- 仅在首页挂载拖拽组件 -->
    <DragToTop v-if="dragToTopEnabled" :enabled="true" />
    <ReturnToTopButton />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Navbar from './components/Navbar.vue';
import DragToTop from './components/DragToTop.vue';
import ReturnToTopButton from './components/ReturnToTopButton.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// 仅在首页启用拖拽组件
const dragToTopEnabled = computed(() => route.name === 'Home');

// 全局加载遮罩：初次加载与路由切换时显示
const isLoading = ref(true);
const routeContainer = ref(null);

// ===== 全局导航高度变量：避免 fixed Navbar 遮挡 =====
const pageLayerStyle = computed(() => ({
  paddingTop: 'var(--navbar-height, 0px)',
  minHeight: 'calc(100vh - var(--navbar-height, 0px))',
  'view-transition-name': 'page'
}));
let __navbarResizeObserver;
const updateNavbarHeight = () => {
  const el = document.querySelector('header');
  const h = el ? el.offsetHeight : 0;
  document.documentElement.style.setProperty('--navbar-height', `${h}px`);
};

// 初次加载：等待 window.onload（包含图片、样式等资源）
onMounted(() => {
  const finish = () => { isLoading.value = false; };
  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish, { once: true });
  }
  // 不再强制滚顶，允许浏览器在刷新时恢复位置；路由滚动由 scrollBehavior 控制

  // 初始化并监听导航高度变化
  updateNavbarHeight();
  window.addEventListener('resize', updateNavbarHeight);
  const el = document.querySelector('header');
  if (el && 'ResizeObserver' in window) {
    __navbarResizeObserver = new ResizeObserver(updateNavbarHeight);
    __navbarResizeObserver.observe(el);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateNavbarHeight);
  if (__navbarResizeObserver) __navbarResizeObserver.disconnect();
});

// 路由标题 key 映射
const routeTitleKey = (name) => {
  switch (name) {
    case 'Home': return 'route.title.home';
    case 'AE_Preview': return 'route.title.aePreview';
    case 'Eagle_Preview': return 'route.title.eaglePreview';
    case 'Download': return 'route.title.download';
    case 'About': return 'route.title.about';
    default: return 'route.title.home';
  }
};

// 路由切换：进入前显示遮罩，切换后等待新页面的图片加载完成再隐藏
router.beforeEach((to, from, next) => {
  isLoading.value = true;
  next();
});

router.afterEach(async (to) => {
  // 更新文档标题（基于 i18n）
  try { document.title = t(routeTitleKey(to.name)); } catch {}

  // 等待新视图挂载
  await nextTick();
  // 侦测当前路由容器内的图片加载
  const rootEl = routeContainer.value ?? document;
  const images = Array.from(rootEl?.querySelectorAll('img') || []);
  await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(res => {
    img.addEventListener('load', res, { once: true });
    img.addEventListener('error', res, { once: true });
  })));
  // 轻微延迟以平滑过渡
  setTimeout(() => { isLoading.value = false; }, 100);
});
</script>
