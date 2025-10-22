<template>
  <footer class="py-2.5 sm:py-4 md:py-6 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border-t border-gray-200 dark:border-white/10">
    <div class="w-full px-3 sm:px-5 text-center">
      <p class="text-xs sm:text-sm md:text-base leading-tight">{{ t('footer.copyright') }}</p>
      <div class="mt-2 sm:mt-3 space-x-3 sm:space-x-4">
        <a href="#" class="text-xs sm:text-sm md:text-base transition-colors hover:text-gray-900 dark:hover:text-white">{{ t('footer.github') }}</a>
        <span>|</span>
        <a href="#" class="text-xs sm:text-sm md:text-base transition-colors hover:text-gray-900 dark:hover:text-white">{{ t('footer.feedback') }}</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>