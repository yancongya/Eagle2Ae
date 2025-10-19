<template>
  <!-- Visual elements for drag interaction -->
  <div class="fixed inset-0 z-[9998] pointer-events-none" v-if="showLogos">
    <!-- Connecting Line -->
    <svg class="absolute inset-0 w-full h-full z-0">
      <line :x1="lineStartOffset.x" :y1="lineStartOffset.y"
            :x2="logo2Pos.x + 20" :y2="logo2Pos.y + 20"
            stroke="rgba(255, 255, 255, 0.7)" stroke-width="3" stroke-dasharray="5,5" />
    </svg>

    <!-- Logo 1 (Start Point) with rotation and scale -->
    <img :src="logo1Src" alt="Logo 1" 
         class="absolute w-10 h-10 shadow-lg z-10 pointer-events-none"
         ref="logo1El"
         :style="{ 
           left: `${logo1Pos.x}px`, 
           top: `${logo1Pos.y}px`,
           transform: `rotate(${rotationAngle}deg) scale(${logoScale * shrinkProgress})`,
           transformOrigin: 'center'
         }" />

    <!-- Logo 2 (End Point, follows mouse) -->
    <img :src="logo2Src" alt="Logo 2" 
         class="absolute w-10 h-10 shadow-lg z-10 pointer-events-none"
         ref="logo2El"
         :style="{ left: `${logo2Pos.x}px`, top: `${logo2Pos.y}px`, transform: `scale(${shrinkProgress})`, transformOrigin: 'center' }" />
  </div>
  
  <!-- Body-wide event listeners for detecting empty space dragging -->
  <div ref="dragDetector"
       class="fixed inset-0 z-[-1] pointer-events-none"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave">
  </div>
  
  <!-- Explosion overlay SVG (physics-driven fragments) -->
  <svg v-if="explosionVisible" class="fixed inset-0 z-[9999] pointer-events-none" width="100%" height="100%" preserveAspectRatio="none" :style="{ opacity: explosionOpacity }">
    <template v-for="frag in explosionFragments" :key="frag.id">
      <!-- 支持本地 SVG 图片作为爆炸碎片 -->
      <image v-if="frag.type === 'image'"
             :href="frag.src"
             :x="frag.x - frag.width / 2" :y="frag.y - frag.height / 2"
             :width="frag.width" :height="frag.height"
             :transform="`rotate(${(frag.angle * 180 / Math.PI).toFixed(2)}, ${frag.x}, ${frag.y})`"
             style="pointer-events: none;" />
      <!-- 备选形状：圆形和多边形 -->
      <circle v-else-if="frag.type === 'circle'"
              :cx="frag.x" :cy="frag.y" :r="frag.radius"
              :fill="frag.fill"
              :transform="`rotate(${(frag.angle * 180 / Math.PI).toFixed(2)}, ${frag.x}, ${frag.y})`"
              style="pointer-events: none;" />
      <polygon v-else
               :points="polygonPoints(frag.sides, frag.radius, frag.x, frag.y)"
               :fill="frag.fill"
               :transform="`rotate(${(frag.angle * 180 / Math.PI).toFixed(2)}, ${frag.x}, ${frag.y})`"
               style="pointer-events: none;" />
    </template>
  </svg>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Engine, Runner, Bodies, Body, Composite } from 'matter-js';

gsap.registerPlugin(ScrollToPlugin, CustomEase);
CustomEase.create('fastOut', 'M0,0 C0.93,0.17 0.93,0.17 1,1');

// Explosion state and helpers
const explosionVisible = ref(false);
const explosionFragments = ref([]); // { id, type, radius, sides, fill, x, y, angle } 或 { id, type:'image', src, width, height, x, y, angle }
const explosionOpacity = ref(1);
let explosionEngine = null;
let explosionRunner = null;
let explosionTimer = null;
let explosionBodies = []; // 暴露给滚动交互使用
let baseGravityY = 1.3;
let lastScrollY = 0;
let lastScrollTime = 0;
let handleScrollFn = null;

const palette = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f4f1de'];
const randomColor = () => palette[(Math.random() * palette.length) | 0];

const polygonPoints = (sides, radius, cx, cy) => {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push(`${(cx + Math.cos(a) * radius).toFixed(2)},${(cy + Math.sin(a) * radius).toFixed(2)}`);
  }
  return pts.join(' ');
};

