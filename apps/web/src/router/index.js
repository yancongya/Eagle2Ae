import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AeExtension from '../views/AeExtension.vue'
import EagleExtension from '../views/EagleExtension.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/ae',
    name: 'AeExtension',
    component: AeExtension
  },
  {
    path: '/eagle',
    name: 'EagleExtension',
    component: EagleExtension
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
