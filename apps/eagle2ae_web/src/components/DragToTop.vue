<template>
  <!-- Click overlay to start drag operation -->
  <div class="fixed inset-0 z-[9997] bg-transparent pointer-events-auto cursor-grab active:cursor-grabbing"
       @mousedown="handleMouseDownAnywhere"
       @touchstart="handleTouchStartAnywhere">
  </div>

  <!-- Visual elements for drag interaction -->
  <div class="fixed inset-0 z-[9998] pointer-events-none" v-if="showLogos">
    <!-- Connecting Line -->
    <svg class="absolute inset-0 w-full h-full z-0">
      <line :x1="lineStartOffset.x" :y1="lineStartOffset.y"
            :x2="logo2Pos.x + 20" :y2="logo2Pos.y + 20"
            stroke="rgba(255, 255, 255, 0.7)" stroke-width="3" stroke-dasharray="5,5" />
    </svg>

    <!-- Logo 1 (Start Point) -->
    <img :src="logo1Src" alt="Logo 1" 
         class="absolute w-10 h-10 rounded-full bg-blue-500 shadow-lg z-10 pointer-events-none"
         :style="{ left: `${logo1Pos.x}px`, top: `${logo1Pos.y}px` }" />

    <!-- Logo 2 (End Point, follows mouse) -->
    <img :src="logo2Src" alt="Logo 2" 
         class="absolute w-10 h-10 rounded-full bg-red-500 shadow-lg z-10 pointer-events-none"
         :style="{ left: `${logo2Pos.x}px`, top: `${logo2Pos.y}px` }" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const logo1Src = '/src/assets/logo.png';
const logo2Src = '/src/assets/logo2.png';

const isDragging = ref(false);
const showLogos = ref(false);
const startPos = ref({ x: 0, y: 0 });
const currentPos = ref({ x: 0, y: 0 });
const logo1Pos = ref({ x: 0, y: 0 });
const logo2Pos = ref({ x: 0, y: 0 });

const dragThreshold = 100; // Increased threshold for better UX

const lineStartOffset = computed(() => {
  const logo1CenterX = logo1Pos.value.x + 20;
  const logo1CenterY = logo1Pos.value.y + 20;
  const logo2CenterX = logo2Pos.value.x + 20;
  const logo2CenterY = logo2Pos.value.y + 20;
  const radius = 20; // Half of w-10 h-10

  const dx = logo2CenterX - logo1CenterX;
  const dy = logo2CenterY - logo1CenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { x: logo1CenterX, y: logo1CenterY };
  }

  const ratio = radius / distance;
  const offsetX = dx * ratio;
  const offsetY = dy * ratio;

  return {
    x: logo1CenterX + offsetX,
    y: logo1CenterY + offsetY
  };
});

const handleMouseDownAnywhere = (event) => {
  if (event.button !== 0) return; // Only left mouse button
  
  isDragging.value = true;
  showLogos.value = true;

  // Position logo1 at the click position
  startPos.value = { x: event.clientX, y: event.clientY };
  logo1Pos.value = { x: event.clientX - 20, y: event.clientY - 20 }; // Center logo 1
  
  currentPos.value = { x: event.clientX, y: event.clientY };
  logo2Pos.value = { x: event.clientX - 20, y: event.clientY - 20 }; // Logo 2 starts at mouse

  event.preventDefault(); // Prevent default to avoid text selection during drag
};

const handleTouchStartAnywhere = (event) => {
  if (event.touches.length > 1) return; // Only single touch
  
  const touch = event.touches[0];
  
  isDragging.value = true;
  showLogos.value = true;

  // Position logo1 at the touch position
  startPos.value = { x: touch.clientX, y: touch.clientY };
  logo1Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 }; // Center logo 1
  
  currentPos.value = { x: touch.clientX, y: touch.clientY };
  logo2Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 }; // Logo 2 starts at touch

  event.preventDefault();
};

const handleMouseMove = (event) => {
  if (isDragging.value) {
    currentPos.value = { x: event.clientX, y: event.clientY };
    logo2Pos.value = { x: event.clientX - 20, y: event.clientY - 20 }; // Center logo 2
  }
};

const handleTouchMove = (event) => {
  if (isDragging.value && event.touches.length > 0) {
    const touch = event.touches[0];
    currentPos.value = { x: touch.clientX, y: touch.clientY };
    logo2Pos.value = { x: touch.clientX - 20, y: touch.clientY - 20 }; // Center logo 2
  }
};

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    showLogos.value = false; // Hide logos after drag ends

    const dx = currentPos.value.x - startPos.value.x;
    const dy = currentPos.value.y - startPos.value.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance > dragThreshold) {
      gsap.to(window, { duration: 1.0, scrollTo: 0, ease: 'power2.out' });
    }
  }
};

const handleTouchEnd = () => {
  if (isDragging.value) {
    isDragging.value = false;
    showLogos.value = false; // Hide logos after drag ends

    const dx = currentPos.value.x - startPos.value.x;
    const dy = currentPos.value.y - startPos.value.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance > dragThreshold) {
      gsap.to(window, { duration: 1.0, scrollTo: 0, ease: 'power2.out' });
    }
  }
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchcancel', handleTouchEnd);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove, { passive: false });
  document.removeEventListener('touchend', handleTouchEnd);
  document.removeEventListener('touchcancel', handleTouchEnd);
});
</script>

<style scoped>
/* Styles for DragToTop component */
</style>