<template>
  <section class="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
    <!-- Centering Container -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl px-6">

      <!-- Inner container with adjusted top padding -->
      <div class="pt-32">
        <!-- Top Part: Title & Buttons -->
        <div class="text-center max-w-4xl mx-auto">
          <div class="overflow-hidden">
            <h1 ref="title" class="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              Eagle 与 AE 的无缝桥梁
            </h1>
          </div>
          <p ref="subtitle" class="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
            一键将您的 Eagle 素材库带入 After Effects，告别繁琐的拖拽与导入。
          </p>
          <div ref="buttons" class="space-x-4">
            <router-link to="/ae-preview" class="inline-flex justify-center w-36 px-4 py-2 text-lg font-bold transition-all duration-300 transform rounded-xl hover:scale-105 has-sweep-light"
                         style="background-color: rgb(0, 0, 91); border: 3px solid rgb(82, 59, 196); color: rgb(153, 153, 255);">
              AE 预览
            </router-link>
            <router-link to="/eagle-preview" class="inline-flex justify-center w-36 px-4 py-2 text-lg font-bold transition-all duration-300 transform rounded-xl hover:scale-105 has-sweep-light"
                         style="background-color: rgb(0, 73, 125); border: 3px solid rgb(0, 98, 201); color: rgb(161, 216, 255);">
              Eagle 预览
            </router-link>
          </div>
        </div>

        <!-- Bottom Part: Feature Cards (Balanced Size) -->
        <div ref="cardsContainer" class="container mx-auto mt-24">
           <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div v-for="(feature, index) in features" :key="feature.id"
                 :ref="el => { if (el) cardRefs[index] = el }"
                 @mouseenter="hoveredCardId = feature.id"
                 @mouseleave="hoveredCardId = null"
                 :style="{ zIndex: hoveredCardId === feature.id ? 10 : 1 }"
                 class="flex flex-col items-center text-center cursor-pointer opacity-0 transition-all duration-300">
              <div @click="scrollTo(feature.id)"
                   :class="{ 'filter-dim-blur': hoveredCardId && hoveredCardId !== feature.id }"
                   class="relative block rounded-xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 aspect-[3/4] w-full">
                <img :src="feature.iconUrl" :alt="feature.title" class="absolute inset-0 h-full w-full object-cover rounded-xl">
              </div>
              <h3 class="mt-2 font-bold text-base text-gray-600 dark:text-gray-400">{{ feature.title }}</h3>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// Animation Refs
const title = ref(null);
const subtitle = ref(null);
const buttons = ref(null);
const cardsContainer = ref(null);
const cardRefs = ref([]); // To hold refs for each card

// Hover state
const hoveredCardId = ref(null);

// Card Data & Scroll Logic
const features = ref([
  { id: 'feature-drag-import', title: 'AE: 拖拽导入', iconUrl: '/images/features/feature-drag-import.png' },
  { id: 'feature-import-mode', title: 'AE: 导入模式', iconUrl: '/images/features/feature-import-mode.png' },
  { id: 'feature-import-behavior', title: 'AE: 导入行为', iconUrl: '/images/features/feature-import-behavior.png' },
  { id: 'feature-export-layer', title: 'AE: 导出图层', iconUrl: '/images/features/feature-export-layer.png' },
  { id: 'feature-presets', title: 'AE: 预设管理', iconUrl: '/images/features/feature-presets.png' },
  { id: 'feature-eagle-comms', title: 'Eagle: 扩展通信', iconUrl: '/images/features/feature-eagle-comms.png' },
]);

const scrollTo = (id) => {
  const targetElem = document.querySelector(`#${id}`);
  if (!targetElem) return;

  const targetTop = targetElem.getBoundingClientRect().top + window.scrollY;
  const targetHeight = targetElem.offsetHeight;
  const viewportHeight = window.innerHeight;
  const destination = targetTop - (viewportHeight / 2) + (targetHeight / 2);

  gsap.to(window, { duration: 1, scrollTo: destination, ease: 'power2.inOut' });
};

