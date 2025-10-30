import { ref, watch } from 'vue';

/**
 * Composable for managing panel layout persistence
 * @returns {Object} Panel layout utilities
 */
export function usePanelLayout() {
  // 默认布局配置
  const DEFAULT_LAYOUT = {
    mainSplit: 70, // 主分割：左侧面板占 70%
    verticalSplit: 50 // 垂直分割：上下面板各占 50%
  };

  // 从 localStorage 加载保存的布局
  const loadLayout = () => {
    try {
      const saved = localStorage.getItem('ae-preview-layout');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch (error) {
      console.warn('Failed to load panel layout:', error);
      return DEFAULT_LAYOUT;
    }
  };

  // 保存布局到 localStorage
  const saveLayout = (layout) => {
    try {
      localStorage.setItem('ae-preview-layout', JSON.stringify(layout));
    } catch (error) {
      console.warn('Failed to save panel layout:', error);
    }
  };

  // 响应式布局状态
  const layout = ref(loadLayout());

  // 监听布局变化并自动保存
  watch(layout, (newLayout) => {
    saveLayout(newLayout);
  }, { deep: true });

  // 更新主分割比例
  const updateMainSplit = (size) => {
    layout.value.mainSplit = size;
  };

  // 更新垂直分割比例
  const updateVerticalSplit = (size) => {
    layout.value.verticalSplit = size;
  };

  // 重置为默认布局
  const resetLayout = () => {
    layout.value = { ...DEFAULT_LAYOUT };
  };

  return {
    layout,
    updateMainSplit,
    updateVerticalSplit,
    resetLayout,
    DEFAULT_LAYOUT
  };
}