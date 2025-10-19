<template>
  <footer class="py-8 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border-t border-gray-200 dark:border-white/10">
    <div class="w-full px-6 text-center">
      <p>{{ t('footer.copyright') }}</p>
      <div class="mt-4 space-x-4">
        <a href="#" class="transition-colors hover:text-gray-900 dark:hover:text-white">{{ t('footer.github') }}</a>
        <span>|</span>
        <a href="#" class="transition-colors hover:text-gray-900 dark:hover:text-white">{{ t('footer.feedback') }}</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>