<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <h2 class="text-4xl font-bold mb-8 text-center">不止于 Eagle，万物皆可导入</h2>
    <div ref="track" class="flex h-[400px] items-center">
      <!-- Card 1 -->
      <div class="flex-shrink-0 w-[600px] h-full px-8">
        <div class="border rounded-lg p-6 shadow-lg h-full bg-gray-50 dark:bg-gray-800">
          <img src="https://placehold.co/600x400/e2e8f0/334155?text=Eagle+Drag" alt="Drag from Eagle" class="rounded-md mb-4">
          <h3 class="font-bold text-xl mb-2">从 Eagle 拖拽</h3>
          <p class="text-gray-600 dark:text-gray-400">无缝连接您的 Eagle 素材库。</p>
        </div>
      </div>
      <!-- Card 2 -->
      <div class="flex-shrink-0 w-[600px] h-full px-8">
        <div class="border rounded-lg p-6 shadow-lg h-full bg-gray-50 dark:bg-gray-800">
          <img src="https://placehold.co/600x400/e2e8f0/334155?text=Local+Drag" alt="Drag from Local Folder" class="rounded-md mb-4">
          <h3 class="font-bold text-xl mb-2">从本地拖拽</h3>
          <p class="text-gray-600 dark:text-gray-400">支持电脑内任意文件和文件夹。</p>
        </div>
      </div>
      <!-- Card 3 -->
      <div class="flex-shrink-0 w-[600px] h-full px-8">
        <div class="border rounded-lg p-6 shadow-lg h-full bg-gray-50 dark:bg-gray-800">
          <img src="https://placehold.co/600x400/e2e8f0/334155?text=Clipboard+Paste" alt="Paste from Clipboard" class="rounded-md mb-4">
          <h3 class="font-bold text-xl mb-2">从剪贴板粘贴</h3>
          <p class="text-gray-600 dark:text-gray-400">快速捕捉和导入截图、网络图片。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// The animation logic for this component is now handled in Home.vue
</script>
