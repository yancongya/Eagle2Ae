<script setup>
import Hero from '../components/Hero.vue';
import FeatureDetail from '../components/FeatureDetail.vue';
import Footer from '../components/Footer.vue';
import { ref } from 'vue';

const features = ref([
  { id: 'feature-drag-import', title: 'AE: 拖拽导入', description: '支持从 Eagle、本地、剪贴板等多种来源导入素材。', imageUrl: 'https://placehold.co/800x600/e2e8f0/334155?text=Drag+%26+Drop' },
  { id: 'feature-import-mode', title: 'AE: 导入模式', description: '选择直接链接、项目旁复制或指定文件夹，安全管理您的项目文件。', imageUrl: 'https://placehold.co/800x600/a78bfa/ffffff?text=Import+Mode' },
  { id: 'feature-import-behavior', title: 'AE: 导入行为', description: '控制素材是仅入库，还是自动添加到时间轴，或创建为独立预合成。', imageUrl: 'https://placehold.co/800x600/34d399/ffffff?text=Import+Behavior' },
  { id: 'feature-export-layer', title: 'AE: 导出图层', description: '将 AE 中的任何图层或预合成快速导出为图片，方便归档和分享。', imageUrl: 'https://placehold.co/800x600/f97316/ffffff?text=Export+Layer' },
  { id: 'feature-presets', title: 'AE: 预设管理', description: '保存和加载您的个人化工作流配置，在不同项目间一键切换。', imageUrl: 'https://placehold.co/800x600/3b82f6/ffffff?text=Presets' },
  { id: 'feature-eagle-comms', title: 'Eagle: 扩展通信', description: '实现 AE 与 Eagle 扩展的后台通信，确保数据流畅同步。', imageUrl: 'https://placehold.co/800x600/ef4444/ffffff?text=Communication' },
]);

</script>

<template>
  <main class="bg-white dark:bg-gray-900">
    <Hero />
    <div class="bg-gray-50 dark:bg-black">
      <FeatureDetail 
        v-for="(feature, index) in features" 
        :key="feature.id" 
        :id="feature.id" 
        :title="feature.title" 
        :description="feature.description"
        :imageUrl="feature.imageUrl" 
        :isImageLeft="index % 2 === 0"
      />
    </div>
    <Footer />
  </main>
</template>