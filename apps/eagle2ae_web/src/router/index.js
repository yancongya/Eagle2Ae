import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AE_Preview from '../views/AE_Preview.vue';
import Eagle_Preview from '../views/Eagle_Preview.vue';
import Download from '../views/Download.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/ae-preview',
    name: 'AE_Preview',
    component: AE_Preview,
  },
  {
    path: '/eagle-preview',
    name: 'Eagle_Preview',
    component: Eagle_Preview,
  },
  {
    path: '/download',
    name: 'Download',
    component: Download,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