const spawnExplosion = (originX, originY, power = 1) => {
  try {
    // 清理旧实例
    if (explosionRunner) {
      Runner.stop(explosionRunner);
      explosionRunner = null;
    }
    gsap.killTweensOf(explosionOpacity);
    explosionOpacity.value = 1;
    explosionEngine = Engine.create();
    const world = explosionEngine.world;
    world.gravity.y = baseGravityY;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const floor = Bodies.rectangle(width / 2, height + 40, width + 200, 80, { isStatic: true, restitution: 0.6 });
    const leftWall = Bodies.rectangle(-40, height / 2, 80, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 40, height / 2, 80, height, { isStatic: true });
    Composite.add(world, [floor, leftWall, rightWall]);

    const minPower = 0.6, maxPower = 2.4;
    const p = Math.max(minPower, Math.min(power, maxPower));
    const ratio = Math.min(Math.max((p - minPower) / (maxPower - minPower), 0), 1);
    const minCount = 6, maxCount = 34;
    const count = Math.round(minCount + ratio * (maxCount - minCount));
    const speedMin = 4 + ratio * 8;   // 4 -> 12
    const speedMax = 10 + ratio * 18; // 10 -> 28
    const upBoost = 2.2 + ratio * 2.8;  // 2.2 -> 5.0

    const bodies = [];
    explosionFragments.value = [];

    for (let i = 0; i < count; i++) {
      const useSprite = Array.isArray(opts.value.explosionSprites) && opts.value.explosionSprites.length > 0;
      const type = useSprite ? 'image' : (Math.random() < 0.4 ? 'circle' : 'polygon');
      let body, frag;
      if (type === 'image') {
        const src = opts.value.explosionSprites[(Math.random() * opts.value.explosionSprites.length) | 0];
        const radius = 10 + Math.random() * 12;
        body = Bodies.circle(originX, originY, radius, { restitution: 0.7, friction: 0.02, frictionAir: 0.012 });
        frag = { id: i, type, src, width: radius * 2, height: radius * 2, x: originX, y: originY, angle: 0 };
      } else if (type === 'circle') {
        const radius = 6 + Math.random() * 10;
        body = Bodies.circle(originX, originY, radius, { restitution: 0.7, friction: 0.02, frictionAir: 0.012 });
        frag = { id: i, type, radius, sides: undefined, fill: randomColor(), x: originX, y: originY, angle: 0 };
      } else {
        const side = Math.floor(3 + Math.random() * 3);
        const radius = 6 + Math.random() * 10;
        body = Bodies.polygon(originX, originY, side, radius, { restitution: 0.7, friction: 0.02, frictionAir: 0.012 });
        frag = { id: i, type: 'polygon', radius, sides: side, fill: randomColor(), x: originX, y: originY, angle: 0 };
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      Body.setVelocity(body, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed - upBoost });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.8);
      bodies.push(body);
      explosionFragments.value.push(frag);
    }

    Composite.add(world, bodies);
    explosionBodies = bodies; // 保存到全局，滚动交互使用
    explosionRunner = Runner.create();
    Runner.run(explosionRunner, explosionEngine);
    explosionVisible.value = true;

    let reqId = 0;
    const update = () => {
      const arr = explosionFragments.value;
      for (let i = 0; i < arr.length; i++) {
        const b = explosionBodies[i];
        arr[i].x = b.position.x;
        arr[i].y = b.position.y;
        arr[i].angle = b.angle;
      }
      reqId = requestAnimationFrame(update);
    };
    reqId = requestAnimationFrame(update);

    clearTimeout(explosionTimer);
    const fadeMs = opts.value.explosionFadeOutMs;
    const visibleMs = Math.max(0, opts.value.explosionDurationMs - fadeMs);
    const cleanup = () => {
      cancelAnimationFrame(reqId);
      if (explosionRunner) Runner.stop(explosionRunner);
      explosionRunner = null;
      explosionEngine = null;
      explosionBodies = [];
      explosionVisible.value = false;
      explosionFragments.value = [];
      explosionOpacity.value = 1;
    };
    explosionTimer = setTimeout(() => {
      gsap.to(explosionOpacity, { value: 0, duration: fadeMs / 1000, ease: 'power1.out', onComplete: cleanup });
    }, visibleMs);
  } catch (err) {
    console.warn('Explosion spawn failed', err);
  }
};

