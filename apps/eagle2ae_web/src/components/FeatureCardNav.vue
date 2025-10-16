<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.id" @click="scrollTo(feature.id)" class="block border rounded-lg p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 bg-gray-50 dark:bg-gray-800 cursor-pointer">
          <img :src="feature.iconUrl" :alt="feature.title" class="h-12 w-12 mb-4">
          <h3 class="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100">{{ feature.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const features = ref([
  { id: 'feature-drag-import', title: 'AE: 拖拽导入', description: '支持从 Eagle、本地、剪贴板等多种来源导入素材。', iconUrl: 'https://placehold.co/100x100/a78bfa/ffffff?text=AE' },
  { id: 'feature-import-mode', title: 'AE: 导入模式', description: '选择直接链接、项目旁复制或指定文件夹，安全管理您的项目文件。', iconUrl: 'https://placehold.co/100x100/a78bfa/ffffff?text=AE' },
  { id: 'feature-import-behavior', title: 'AE: 导入行为', description: '控制素材是仅入库，还是自动添加到时间轴，或创建为独立预合成。', iconUrl: 'https://placehold.co/100x100/a78bfa/ffffff?text=AE' },
  { id: 'feature-export-layer', title: 'AE: 导出图层', description: '将 AE 中的任何图层或预合成快速导出为图片，方便归档和分享。', iconUrl: 'https://placehold.co/100x100/a78bfa/ffffff?text=AE' },
  { id: 'feature-presets', title: 'AE: 预设管理', description: '保存和加载您的个人化工作流配置，在不同项目间一键切换。', iconUrl: 'https://placehold.co/100x100/a78bfa/ffffff?text=AE' },
  { id: 'feature-eagle-comms', title: 'Eagle: 扩展通信', description: '实现 AE 与 Eagle 扩展的后台通信，确保数据流畅同步。', iconUrl: 'https://placehold.co/100x100/34d399/ffffff?text=E' },
]);

const scrollTo = (id) => {
  gsap.to(window, { duration: 1, scrollTo: `#${id}`, ease: 'power2.inOut' });
};
</script>