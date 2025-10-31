<template>
  <main class="bg-white dark:bg-gray-900 flex flex-col min-h-[calc(100vh-var(--navbar-height,0px))]">
    <div :style="wrapperStyle" class="flex flex-col">
      <section ref="pageRef" class="scroll-smooth h-[calc(100vh-var(--navbar-height,0px))] overflow-hidden relative">
        <div class="relative h-full px-6 sm:px-12 flex items-center">
          <!-- 补充 w-full，避免作为 flex 子项按内容收缩 -->
          <div class="max-w-6xl mx-auto w-full">
            <div class="text-center">
              <div class="flex items-center justify-center mb-6">
                <img ref="logoRef" src="/logo_download.png" alt="Download Logo" class="h-16 w-16 rounded-2xl shadow-lg ring-1 ring-white/10" />
              </div>
              <h1 ref="titleRef" class="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white">{{ t('download.page.heading') }}</h1>
              <p ref="subtitleRef" class="mt-3 md:mt-4 text-base md:text-lg text-gray-500 dark:text-gray-400">{{ t('download.page.subtitle') }}</p>

              <div class="mt-10">
                <div ref="panelRef" class="mx-auto w-full max-w-3xl relative overflow-hidden rounded-2xl bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 ring-1 ring-white/10 shadow-2xl transform origin-center scale-[0.9] sm:scale-100 transition-colors">
                  <div ref="sweepRef" class="sweep-border pointer-events-none absolute inset-0 rounded-2xl"></div>
                  <div ref="glowRef" class="glow-border pointer-events-none absolute inset-0 rounded-2xl"></div>
                  <div class="relative flex p-1 md:p-1.5 border-b border-white/10 bg-white/5">
                    <div ref="segRef" class="absolute inset-0 w-1/2 h-full rounded-xl bg-gradient-to-r from-sky-500/30 to-indigo-500/30 ring-1 ring-sky-400/40 shadow-inner pointer-events-none border border-gray-900/20 dark:border-white/40 will-change-transform"></div>
                    <button :class="osButtonClass('ae')" @click="selectedOS = 'ae'">AE</button>
                    <button :class="osButtonClass('eagle')" @click="selectedOS = 'eagle'">Eagle</button>
                  </div>

                  <div class="grid grid-cols-3 gap-4 md:gap-6 px-4 py-3 md:px-6 md:py-4 text-center">
                    <div class="rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5">
                      <div class="text-xs md:text-sm text-gray-400">{{ t('download.labels.version') }}</div>
                      <div ref="versionRef" class="mt-1 text-gray-900 dark:text-white font-semibold text-sm md:text-base whitespace-nowrap tracking-tight leading-tight">{{ platformInfo.version }}</div>
                    </div>
                    <div class="rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5">
                      <div class="text-xs md:text-sm text-gray-400">{{ t('download.labels.requirement') }}</div>
                      <div ref="requirementRef" class="mt-1 text-gray-900 dark:text-white font-semibold text-sm md:text-base whitespace-nowrap tracking-tight leading-tight">{{ getLocalized(platformInfo.requirement) }}</div>
                    </div>
                    <div class="rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5">
                      <div class="text-xs md:text-sm text-gray-400">{{ t('download.labels.updated') }}</div>
                      <div ref="updatedRef" class="mt-1 text-gray-900 dark:text-white font-semibold text-sm md:text-base whitespace-nowrap tracking-tight leading-tight">{{ platformInfo.updated }}</div>
                    </div>
                  </div>

                  <div class="px-6 pb-6">
                    <a href="#" @click.prevent="handleDownload" class="group w-full inline-flex items-center justify-center rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 ring-1 ring-white/10 shadow-lg shadow-sky-500/20 transition-transform duration-200 hover:scale-[1.02] border border-gray-900/20 dark:border-white/40">
                      <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      <span ref="ctaRef">{{ getLocalized(platformInfo.ctaText) || t('download.cta.' + selectedOS) }}</span>
                    </a>
                    <p ref="promptRef" class="mt-3 text-xs text-gray-400">{{ getLocalized(platformInfo.prompt) || t('download.prompt.' + selectedOS) || t('download.demoNote') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 z-20"><Footer /></div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import gsap from 'gsap'
import Footer from '../components/Footer.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const getLocalized = (val) => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const loc = locale.value
    if (typeof val[loc] === 'string') return val[loc]
    if (typeof val['en-US'] === 'string') return val['en-US']
    if (typeof val['zh-CN'] === 'string') return val['zh-CN']
    const first = Object.values(val).find(v => typeof v === 'string')
    return typeof first === 'string' ? first : ''
  }
  return ''
}