// props 扩展：支持本地替换图片与爆炸碎片资源
const props = defineProps({
  enabled: { type: Boolean, default: true },
  logo1Src: { type: String, default: '/src/assets/logo.png' },
  logo2Src: { type: String, default: '/src/assets/logo2.png' },
  explosionSprites: { type: Array, default: () => ['/explosion/frag-star.svg','/explosion/frag-ring.svg','/explosion/frag-triangle.svg','/explosion/frag-bolt.svg','/explosion/frag-shard.svg'] },
  explosionDurationMs: { type: Number, default: 7000 },
  explosionFadeOutMs: { type: Number, default: 900 }
});

// 外部配置（来自 /config/drag-to-top.json），与 props 合并后统一使用
const externalConfig = ref({});
const opts = computed(() => ({ ...props, ...(externalConfig.value || {}) }));
watch(() => opts.value.baseGravityY, (val) => {
  if (typeof val === 'number') baseGravityY = val;
});

const dragDetector = ref(null);
// 允许通过本地配置覆盖 props
const logo1Src = computed(() => opts.value.logo1Src);
const logo2Src = computed(() => opts.value.logo2Src);

const isDragging = ref(false);
const showLogos = ref(false);
const isMouseOverEmptySpace = ref(false); // Track if mouse is over empty space
const startPos = ref({ x: 0, y: 0 });
const currentPos = ref({ x: 0, y: 0 });
const logo1Pos = ref({ x: 0, y: 0 });
const logo2Pos = ref({ x: 0, y: 0 });

// 元素引用：用于收尾动画缩放/淡出
const logo1El = ref(null);
const logo2El = ref(null);
// 新增：收尾阶段的整体缩放进度（1→0）
const shrinkProgress = ref(1);

const dragThreshold = 45; // 更友好的触发距离，避免需要拖得很远

// 根据距离动态映射移动时长：距离越远→时长越短→加速更快
const getMoveDurationByDistance = (distance) => {
  const min = 0.12; // 最快
  const max = 0.26; // 最慢（很近的距离）
  const normalized = Math.min(Math.max(distance / 800, 0), 1); // 0~1
  const factor = Math.sqrt(normalized); // 压缩极值，远距离提升更明显
  return max - (max - min) * factor;
};

// 新增：根据拖拽距离映射爆炸强度（影响数量与速度）
const getExplosionPowerByDistance = (distance) => {
  const maxPower = 2.4;
  const minPower = 0.6;
  const normalized = Math.min(Math.max(distance / 1600, 0), 1);
  const curved = Math.pow(normalized, 1.6);
  return minPower + curved * (maxPower - minPower);
};

// 统一的滚动到顶部方法：完成后触发回调（若提供）
const scrollWindowToTop = (onComplete) => {
  const hasPlugin = !!(gsap && gsap.plugins && gsap.plugins.ScrollToPlugin);
  if (hasPlugin) {
    gsap.to(window, { duration: 1.0, scrollTo: 0, ease: 'power2.out', onComplete });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof onComplete === 'function') {
      const done = () => {
        if (window.scrollY === 0) {
          window.removeEventListener('scroll', done);
          onComplete();
        }
      };
      window.addEventListener('scroll', done, { passive: true });
      const poll = setInterval(() => {
        if (window.scrollY === 0) {
          clearInterval(poll);
          window.removeEventListener('scroll', done);
          onComplete();
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 4000);
    }
  }
};

// 判断某点是否位于 Hero 区域（通过 elementsFromPoint 命中 hero-section 或其祖先）
const isPointInHero = (x, y) => {
  const heroEl = document.getElementById('hero-section');
  if (!heroEl) return false;
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    let cur = el;
    while (cur) {
      if (cur === heroEl) return true;
      cur = cur.parentElement;
    }
  }
  return false;
};

// 计算拖拽方向的角度
const rotationAngle = computed(() => {
  const dx = currentPos.value.x - startPos.value.x;
  const dy = currentPos.value.y - startPos.value.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return angle;
});

// 计算 logo 的缩放比例，随拖拽距离增加而放大，使用对数函数实现阻尼效果
const logoScale = computed(() => {
  const dx = currentPos.value.x - startPos.value.x;
  const dy = currentPos.value.y - startPos.value.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const scale = 1 + Math.log(1 + distance / 200) * 0.8;
  return scale;
});

const lineStartOffset = computed(() => {
  const logo1CenterX = logo1Pos.value.x + 20;
  const logo1CenterY = logo1Pos.value.y + 20;
  const logo2CenterX = logo2Pos.value.x + 20;
  const logo2CenterY = logo2Pos.value.y + 20;
  const radius = 20;
  const dx = logo2CenterX - logo1CenterX;
  const dy = logo2CenterY - logo1CenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) {
    return { x: logo1CenterX, y: logo1CenterY };
  }
  const ratio = radius / distance;
  const offsetX = dx * ratio;
  const offsetY = dy * ratio;
  return { x: logo1CenterX + offsetX, y: logo1CenterY + offsetY };
});