// Helper function to split text into words and wrap them in spans
const splitTextIntoWords = (element) => {
  if (!element) return [];

  const text = element.textContent;
  element.innerHTML = ''; // Clear original content

  const words = text.split(' ');
  const wordSpans = [];

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.textContent = word;
    wordSpan.style.display = 'inline-block'; // Important for animation
    wordSpan.style.marginRight = '0.25em'; // Add some space between words
    element.appendChild(wordSpan);
    wordSpans.push(wordSpan);
  });
  return wordSpans;
};

// Helper function to split text into characters and wrap them in spans
const splitTextIntoChars = (element) => {
  if (!element) return [];

  const text = element.textContent;
  element.innerHTML = ''; // Clear original content

  const chars = text.split(''); // Split by characters
  const charSpans = [];

  chars.forEach((char, index) => {
    const charSpan = document.createElement('span');
    charSpan.textContent = char === ' ' ? '\u00A0' : char; // Preserve space
    charSpan.style.display = 'inline-block'; // Important for animation
    element.appendChild(charSpan);
    charSpans.push(charSpan);
  });
  return charSpans;
};

onMounted(() => {
  // const titleChars = splitTextIntoChars(title.value); // Removed
  const subtitleWords = splitTextIntoWords(subtitle.value);

  // Initial state for title, words, buttons, and cards
  gsap.set([title.value, ...subtitleWords, buttons.value, cardRefs.value], { opacity: 0, y: 30 }); // Adjusted initial set
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Title animation (clip-in effect)
  tl.to(title.value, { // Animate title.value directly
      y: 0,
      opacity: 1,
      duration: 1.2, // Slower duration for clip-in
      ease: 'power3.out'
    }, 0) // Start at 0

  // 2. Cards animation (0.2s after title starts)
  .to(cardRefs.value, {
      y: 0,
      opacity: 1,
      duration: 0.8, // Keep cards duration for now
      stagger: 0.15, // Keep cards stagger for now
      ease: 'power3.out',
    }, 0.2) // Start 0.2 seconds into the timeline

  // 3. Subtitle words animation (0.4s after title starts)
  .to(subtitleWords, {
      y: 0,
      opacity: 1,
      duration: 0.5, // Slower duration for words
      stagger: 0.1, // Slower stagger for words
      ease: 'back.out(1.7)'
    }, 0.4) // Start 0.4 seconds into the timeline

  // 4. Buttons animation (when subtitle is halfway)
  .to(buttons.value, { y: 0, opacity: 1, duration: 0.6 }, 0.65); // Start at 0.65 seconds into the timeline
});

watch(hoveredCardId, (newId) => {
  if (newId) {
    // Card is hovered
    const hoveredCardIndex = features.value.findIndex(f => f.id === newId);
    if (hoveredCardIndex !== -1) {
      const cardEl = cardRefs.value[hoveredCardIndex];
      gsap.to(cardEl, { duration: 0.05, scale: 1.1, y: -20, ease: 'power2.out', overwrite: true }); // Kept fast hover
    }
  } else {
    // No card hovered, revert all to normal
    cardRefs.value.forEach((cardEl) => {
      gsap.to(cardEl, { duration: 0.05, scale: 1, y: 0, ease: 'power2.out', overwrite: true }); // Kept fast hover
    });
  }
});

// Watch cardRefs to ensure all cards are rendered before animating them
// Watch cardRefs to ensure all cards are rendered before animating them
watch(cardRefs, (newVal) => {
  if (newVal.length === features.value.length) {
    gsap.to(newVal, { // Animate the actual DOM elements in the array
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }
}, { flush: 'post' }); // 'post' ensures watch runs after DOM updates

// Removed onBeforeUnmount hook
</script>

<style scoped>
  .has-sweep-light {
    position: relative;
    overflow: hidden; /* Ensure sweep light stays within bounds */
  }

  .has-sweep-light::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%; /* Start off-screen to the left */
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3), /* Light sweep color */
      transparent
    );
    transition: transform 0.5s ease-in-out; /* Smooth transition for sweep */
    transform: skewX(-20deg); /* Optional: add a slight skew for effect */
    z-index: 1; /* Ensure it's above button background but below text */
  }

  .has-sweep-light:hover::before {
    transform: translateX(200%) skewX(-20deg); /* Move across the button */
  }
</style>