<template>
  <main class="flex flex-col min-h-[calc(100vh-var(--navbar-height,0px))]">
    <section class="flex-1 flex items-center">
      <div class="relative w-full px-6 sm:px-12">
        <div class="max-w-6xl mx-auto w-full">
          <div class="text-center">
            <h1 ref="headingRef" class="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white">{{ headingText }}</h1>
            <p ref="descRef" class="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300">{{ descText }}</p>

            <!-- 社交链接区 -->
            <div class="mt-10 mx-auto w-full max-w-3xl">
              <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a v-for="(btn, idx) in socialButtons" :key="btn.id" :href="btn.href" target="_blank" rel="noopener"
                   :ref="el => { if (el) { if (!btnRefs.value) btnRefs.value = []; btnRefs.value[idx] = el } }"
                   class="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg ring-1 ring-white/10 shadow-sm transition duration-200 ease-out hover:ring-white/30 hover:shadow-lg hover:scale-110 hover:brightness-110 hover:saturate-110 hover:contrast-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transform-gpu"
                   :style="{
                     color: btn.colors?.textColor || '#fff',
                     backgroundImage: btn.colors?.from && btn.colors?.to ? `linear-gradient(to right, ${btn.colors.from}, ${btn.colors.to})` : undefined,
                     backgroundColor: (!btn.colors?.from && btn.colors?.bg) ? btn.colors.bg : undefined
                   }">
                  <img :src="btn.icon" alt="" class="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup>
import Footer from '../components/Footer.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { gsap } from 'gsap'

const { t, locale } = useI18n()

const headingText = computed(() => t('nav.about.page.heading'))

const descText = computed(() => t('nav.about.page.description'))

const socialButtons = ref([])
const btnRefs = ref([])
const headingRef = ref(null)
const descRef = ref(null)

const loadSocialConfig = async () => {
  try {
    const res = await fetch('/config/about-socials.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('网络错误')
    const data = await res.json()
    const items = Array.isArray(data?.buttons) ? data.buttons : []
    socialButtons.value = items.map(it => ({
      id: it.id,
      icon: it.iconPath || it.icon || '',
      href: it.href || it.link,
      colors: it.colors || {}
    }))
  } catch (e) {
    console.warn('About 社交配置加载失败', e)
    socialButtons.value = [
      {
        id: 'github', icon: '/images/social/github.svg', href: 'https://github.com',
        colors: { from: '#4b5563', to: '#111827', textColor: '#fff' }
      },
      {
        id: 'twitter', icon: '/images/social/twitter.svg', href: 'https://twitter.com',
        colors: { from: '#0ea5e9', to: '#4f46e5', textColor: '#fff' }
      },
      {
        id: 'bilibili', icon: '/images/social/bilibili.svg', href: 'https://www.bilibili.com',
        colors: { from: '#ec4899', to: '#be123c', textColor: '#fff' }
      }
    ]
  }
}

watch(() => locale.value, async () => {
  await loadSocialConfig()
})

onMounted(async () => {
  await loadSocialConfig()
  await nextTick()
  const anchors = (btnRefs.value || []).filter((el) => el && el.nodeType === 1)
  const textTargets = [headingRef.value, descRef.value].filter((el) => el && el.nodeType === 1)
  const tl = gsap.timeline()
  if (textTargets.length) {
    tl.fromTo(
      textTargets,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.14, overwrite: 'auto' }
    )
  }
  if (anchors.length) {
    tl.fromTo(
      anchors,
      { opacity: 0, y: 42, scale: 0.9, transformOrigin: '50% 100%' },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.8)', stagger: 0.14, overwrite: 'auto' },
      textTargets.length ? '>' : undefined
    )
  }
})
</script>