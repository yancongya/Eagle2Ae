<script setup>
import { ref } from 'vue'

defineProps({
  msg: {
    type: String,
    default: 'Hello World'
  }
})

const count = ref(0)
const reset = () => (count.value = 0)
</script>

<template>
  <section class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200/60 dark:border-gray-700/60">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
      {{ msg }}
    </h1>

    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      一个简洁、响应友好的示例组件，展示基础交互与样式。
    </p>

    <div class="mt-4 flex items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
        @click="count++"
        aria-label="Increment counter"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
        </svg>
        计数：{{ count }}
      </button>
      <button
        type="button"
        class="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        @click="reset"
        aria-label="Reset counter"
      >
        重置
      </button>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-2">
      <div v-for="i in 6" :key="i" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs text-gray-600 dark:text-gray-400">
        卡片 {{ i }}
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 组件布局主要使用 Tailwind 类，无需额外样式 */
</style>
