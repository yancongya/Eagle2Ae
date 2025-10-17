<template>
  <main class="bg-white dark:bg-gray-900 min-h-screen">
    <div class="pt-20 h-screen w-screen">
      <splitpanes class="default-theme" style="height: 100%">
        <!-- Left Pane (Main View) -->
        <pane :size="70">
          <iframe src="/extensions/eagle/index.html" class="w-full h-full border-0"></iframe>
        </pane>

        <!-- Right Pane (Container for vertical split) -->
        <pane :size="30">
          <splitpanes horizontal>
            <!-- Top-Right Pane -->
            <pane :size="50">
              <iframe src="/extensions/eagle/index.html" class="w-full h-full border-0"></iframe>
            </pane>
            <!-- Bottom-Right Pane -->
            <pane :size="50">
              <iframe src="/extensions/eagle/index.html" class="w-full h-full border-0"></iframe>
            </pane>
          </splitpanes>
        </pane>
      </splitpanes>
    </div>
  </main>
</template>

<script setup>
import { Splitpanes, Pane } from 'splitpanes';
</script>
