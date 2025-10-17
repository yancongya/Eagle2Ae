<template>
  <button v-if="showButton" @click="scrollToTop"
          class="fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg transition-opacity duration-300 hover:opacity-80 z-50">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap'; // Assuming GSAP is available

const showButton = ref(false);
const scrollThreshold = 200; // Pixels from top to show button

const handleScroll = () => {
  showButton.value = window.scrollY > scrollThreshold;
};

const scrollToTop = () => {
  gsap.to(window, { duration: 0.8, scrollTo: 0, ease: 'power2.out' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>