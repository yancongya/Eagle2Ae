<script setup>
import DocsLink from './DocsLink.vue';
// 旧下载 CTA 已移除，避免与新的下载入口重复
</script>

<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <DocsLink />
        <!-- DownloadCTA 组件已移除 -->
      </div>
    </div>
  </section>
</template>
