<template>
  <div class="relative inline-flex items-center">
    <label class="sr-only" for="lang-select">Language</label>
    <select id="lang-select" class="lang-select" :class="sizeClass"
            :value="locale"
            @change="onChange($event.target.value)"
            aria-label="Language">
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const { locale } = useI18n()

// 尺寸 props：默认中等，移动端可传入 sm
const props = defineProps({
  size: { type: String, default: 'md' }
})

const sizeClass = computed(() => (props.size === 'sm' ? 'lang-sm' : 'lang-md'))

const onChange = (val) => {
  setLocale(val)
}
</script>

<style scoped>
.lang-select {
  appearance: none;
  background: transparent;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* 尺寸映射：桌面使用 md，移动端使用 sm */
.lang-md { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
.lang-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }

:host, .lang-select {
  color: rgb(75 85 99); /* gray-600 */
}
:host(.dark) .lang-select, :global(.dark) .lang-select {
  color: rgb(209 213 219); /* gray-300 */
  border-color: rgba(255, 255, 255, 0.2);
}
.lang-select:hover {
  background: rgba(0,0,0,0.04);
}
</style>