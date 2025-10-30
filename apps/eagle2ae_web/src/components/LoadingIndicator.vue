<template>
  <div class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <div class="text-center">
      <div 
        :class="[
          'inline-block border-4 border-t-transparent rounded-full animate-spin mb-4',
          sizeClass,
          colorClass
        ]"
      ></div>
      <p :class="textClass">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary'].includes(value)
  }
});

const sizeClass = computed(() => {
  const sizes = {
    primary: 'w-12 h-12',
    secondary: 'w-8 h-8',
    tertiary: 'w-8 h-8'
  };
  return sizes[props.variant];
});

const colorClass = computed(() => {
  const colors = {
    primary: 'border-purple-500',
    secondary: 'border-blue-500',
    tertiary: 'border-green-500'
  };
  return colors[props.variant];
});

const textClass = computed(() => {
  const classes = {
    primary: 'text-gray-600 dark:text-gray-400',
    secondary: 'text-xs text-gray-600 dark:text-gray-400',
    tertiary: 'text-xs text-gray-600 dark:text-gray-400'
  };
  return classes[props.variant];
});
</script>