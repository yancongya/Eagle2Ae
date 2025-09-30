import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-green/theme.css' // PrimeVue 主题
import 'primeicons/primeicons.css' // PrimeIcons 图标
import './main.css' // 引入 Tailwind CSS

const app = createApp(App)

app.use(router)
app.use(PrimeVue)

app.mount('#app')
