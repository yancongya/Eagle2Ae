<template>
  <div
    class="absolute inset-0 z-10 cursor-pointer"
    :class="containerClass"
    @click="onActivate"
    @touchstart.stop.prevent="onActivate"
  >
    <!-- Visual placeholder according to mode -->
    <div
      v-if="mode !== 'empty'"
      ref="overlayRef"
      class="w-full h-full flex items-center justify-center select-none transition-opacity duration-300 placeholder-aurora"
      :class="[overlayClass, { 'placeholder-exited': exited }]"
      :style="overlayStyle"
    >
      <div class="text-center pointer-events-none">
        <div class="font-medium text-sm text-black dark:text-white">{{ label }}</div>
      </div>
    </div>

  </div>
  
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  panelId: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, default: 'idle' }, // idle | queued | loading | error
  mode: { type: String, default: 'frosted' }, // 'solid' | 'frosted' | 'empty'
  blurRadius: { type: Number, default: 8 },
  // 进入时的坐标（页面坐标），用于暂停时的圆形遮罩入场动画
  enterX: { type: Number, default: null },
  enterY: { type: Number, default: null },
});

const emit = defineEmits(['activate']);
const overlayRef = ref(null);
const exited = ref(false);

// 需求简化：固定显示面板名，不展示状态文案或重试按钮

const containerClass = computed(() => 'cursor-pointer');

const overlayClass = computed(() => {
  if (props.mode === 'solid') return 'placeholder-elev';
  if (props.mode === 'frosted') return 'placeholder-elev backdrop-blur';
  return '';
});

const overlayStyle = computed(() => {
  if (props.mode === 'frosted') {
    return { '--tw-backdrop-blur': `blur(${props.blurRadius}px)` };
  }
  return {};
});

onMounted(() => {
  // 在暂停导致的占位层显示时，若提供 enterX/enterY，则执行圆形遮罩入场动画
  const el = overlayRef.value;
  if (!el || typeof el.animate !== 'function') return;
  if (props.enterX == null || props.enterY == null) return;
  const rect = el.getBoundingClientRect();
  const cx = props.enterX - rect.left;
  const cy = props.enterY - rect.top;
  const radius = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
  el.animate([
    { clipPath: `circle(0px at ${cx}px ${cy}px)`, opacity: 1 },
    { clipPath: `circle(${radius}px at ${cx}px ${cy}px)`, opacity: 1 }
  ], { duration: 700, easing: 'cubic-bezier(.25,.8,.25,1)' });
});

function onActivate(e) {
  if (exited.value) { emit('activate'); return; }
  const el = overlayRef.value;
  if (el && typeof el.animate === 'function') {
    const rect = el.getBoundingClientRect();
    const clickX = (e && typeof e.clientX === 'number') ? e.clientX : rect.left + rect.width / 2;
    const clickY = (e && typeof e.clientY === 'number') ? e.clientY : rect.top + rect.height / 2;
    const cx = clickX - rect.left;
    const cy = clickY - rect.top;
    const radius = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
    // 圆形遮罩从点击点扩散，但保持不透明，直至父级在加载完成时卸载
    el.animate([
      { clipPath: `circle(0px at ${cx}px ${cy}px)`, opacity: 1 },
      { clipPath: `circle(${radius}px at ${cx}px ${cy}px)`, opacity: 1 }
    ], { duration: 700, easing: 'cubic-bezier(.25,.8,.25,1)' });
  }
  // 立即通知父级开始加载，但不隐藏占位层；卸载由父级在 loaded 时完成
  emit('activate');
}
</script>

<style scoped>
/* fallback if Tailwind backdrop utilities not enough */
.backdrop-blur {
  backdrop-filter: var(--tw-backdrop-blur, blur(8px));
}

/* Aurora-style animated gradient with layered conic rotations */
.placeholder-aurora {
  position: relative;
  overflow: hidden;
  /* Base pastel gradient (light mode) */
  background: linear-gradient(135deg, #ffe8f3, #d9f3ff);
}
.dark .placeholder-aurora {
  /* Dark-friendly base gradient (lower brightness) */
  background: linear-gradient(135deg, #0f131a, #171c24);
}

.placeholder-aurora::before,
.placeholder-aurora::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  filter: blur(40px);
  opacity: 0.8;
  /* Light palette */
  background: conic-gradient(from 0deg,
    #ff9aa2,
    #ffb7b2,
    #ffdac1,
    #e2f0cb,
    #a2e4ff,
    #c9afff,
    #ffb7b2,
    #ff9aa2
  );
  animation: rotate 8s linear infinite;
}
.placeholder-aurora::after {
  width: 180%;
  height: 180%;
  opacity: 0.6;
  animation: rotate-reverse 10s linear infinite;
}

.dark .placeholder-aurora::before,
.dark .placeholder-aurora::after {
  /* Dark palette */
  background: conic-gradient(from 0deg,
    #6b78ff,
    #5aa6ff,
    #67e8f9,
    #34d399,
    #fde68a,
    #f472b6,
    #a78bfa,
    #6b78ff
  );
}

/* 点击激活后，本地隐藏占位层，等待父级加载完成时卸载组件 */
.placeholder-exited { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }

/* Reduce glow intensity in dark mode */
.dark .placeholder-aurora::before { opacity: 0.55; filter: blur(36px); }
.dark .placeholder-aurora::after { opacity: 0.35; filter: blur(36px); }

.placeholder-elev {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.dark .placeholder-elev {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

@keyframes rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes rotate-reverse {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(-360deg); }
}
</style>