const pageRef = ref(null)
const logoRef = ref(null)
const titleRef = ref(null)
const subtitleRef = ref(null)
const panelRef = ref(null)
const segRef = ref(null)
const sweepRef = ref(null)
const glowRef = ref(null)
const versionRef = ref(null)
const requirementRef = ref(null)
const updatedRef = ref(null)
const ctaRef = ref(null)
const promptRef = ref(null)

// 下载面板切换：AE 与 Eagle
const selectedOS = ref('ae')

const platforms = ref({
  ae: {
    version: '1.0',
    requirement: 'Ae CC 2017+',
    updated: '2025-10-18',
    url: 'https://example.com/ae-plugin',
    // 文案优先以 i18n 为准，如需覆盖可在配置 JSON 提供 ctaText/prompt
    // ctaText: t('download.cta.ae'),
    // prompt: t('download.prompt.ae'),
    target: '_blank',
    downloadFilename: ''
  },
  eagle: {
    version: '1.0',
    requirement: 'Eagle 4.0+',
    updated: '2025-10-18',
    url: 'eagle://',
    // ctaText: t('download.cta.eagle'),
    // prompt: t('download.prompt.eagle'),
    target: 'protocol'
  }
})

const platformInfo = computed(() => platforms.value[selectedOS.value] || {})

const osButtonClass = (os) => {
  const base = 'relative z-10 flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition'
  return selectedOS.value === os
    ? base + ' text-gray-900 dark:text-white'
    : base + ' text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
}

const handleDownload = () => {
  const info = platformInfo.value
  if (!info) return
  const href = info.url || info.href
  if (!href) return
  const target = info.target || (typeof href === 'string' && href.startsWith('eagle://') ? 'protocol' : '_blank')

  if (target === 'protocol') {
    // 自定义协议（如 eagle://）
    window.location.href = href
  } else if (target === '_self') {
    // 当前窗口跳转
    window.location.href = href
  } else if (target === 'download') {
    // 触发浏览器下载（同源文件效果最佳）
    const a = document.createElement('a')
    a.href = href
    if (info.downloadFilename) a.download = info.downloadFilename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } else {
    // 默认新窗口打开
    window.open(href, '_blank')
  }
}

// 高度 wrapper
const wrapperStyle = computed(() => ({ minHeight: '100%' }))

const loadConfig = async () => {
  try {
    // 允许浏览器缓存命中，减少二次访问的网络往返
    const res = await fetch('/config/download.json')
    if (!res.ok) throw new Error('网络错误')
    const data = await res.json()
    if (data.platforms && typeof data.platforms === 'object') {
      platforms.value = data.platforms
    }
    if (data.defaultOS && ['ae', 'eagle'].includes(data.defaultOS)) {
      selectedOS.value = data.defaultOS
    }
  } catch (e) {
    console.warn('下载配置加载失败', e)
  }
}

