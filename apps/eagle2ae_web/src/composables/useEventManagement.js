import { onBeforeUnmount } from 'vue';

/**
 * Composable for managing event listeners and cleanup
 * @returns {Object} Event management utilities
 */
export function useEventManagement() {
  const eventCleanupFns = new Set();
  const loadedIframes = new Set();

  /**
   * Add an event listener with automatic cleanup
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  const addEventListenerWithCleanup = (target, event, handler) => {
    target.addEventListener(event, handler);
    const cleanup = () => target.removeEventListener(event, handler);
    eventCleanupFns.add(cleanup);
    return cleanup;
  };

  /**
   * Add a cleanup function to be called on unmount
   * @param {Function} cleanupFn - Cleanup function
   */
  const addCleanup = (cleanupFn) => {
    eventCleanupFns.add(cleanupFn);
  };

  /**
   * Check if iframe is already loaded (prevents duplicate processing)
   * @param {string} panelId - Panel identifier
   * @returns {boolean} Whether iframe was already loaded
   */
  const isIframeLoaded = (panelId) => {
    return loadedIframes.has(panelId);
  };

  /**
   * Mark iframe as loaded
   * @param {string} panelId - Panel identifier
   * @param {number} resetDelay - Delay before allowing reload (default: 1000ms)
   */
  const markIframeLoaded = (panelId, resetDelay = 1000) => {
    loadedIframes.add(panelId);
    // Allow reprocessing after delay (for genuine reloads)
    setTimeout(() => loadedIframes.delete(panelId), resetDelay);
  };

  /**
   * Clean up all event listeners and resources
   */
  const cleanup = () => {
    eventCleanupFns.forEach((cleanupFn) => {
      try { 
        cleanupFn(); 
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    });
    eventCleanupFns.clear();
    loadedIframes.clear();
  };

  // Auto-cleanup on component unmount
  onBeforeUnmount(cleanup);

  return {
    addEventListenerWithCleanup,
    addCleanup,
    isIframeLoaded,
    markIframeLoaded,
    cleanup
  };
}