<template>
  <div class="relative w-full h-full">
    <!-- 骨架屏 -->
    <transition name="fade">
      <LoadingIndicator 
        v-if="showSkeleton && hideUntilLoaded && !loaded" 
        :label="label" 
        :variant="variant" 
      />
    </transition>
    <!-- iframe -->
    <iframe 
      v-if="shouldLoad"
      :src="src" 
      class="w-full h-full border-0 transition-opacity duration-700"
      :class="iframeOpacityClass"
      :data-panel="panelId"
      :title="label"
      @load="$emit('load')">
    </iframe>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadingIndicator from './LoadingIndicator.vue';

const props = defineProps({
  panelId: {
    type: String,
    required: true
  },
  loaded: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary'
  },
  src: {
    type: String,
    required: true
  },
  shouldLoad: {
    type: Boolean,
    default: true
  },
  hideUntilLoaded: {
    type: Boolean,
    default: true
  },
  showSkeleton: {
    type: Boolean,
    default: true
  },
  // 新增：点击激活后触发渐显（与占位退出同步）
  reveal: {
    type: Boolean,
    default: false
  }
});

defineEmits(['load']);
// 计算 iframe 显示策略：当 hideUntilLoaded=false 时，点击后立刻可见
const iframeOpacityClass = computed(() => {
  // 默认行为：在未加载时隐藏 iframe，加载完成淡入
  if (props.hideUntilLoaded) {
    return props.loaded ? 'opacity-100' : 'opacity-0';
  }
  // 新行为：允许在点击激活时就渐显（无需等 loaded）
  return (props.reveal || props.loaded) ? 'opacity-100' : 'opacity-0';
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.relative {
  contain: layout style paint;
}

iframe {
  will-change: opacity;
}
</style>