onMounted(() => {
  const ctx = gsap.context(() => {
    gsap.set([logoRef.value, titleRef.value, subtitleRef.value, panelRef.value], { opacity: 0, y: 12 });
    gsap.set(segRef.value, { xPercent: selectedOS.value === 'ae' ? 0 : 100 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to([logoRef.value, titleRef.value, subtitleRef.value, panelRef.value], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1
    });

    // 动态扫光描边（GSAP 驱动 CSS 变量）
    const sweepTl = gsap.to(sweepRef.value, { '--angle': '+=360deg', duration: 7, ease: 'none', repeat: -1 });

    const handleMouseMove = (e) => {
      if (!panelRef.value) return;
      const rect = panelRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(glowRef.value, {
        '--glow-x': `${(x / rect.width) * 100}%`,
        '--glow-y': `${(y / rect.height) * 100}%`,
        duration: 0.6,
        ease: 'power2.out'
      });
    };

    const handleMouseEnter = () => {
      gsap.to(sweepRef.value, { opacity: 0, duration: 0.3 });
      gsap.to(glowRef.value, { opacity: 1, duration: 0.3 });
      panelRef.value.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseLeave = () => {
      gsap.to(sweepRef.value, { opacity: 1, duration: 0.3 });
      gsap.to(glowRef.value, { opacity: 0, duration: 0.3 });
      panelRef.value.removeEventListener('mousemove', handleMouseMove);
    };

    panelRef.value.addEventListener('mouseenter', handleMouseEnter);
    panelRef.value.addEventListener('mouseleave', handleMouseLeave);
  });

  void loadConfig();
  watch(selectedOS, async (val) => {
    const target = val === 'ae' ? 0 : 100;
    gsap.to(segRef.value, { xPercent: target, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(sweepRef.value, { opacity: 0.85 }, { opacity: 1, duration: 0.4, ease: 'sine.out' });

    // Timeline for info boxes (3D flip)
    const infoElements = [versionRef.value, requirementRef.value, updatedRef.value];
    const infoTl = gsap.timeline();
    infoTl.to(infoElements, {
      duration: 0.3,
      opacity: 0,
      rotationX: 90,
      transformOrigin: "center center -20",
      stagger: 0.1,
      ease: 'power2.in'
    });

    // Timeline for button and prompt (fade)
    const otherElements = [ctaRef.value, promptRef.value];
    const otherTl = gsap.timeline();
    otherTl.to(otherElements, {
        duration: 0.2, // Faster fade
        opacity: 0,
        ease: 'power2.in'
    });


    await nextTick();

    // Animate in
    infoTl.from(infoElements, {
      duration: 0.3,
      opacity: 0,
      rotationX: -90,
      transformOrigin: "center center -20",
      stagger: 0.1,
      ease: 'power2.out'
    }, "-=0.4");

    otherTl.from(otherElements, {
        duration: 0.3,
        opacity: 0,
        ease: 'power2.out'
    }, "-=0.1"); // Small overlap
  });
  return () => ctx.revert();
});
</script>

<style scoped>
.glow-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px; /* 控制描边粗细 */
  opacity: 0;
  --glow-x: 50%;
  --glow-y: 50%;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
:root .glow-border {
  /* 亮色模式 */
  background: radial-gradient(circle at var(--glow-x) var(--glow-y),
    rgba(0,0,0,0.5) 0%,
    rgba(0,0,0,0) 50%
  );
}
.dark .glow-border {
  /* 暗色模式 */
  background: radial-gradient(circle at var(--glow-x) var(--glow-y),
    rgba(34,211,238,0.8) 0%,
    rgba(99,102,241,0) 50%
  );
}
.sweep-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px; /* 控制描边粗细 */
  --angle: 0deg;
  animation: sweep-rotate 7s linear infinite;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
:root .sweep-border {
  /* 亮色模式：暗色描边扫光 */
  background: conic-gradient(from var(--angle),
    rgba(0,0,0,0) 0deg,
    rgba(0,0,0,0.25) 60deg,
    rgba(0,0,0,0.35) 120deg,
    rgba(0,0,0,0.25) 180deg,
    rgba(0,0,0,0) 240deg,
    rgba(0,0,0,0) 360deg);
}
.dark .sweep-border {
  /* 暗色模式：亮色描边扫光 */
  background: conic-gradient(from var(--angle),
    rgba(34,211,238,0) 0deg,
    rgba(34,211,238,0.55) 60deg,
    rgba(99,102,241,0.65) 120deg,
    rgba(34,211,238,0.55) 180deg,
    rgba(99,102,241,0) 240deg,
    rgba(34,211,238,0) 360deg);
}
@keyframes sweep-rotate {
  to { --angle: 360deg; }
}
</style>