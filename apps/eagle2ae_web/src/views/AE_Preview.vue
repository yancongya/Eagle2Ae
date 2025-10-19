<template>
  <main class="bg-white dark:bg-gray-900">
    <div ref="pageRef" :style="[{ 'view-transition-name': 'preview' }, wrapperStyle]" class="flex flex-col">
      <section class="flex-1 min-h-0 w-full">
        <!-- Mobile: single preview -->
        <div class="md:hidden h-full">
          <iframe src="/extensions/ae/index.html" class="w-full h-full border-0 filter invert hue-rotate-180 brightness-110 contrast-95 dark:filter-none"></iframe>
        </div>
        <!-- Desktop: three-pane preview -->
        <div class="hidden md:block h-full">
          <splitpanes class="default-theme" style="height: 100%">
            <!-- Left Pane (Main View) -->
            <pane :size="70">
              <iframe src="/extensions/ae/index.html" class="w-full h-full border-0 filter invert hue-rotate-180 brightness-110 contrast-95 dark:filter-none"></iframe>
            </pane>

            <!-- Right Pane (Container for vertical split) -->
            <pane :size="30">
              <splitpanes horizontal>
                <!-- Top-Right Pane -->
                <pane :size="50">
                  <iframe src="/extensions/ae/index.html" class="w-full h-full border-0 filter invert hue-rotate-180 brightness-110 contrast-95 dark:filter-none"></iframe>
                </pane>
                <!-- Bottom-Right Pane -->
                <pane :size="50">
                  <iframe src="/extensions/ae/index.html" class="w-full h-full border-0 filter invert hue-rotate-180 brightness-110 contrast-95 dark:filter-none"></iframe>
                </pane>
              </splitpanes>
            </pane>
          </splitpanes>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { Splitpanes, Pane } from 'splitpanes';
import { computed, ref, onMounted } from 'vue';
import gsap from 'gsap';

const pageRef = ref(null);
const wrapperStyle = computed(() => ({ height: '100vh' }));

onMounted(() => {
  gsap.set(pageRef.value, { opacity: 0, y: 12 });
  gsap.to(pageRef.value, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
});
</script>

<style scoped>
</style>
