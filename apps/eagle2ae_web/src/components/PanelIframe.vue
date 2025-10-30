<template>
  <div class="relative w-full h-full">
    <!-- 骨架屏 -->
    <transition name="fade">
      <div v-if="!isLoaded" class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div class="text-center">
          <div 
            class="inline-block border-4 border-t-transparent rounded-full animate-spin mb-2"
            :class="[
              isMobile ? 'w-12 h-12 mb-4' : 'w-8 h-8 mb-2',
              `border-${color}-500`
            ]"
          ></div>
          <p 
            class="text-gray-600 dark:text-gray-400"
            :class="isMobile ? '' : 'text-xs'"
          >
            {{ label }}
          </p>
        </div>
      </div>
    </transition>
    
    <!-- iframe -->
    <iframe 
      v-if="shouldLoad"
      :src="src" 
      class="w-full h-full border-0 transition-opacity duration-500"
      :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
      :data-panel="panelId"
      :title="label"
      @load="$emit('load', panelId)"
    />
  </div>
</template>

<script setup>
defineProps({
  panelId: { type: String, required: true },
  label: { type: String, required: true },
  src: { type: String, required: true },
  isLoaded: { type: Boolean, required: true },
  shouldLoad: { type: Boolean, required: true },
  color: { type: String, default: 'purple' },
  isMobile: { type: Boolean, default: false }
})

defineEmits(['load'])
</script>