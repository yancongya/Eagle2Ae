<template>
  <section :id="id" ref="featureSection" class="py-24 min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-black">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:items-center gap-12" :class="[isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse']">
        <div ref="imageContainer" class="md:w-1/2 opacity-0">
          <img :src="imageUrl" :alt="title" class="rounded-lg shadow-xl w-full">
        </div>
        <div ref="textContainer" class="md:w-1/2 opacity-0">
          <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{{ title }}</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">{{ description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  id: String,
  title: String,
  description: String,
  imageUrl: String,
  isImageLeft: {
    type: Boolean,
    default: true,
  },
});

const featureSection = ref(null);
const imageContainer = ref(null);
const textContainer = ref(null);
let ctx;

onMounted(() => {
  nextTick(() => {
    ctx = gsap.context(() => {
      const imageX = props.isImageLeft ? -100 : 100; // Slide from left or right
      const textX = props.isImageLeft ? 100 : -100; // Slide from opposite side

      gsap.fromTo(imageContainer.value, 
        { x: imageX, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: {
            trigger: featureSection.value,
            start: 'top center+=100',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo(textContainer.value, 
        { x: textX, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: {
            trigger: featureSection.value,
            start: 'top center+=100',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, featureSection.value);
  });
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
