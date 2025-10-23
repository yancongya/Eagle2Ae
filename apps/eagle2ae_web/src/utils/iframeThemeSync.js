/**
 * iframe 主题同步工具
 * 用于在主应用和 iframe 扩展之间同步主题切换动画
 */

/**
 * 向 iframe 发送主题更新消息（带动画坐标）
 * @param {HTMLIFrameElement} iframe - 目标 iframe 元素
 * @param {string} theme - 主题名称 ('light' | 'dark')
 * @param {Object} clickPosition - 点击位置 { x, y }
 */
export function syncThemeToIframe(iframe, theme, clickPosition = null) {
  if (!iframe || !iframe.contentWindow) return;
  
  iframe.contentWindow.postMessage({
    type: 'THEME_UPDATE',
    theme: theme,
    clickPosition: clickPosition
  }, '*');
}

/**
 * 向所有 iframe 发送主题更新消息
 * @param {HTMLElement} container - 包含 iframe 的容器元素
 * @param {string} theme - 主题名称 ('light' | 'dark')
 * @param {Object} clickPosition - 点击位置 { x, y }
 */
export function syncThemeToAllIframes(container, theme, clickPosition = null) {
  if (!container) return;
  
  const iframes = container.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  
  iframes.forEach(iframe => {
    syncThemeToIframe(iframe, theme, clickPosition);
  });
}
