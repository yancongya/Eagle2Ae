<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-green-700 mb-4">欢迎来到 Eagle2Ae Web Demo</h1>
    <p class="text-gray-700 mb-4">这是一个展示 AE 扩展和 Eagle 扩展功能的统一平台。</p>
    <p class="text-gray-700 mb-6">请通过导航栏访问不同的演示页面。</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <h2 class="text-xl font-semibold text-green-600 mb-2">AE 扩展演示</h2>
        <p class="text-gray-600">点击导航栏的 "AE 扩展演示" 查看 After Effects 扩展的在线功能展示。</p>
        <router-link to="/ae" class="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">前往 AE 演示</router-link>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 class="text-xl font-semibold text-blue-600 mb-2">Eagle 扩展演示</h2>
        <p class="text-gray-600">点击导航栏的 "Eagle 扩展演示" 查看 Eagle 扩展的在线功能展示。</p>
        <router-link to="/eagle" class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">前往 Eagle 演示</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页组件，提供导航和项目简介
</script>

<style scoped>
/* 可以在这里添加 Home.vue 特有的样式 */
</style>