// 检测鼠标是否在空区域
const checkIfOverEmptySpace = (event) => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY);
  if (elements.length > 0) {
    const topElement = elements[0];
    const tagName = topElement.tagName;
    const elementId = typeof topElement.id === 'string' ? topElement.id : '';
    const classList = topElement.classList;
    const rawClassName = topElement.className;
    const classNameStr = typeof rawClassName === 'string' ? rawClassName : (rawClassName && typeof rawClassName.baseVal === 'string' ? rawClassName.baseVal : '');
    const hasClass = (name) => {
      if (!name) return false;
      if (classList && typeof classList.contains === 'function') return classList.contains(name);
      return classNameStr.includes(name);
    };
    const isInteractiveTag = tagName === 'BUTTON' || tagName === 'A' || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || tagName === 'LABEL' || tagName === 'AUDIO' || tagName === 'VIDEO' || tagName === 'IFRAME';
    const hasInteractiveClass = hasClass('no-drag') || hasClass('button') || hasClass('btn') || hasClass('link') || hasClass('nav') || hasClass('menu');
    const hasInteractiveId = elementId && (elementId.includes('button') || elementId.includes('btn') || elementId.includes('nav') || elementId.includes('menu'));
    const hasInteractiveAttribute = topElement.hasAttribute('onclick') || topElement.hasAttribute('onmousedown') || topElement.hasAttribute('href');
    const style = getComputedStyle(topElement);
    const hasInteractiveCursor = style.cursor === 'pointer' || style.cursor === 'move' || style.cursor === 'grab' || style.cursor === 'grabbing';
    const hasPE = style.pointerEvents === 'none';
    const isInteractive = isInteractiveTag || hasInteractiveClass || hasInteractiveId || hasInteractiveAttribute || hasInteractiveCursor;
    return (!isInteractive) || hasPE;
  }
  return true;
};

const handleMouseEnter = (event) => {
  if (!isDragging.value) {
    const isEmptySpace = checkIfOverEmptySpace(event);
    isMouseOverEmptySpace.value = isEmptySpace;
    document.body.style.cursor = isEmptySpace ? 'grab' : '';
  }
};

const handleMouseLeave = () => {
  if (!isDragging.value) {
    isMouseOverEmptySpace.value = false;
    document.body.style.cursor = '';
  }
};

const handleMouseDown = (event) => {
  if (!opts.value.enabled) return;
  const isEmptySpace = checkIfOverEmptySpace(event);
  if (isEmptySpace) {
    isDragging.value = true;
    showLogos.value = true;
    shrinkProgress.value = 1;
    document.body.style.cursor = 'grabbing';
    startPos.value = { x: event.clientX, y: event.clientY };
    logo1Pos.value = { x: event.clientX - 20, y: event.clientY - 20 };
    currentPos.value = { x: event.clientX, y: event.clientY };
    logo2Pos.value = { x: event.clientX - 20, y: event.clientY - 20 };
  } else {
    return;
  }
  if (event.button !== 0) return;
  event.preventDefault();
};

const handleTouchStart = (event) => {
  if (!opts.value.enabled) return;
  if (event.touches.length > 1) return;
  const touch = event.touches[0];
  isDragging.value = true;
  showLogos.value = true;
  startPos.value = { x: touch.clientX, y: touch.clientY };
  logo1Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 };
  currentPos.value = { x: touch.clientX, y: touch.clientY };
  logo2Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 };
  event.preventDefault();
};

const handleMouseMove = (event) => {
  if (!opts.value.enabled) return;
  if (isDragging.value) {
    currentPos.value = { x: event.clientX, y: event.clientY };
    logo2Pos.value = { x: event.clientX - 20, y: event.clientY - 20 };
    document.body.style.cursor = 'grabbing';
  }
};

const handleTouchMove = (event) => {
  if (!opts.value.enabled) return;
  if (isDragging.value && event.touches.length > 0) {
    const touch = event.touches[0];
    currentPos.value = { x: touch.clientX, y: touch.clientY };
    logo2Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 };
  }
};

