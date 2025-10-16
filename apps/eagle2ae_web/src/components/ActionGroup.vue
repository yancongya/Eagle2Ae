<script setup>
import DocsLink from './DocsLink.vue';
import DownloadCTA from './Download.vue'; // Assuming Download.vue is the CTA component
</script>

<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <DocsLink />
        <DownloadCTA />
      </div>
    </div>
  </section>
</template>
