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

/**
 * 发送主题覆盖与锁定给单个 iframe
 * @param {HTMLIFrameElement} iframe
 * @param {string} theme - 'light' | 'dark'
 * @param {boolean} lock - 是否锁定扩展侧主题切换
 */
export function sendThemeOverrideToIframe(iframe, theme, lock = true) {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage({
    type: 'THEME_OVERRIDE',
    theme,
    lock: !!lock
  }, '*');
}

/**
 * 发送主题覆盖与锁定给容器内全部 iframe
 * @param {HTMLElement} container
 * @param {string} theme
 * @param {boolean} lock
 */
export function sendThemeOverrideToAllIframes(container, theme, lock = true) {
  if (!container) return;
  const iframes = container.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  iframes.forEach(iframe => sendThemeOverrideToIframe(iframe, theme, lock));
}

/**
 * 解除主题锁定
 * @param {HTMLIFrameElement} iframe
 */
export function sendThemeUnlockToIframe(iframe) {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage({ type: 'THEME_UNLOCK' }, '*');
}

/**
 * 解除容器内全部 iframe 的主题锁定
 * @param {HTMLElement} container
 */
export function sendThemeUnlockToAllIframes(container) {
  if (!container) return;
  const iframes = container.querySelectorAll('iframe');
  if (!iframes || !iframes.length) return;
  iframes.forEach(iframe => sendThemeUnlockToIframe(iframe));
}