const resetCursorByCurrentPos = () => {
  const event = new MouseEvent('mousemove', { clientX: currentPos.value.x, clientY: currentPos.value.y });
  const isEmptySpace = checkIfOverEmptySpace(event);
  isMouseOverEmptySpace.value = isEmptySpace;
  document.body.style.cursor = isEmptySpace ? 'grab' : '';
};

const handleMouseUp = () => {
  if (!opts.value.enabled) return;
  if (isDragging.value) {
    isDragging.value = false;
    const dx = currentPos.value.x - startPos.value.x;
    const dy = currentPos.value.y - startPos.value.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    if (dragDistance > dragThreshold) {
      const startInHero = isPointInHero(startPos.value.x, startPos.value.y);
      const endInHero = isPointInHero(currentPos.value.x, currentPos.value.y);
      const action = (startInHero && endInHero) ? 'refresh' : 'scrollTop';
      const ox = logo1Pos.value.x + 20;
      const oy = logo1Pos.value.y + 20;
      if (!logo1El.value || !logo2El.value) {
        showLogos.value = false;
        const power = getExplosionPowerByDistance(dragDistance);
        if (action === 'refresh') {
          sessionStorage.setItem('postReloadExplosion', JSON.stringify({ x: ox, y: oy, power }));
          location.reload();
          resetCursorByCurrentPos();
        } else {
          scrollWindowToTop(() => {
            spawnExplosion(ox, oy, power);
            resetCursorByCurrentPos();
          });
        }
        return;
      }
      showLogos.value = true;
      const tl = gsap.timeline({ defaults: { ease: 'fastOut' } });
      const dist = Math.hypot(logo2Pos.value.x - logo1Pos.value.x, logo2Pos.value.y - logo1Pos.value.y);
      const moveDuration = getMoveDurationByDistance(dist);
      tl.to(logo2Pos.value, { x: logo1Pos.value.x, y: logo1Pos.value.y, duration: moveDuration, ease: 'fastOut' }, 0);
      tl.to(shrinkProgress, { value: 0, duration: 0.18, ease: 'fastOut' }, '>-0.02');
      tl.to([logo1El.value, logo2El.value], { opacity: 0, duration: 0.18, ease: 'fastOut' }, '<');
      tl.call(() => {
        showLogos.value = false;
        const power = getExplosionPowerByDistance(dragDistance);
        if (action === 'refresh') {
          sessionStorage.setItem('postReloadExplosion', JSON.stringify({ x: ox, y: oy, power }));
          location.reload();
          resetCursorByCurrentPos();
        } else {
          scrollWindowToTop(() => {
            spawnExplosion(ox, oy, power);
            resetCursorByCurrentPos();
          });
        }
      });
    } else {
      showLogos.value = false;
      resetCursorByCurrentPos();
    }
  }
};

const handleTouchEnd = () => {
  if (!opts.value.enabled) return;
  if (isDragging.value) {
    isDragging.value = false;
    const dx = currentPos.value.x - startPos.value.x;
    const dy = currentPos.value.y - startPos.value.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    if (dragDistance > dragThreshold) {
      const startInHero = isPointInHero(startPos.value.x, startPos.value.y);
      const endInHero = isPointInHero(currentPos.value.x, currentPos.value.y);
      const action = (startInHero && endInHero) ? 'refresh' : 'scrollTop';
      const ox = logo1Pos.value.x + 20;
      const oy = logo1Pos.value.y + 20;
      if (!logo1El.value || !logo2El.value) {
        showLogos.value = false;
        const power = getExplosionPowerByDistance(dragDistance);
        if (action === 'refresh') {
          sessionStorage.setItem('postReloadExplosion', JSON.stringify({ x: ox, y: oy, power }));
          location.reload();
        } else {
          scrollWindowToTop(() => spawnExplosion(ox, oy, power));
        }
        return;
      }
      showLogos.value = true;
      const tl = gsap.timeline({ defaults: { ease: 'fastOut' } });
      const dist = Math.hypot(logo2Pos.value.x - logo1Pos.value.x, logo2Pos.value.y - logo1Pos.value.y);
      const moveDuration = getMoveDurationByDistance(dist);
      tl.to(logo2Pos.value, { x: logo1Pos.value.x, y: logo1Pos.value.y, duration: moveDuration, ease: 'fastOut' }, 0);
      tl.to(shrinkProgress, { value: 0, duration: 0.18, ease: 'fastOut' }, '>-0.02');
      tl.to([logo1El.value, logo2El.value], { opacity: 0, duration: 0.18, ease: 'fastOut' }, '<');
      tl.call(() => {
        showLogos.value = false;
        const power = getExplosionPowerByDistance(dragDistance);
        if (action === 'refresh') {
          sessionStorage.setItem('postReloadExplosion', JSON.stringify({ x: ox, y: oy, power }));
          location.reload();
        } else {
          scrollWindowToTop(() => spawnExplosion(ox, oy, power));
        }
      });
    } else {
      showLogos.value = false;
    }
  }
};

