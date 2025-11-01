<template>
  <div class="relative inline-flex items-center" @mouseenter="!isMobile && onMouseEnter()" @mouseleave="!isMobile && onMouseLeave()">
    <button
      ref="triggerRef"
      type="button"
      class="ls-trigger"
      :class="sizeClass"
      @click="toggleOpen"
      @keydown="onKeydown"
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-label="Language"
    >
      <span class="ls-label">{{ current.label }}</span>
      <svg class="ls-caret" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>
      </svg>
    </button>

    <transition name="ls-menu" @enter="onMenuEnter" @leave="onMenuLeave">
      <ul v-if="isOpen" ref="menuRef" class="ls-menu" role="listbox">
        <li
          v-for="(opt, idx) in options"
          :key="opt.value"
          :data-index="idx"
          role="option"
          :aria-selected="opt.value===locale.value ? 'true' : 'false'"
          class="ls-item"
          :class="{ 'is-active': idx===activeIndex, 'is-current': opt.value===locale.value }"
          @click="onSelect(opt.value)"
          @mouseenter="activeIndex=idx"
        >
          <span class="relative inline-block group">
            <span class="ls-item-label">{{ opt.label }}</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500 ease-in-out"></span>
          </span>
          <svg v-if="opt.value===locale.value" class="ls-check" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M5 10l3 3 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { gsap } from 'gsap'
import { useDevice } from '@/composables/useDevice.js';

const { locale } = useI18n()
const { isMobile } = useDevice();

const props = defineProps({
  size: { type: String, default: 'md' }
})

const isOpen = ref(false)
const activeIndex = ref(-1)
const triggerRef = ref(null)
const menuRef = ref(null)

const options = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]

const current = computed(() => options.find(o => o.value === locale.value) || options[0])

const sizeClass = computed(() => (props.size === 'sm' ? 'ls-sm' : 'ls-md'))

const toggleOpen = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) activeIndex.value = options.findIndex(o => o.value === locale.value)
}

const onMouseEnter = () => {
  isOpen.value = true
  activeIndex.value = options.findIndex(o => o.value === locale.value)
}

const onMouseLeave = () => {
  isOpen.value = false
}

const onSelect = (val) => {
  setLocale(val)
  isOpen.value = false
}

const scrollIntoViewActive = () => {
  requestAnimationFrame(() => {
    const el = menuRef.value?.querySelector(`[data-index="${activeIndex.value}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  })
}

const onKeydown = (e) => {
  if (!isOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    isOpen.value = true
    activeIndex.value = options.findIndex(o => o.value === locale.value)
    return
  }
  if (!isOpen.value) return
  if (e.key === 'Escape') { isOpen.value = false; return }
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex.value = Math.min(options.length - 1, Math.max(0, activeIndex.value + 1)); scrollIntoViewActive() }
  if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex.value = Math.max(0, activeIndex.value - 1); scrollIntoViewActive() }
  if (e.key === 'Enter') { e.preventDefault(); const target = options[activeIndex.value] || current.value; onSelect(target.value) }
}

const onClickOutside = (e) => {
  if (!isOpen.value) return
  const t = triggerRef.value
  const m = menuRef.value
  if (t && !t.contains(e.target) && m && !m.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => { document.addEventListener('pointerdown', onClickOutside) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onClickOutside) })

const onMenuEnter = (el, done) => {
  const items = el.querySelectorAll('.ls-item');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  tl.fromTo(el,
    { scaleY: 0, opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }
  );
  tl.fromTo(items,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, stagger: 0.07, duration: 0.3, ease: 'power3.out' },
    "-=0.2"
  );
};

const onMenuLeave = (el, done) => {
  const items = el.querySelectorAll('.ls-item');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  tl.to(items, { opacity: 0, x: -15, stagger: 0.05, duration: 0.2, ease: 'power2.in' });
  tl.to(el, { scaleY: 0, opacity: 0, duration: 0.3, ease: 'power3.in' }, "-=0.15");
};
</script>

<style scoped>
.ls-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid transparent; /* No visible border */
  background: transparent;
  color: rgb(75 85 99); /* gray-600 */
  transition: color 200ms ease, transform 200ms ease-out;
}
.ls-md { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
.ls-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }

.ls-trigger:hover {
  background: transparent;
  transform: scale(1.08);
  color: rgb(31 41 55); /* Darker text */
}
.ls-trigger:active { transform: translateY(0.5px) scale(1.08); }

/* Remove click outline, keep keyboard-visible focus ring */
.ls-trigger:focus { outline: none; }
.ls-trigger:focus-visible {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.45); /* blue-500 ring */
  border-color: rgba(59, 130, 246, 0.45);
}

.ls-caret {
  opacity: 0.7;
  transition: transform 200ms ease;
}
[aria-expanded="true"] .ls-caret {
  transform: rotate(180deg);
}

/* shadcn-vue inspired menu */
.ls-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 8rem;
  background: #ffffff;
  border: none;
  border-radius: 0.5rem; /* 8px */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 0.25rem;
  z-index: 50;
  will-change: transform, opacity;
}

.ls-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem; /* 4px */
  color: rgb(31 41 55); /* gray-800 */
  cursor: pointer;
  transition: background-color 100ms ease, color 100ms ease;
}

/* Subtle background on hover/focus, as per shadcn */
.ls-item:hover, .ls-item.is-active {
  background-color: #f1f5f9; /* slate-100 */
  color: rgb(15 23 42); /* slate-900 */
}

.ls-item.is-current {
  background: transparent;
}

.ls-label { white-space: nowrap; }

.ls-check { color: rgb(37 99 235); /* blue-600 */ }

/* Fallback transitions */
.ls-menu-enter-active, .ls-menu-leave-active {
  transition: opacity 160ms ease, transform 180ms ease;
  transform-origin: top right;
}
.ls-menu-enter-from, .ls-menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
.ls-menu-enter-to, .ls-menu-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Dark mode */
:global(.dark) .ls-trigger {
  color: rgb(255 255 255); /* text-white in dark */
  border-color: transparent;
}
:global(.dark) .ls-trigger:hover { 
  background: transparent;
  color: rgb(255 255 255);
}
</style>
<style>
/* shadcn-vue inspired dark mode */
html.dark .ls-menu {
  background: rgb(15 23 42) !important; /* slate-900 */
  border: none !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}
html.dark .ls-trigger {
  color: rgb(255 255 255) !important;
  border-color: transparent !important;
}
html.dark .ls-label { color: rgb(255 255 255) !important; }
html.dark .ls-item {
  color: rgb(226, 232, 240) !important; /* slate-200 */
}
html.dark .ls-item:hover,
html.dark .ls-item.is-active {
  background-color: rgb(30 41 59) !important; /* slate-800 */
  color: rgb(248 250 252) !important; /* slate-50 */
}

html.dark .ls-item.is-current {
  background: transparent;
}

html.dark .ls-item.is-current .ls-item-label {
  color: rgb(248 250 252) !important; /* slate-50 */
}

html.dark .ls-check {
  color: rgb(96, 165, 250); /* blue-400 */
}
</style>