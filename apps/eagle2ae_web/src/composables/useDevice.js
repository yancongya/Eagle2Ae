import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';

/**
 * A composable to provide reactive information about the device.
 */
export function useDevice() {
  // Reactive media query for screen width (true if screen is smaller than md breakpoint)
  const isSmallScreen = useMediaQuery('(max-width: 767px)');

  // Check for touch hardware support
  const hasTouchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  // Check if the primary input is a fine pointer (like a mouse/stylus)
  const hasFinePointer = useMediaQuery('(pointer: fine)');

  // A device is considered a "touch device" if it has touch points AND its primary pointer is NOT fine.
  // This helps exclude desktops that have touch APIs but are mouse-primary.
  const isTouchDevice = computed(() => hasTouchPoints && !hasFinePointer.value);

  /**
   * Combined reactive property. Returns true if either the screen is small
   * OR the device has touch capabilities.
   */
  const isMobile = computed(() => isSmallScreen.value || isTouchDevice.value);

  return { 
    /**
     * True if the device is considered 'mobile' (small screen OR touch).
     */
    isMobile, 
    /**
     * True if the screen width is less than 768px.
     */
    isSmallScreen, 
    /**
     * True if the hardware supports touch and its primary pointer is not fine.
     */
    isTouchDevice 
  };
}