onMounted(() => {
  // 加载本地 JSON 配置（若存在则覆盖 props）
  (async () => {
    try {
      const res = await fetch('/config/drag-to-top.json', { cache: 'no-store' });
      if (res.ok) {
        externalConfig.value = await res.json();
        if (typeof externalConfig.value.baseGravityY === 'number') {
          baseGravityY = externalConfig.value.baseGravityY;
        }
      }
    } catch (e) { /* 忽略配置加载错误，保留默认值 */ }
  })();

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchcancel', handleTouchEnd);

  // 滚动交互：下滚轻重力并给碎片上抛冲量
  lastScrollY = window.scrollY;
  lastScrollTime = performance.now();
  handleScrollFn = () => {
    if (!explosionEngine || !explosionVisible.value || explosionBodies.length === 0) return;
    const now = performance.now();
    const y = window.scrollY;
    const dy = y - lastScrollY;
    const dt = Math.max(now - lastScrollTime, 16);
    lastScrollY = y;
    lastScrollTime = now;

    const scrollCfg = opts.value.scroll || {};
    const deadband = scrollCfg.deadbandDy ?? 2;
    if (Math.abs(dy) < deadband) return; // 极小滚动不触发交互

    const world = explosionEngine.world;
    if (dy > 0) {
      // 向下滚动：轻微减重力 + 适度上抛，恢复抛空感（由配置驱动）
      const down = scrollCfg.down || {};
      const targetG = Math.max(Math.min(baseGravityY * (down.gravityFactor ?? 0.85), baseGravityY), 0.2);
      gsap.to(world.gravity, { y: targetG, duration: 0.1, overwrite: true });
      const speed = dy / dt; // px/ms
      const coeff = down.impulseCoeff ?? 0.0028;
      const minI = down.impulseMin ?? 0.0008;
      const maxI = down.impulseMax ?? 0.010;
      const impulseUp = Math.min(Math.max(speed * coeff, minI), maxI);
      for (let i = 0; i < explosionBodies.length; i++) {
        const b = explosionBodies[i];
        Body.applyForce(b, b.position, { x: 0, y: -impulseUp });
      }
      gsap.to(world.gravity, { y: baseGravityY, duration: (down.restoreDurationMs ?? 700) / 1000, delay: (down.restoreDelayMs ?? 60) / 1000, ease: 'power1.out', overwrite: true });
    } else if (dy < 0) {
      // 向上滚动：保持稍高重力，碎片更快落地（由配置驱动）
      const up = scrollCfg.up || {};
      gsap.to(world.gravity, { y: Math.min(baseGravityY * (up.gravityFactor ?? 1.45), (up.gravityMax ?? 2.0)), duration: (up.durationMs ?? 200) / 1000, overwrite: true });
      gsap.to(world.gravity, { y: baseGravityY, duration: (up.restoreDurationMs ?? 800) / 1000, delay: (up.restoreDelayMs ?? 50) / 1000, ease: 'power1.out', overwrite: true });
    }
  };
  window.addEventListener('scroll', handleScrollFn, { passive: true });

  // 刷新后继续在原位置爆炸（来自 sessionStorage）
  const pending = sessionStorage.getItem('postReloadExplosion');
  if (pending) {
    sessionStorage.removeItem('postReloadExplosion');
    try {
      const { x, y, power } = JSON.parse(pending);
      setTimeout(() => spawnExplosion(x, y, power ?? 1), 200);
    } catch (e) {}
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchstart', handleTouchStart, { passive: false });
  document.removeEventListener('touchmove', handleTouchMove, { passive: false });
  document.removeEventListener('touchend', handleTouchEnd);
  document.removeEventListener('touchcancel', handleTouchEnd);
  if (handleScrollFn) window.removeEventListener('scroll', handleScrollFn);
  if (explosionRunner) Runner.stop(explosionRunner);
  explosionRunner = null;
  explosionEngine = null;
  explosionBodies = [];
  explosionVisible.value = false;
  explosionFragments.value = [];
  document.body.style.cursor = '';
});
</script>

<style scoped>
/* Styles for DragToTop component */
</style>