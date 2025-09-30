<template>
  <div class="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">Eagle 扩展演示</h1>
    <p class="text-gray-700 mb-4">以下是 Eagle 扩展的在线功能界面演示。请注意，部分与 Eagle 宿主程序直接交互的功能可能无法在此浏览器环境中正常工作。</p>

    <div class="flex-grow border border-gray-300 rounded-lg overflow-hidden">
      <iframe src="/src/extensions/eagle/index.html" class="w-full h-full border-none"></iframe>
    </div>
  </div>
</template>

<script setup>
// 这里通过 iframe 嵌入 Eagle 扩展的界面
</script>

<style scoped>
/* 可以在这里添加 EagleExtension.vue 特有的样式 */
</style>
