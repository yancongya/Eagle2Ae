import { createApp } from 'vue';
import App from './App.vue';
import 'splitpanes/dist/splitpanes.css'; // Import splitpanes style
import router from './router'; // 引入 router
import './style.css';
import { useDark } from '@vueuse/core'; // Import useDark
import { i18n } from './i18n';

// Initialize dark mode early to prevent FOUC
useDark({ storageKey: 'theme', initialValue: 'dark' }); // Force dark mode

const app = createApp(App);

app.use(router); // 使用 router
app.use(i18n); // 使用 i18n

app.mount('#app');