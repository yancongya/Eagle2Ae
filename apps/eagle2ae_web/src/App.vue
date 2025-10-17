<template>
  <Navbar />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <DragToTop />
  <ReturnToTopButton />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar from './components/Navbar.vue';
import DragToTop from './components/DragToTop.vue'; // Import DragToTop
import ReturnToTopButton from './components/ReturnToTopButton.vue'; // Import ReturnToTopButton

// No confetti related logic here anymore

</script>
