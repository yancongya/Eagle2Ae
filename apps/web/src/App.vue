<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow p-4">
      <nav class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-green-600">Eagle2Ae Web Demo</router-link>
        <div class="space-x-4">
          <router-link to="/" class="text-gray-600 hover:text-green-600">首页</router-link>
          <router-link to="/ae" class="text-gray-600 hover:text-green-600">AE 扩展演示</router-link>
          <router-link to="/eagle" class="text-gray-600 hover:text-green-600">Eagle 扩展演示</router-link>
        </div>
      </nav>
    </header>
    <main class="flex-grow container mx-auto p-4">
      <router-view></router-view>
    </main>
    <footer class="bg-gray-800 text-white p-4 text-center">
      &copy; 2025 Eagle2Ae. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
// App.vue 是根组件，主要负责布局和路由视图的显示
// 具体的页面内容由 router-view 渲染的子组件提供
</script>

<style scoped>
/* 可以在这里添加 App.vue 特有的样式 */
</style>
