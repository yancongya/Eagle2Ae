import DefaultTheme from 'vitepress/theme'
import { watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import { inject } from '@vercel/analytics';

export default {
  ...DefaultTheme,
  setup() {
    inject();
    const route = useRoute()

    onMounted(() => {
      // Favicon 切换逻辑
      watch(() => route.path, (newPath) => {
        const link = document.querySelector("link[rel~='icon']")
        if (!link) return

        if (newPath.startsWith('/eagle')) {
          link.href = '/logo2.png'
        } else {
          link.href = '/logo.png'
        }
      }, { immediate: true })
    })
  }
}
