import { useDark } from '@vueuse/core';

/**
 * Centralized theme management composable
 * @returns {Object} Theme utilities
 */
export function useTheme() {
  const isDark = useDark({ 
    storageKey: 'vueuse-color-scheme',
    // Ensure consistent behavior across components
    initialValue: 'auto'
  });

  return {
    isDark
  };
}