# 语言切换机制

## 语言切换实现

### 基于 vue-i18n 的语言切换
项目使用 vue-i18n 实现多语言支持，通过 LanguageSwitcher 组件提供用户界面。

```javascript
// 语言切换函数实现
export function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return;
  
  // 更新全局状态
  i18n.global.locale.value = locale;
  
  // 保存到本地存储
  localStorage.setItem('lang', locale);
  
  // 更新 HTML lang 属性
  try { 
    document.documentElement.lang = locale 
  } catch {}
  
  // 分发语言变更事件
  window.dispatchEvent(new CustomEvent('lang-changed', { 
    detail: { locale } 
  }));
}
```

## 支持的语言

### 当前支持的语言
- **zh-CN**: 中文简体 (默认语言)
- **en-US**: 英文美式 (备用语言)

### 语言检测逻辑
```javascript
function detectDefaultLocale() {
  // 1. 检查本地存储的偏好
  const saved = localStorage.getItem('lang');
  if (saved && SUPPORTED.includes(saved)) return saved;
  
  // 2. 检查浏览器语言设置
  const browser = navigator.language || navigator.userLanguage || 'zh-CN';
  
  // 3. 根据语言代码前缀判断
  return browser.startsWith('zh') ? 'zh-CN' : 'en-US';
}
```

## 组件实现

### 语言切换组件
```vue
<template>
  <select @change="changeLocale" :value="currentLocale" class="language-switcher">
    <option value="zh-CN">中文</option>
    <option value="en-US">English</option>
  </select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const { locale: currentLocale } = useI18n()

const changeLocale = (event) => {
  setLocale(event.target.value)
}
</script>
```

## 事件处理

### 语言变更事件
- **lang-changed**: 语言变更时触发的自定义事件
- **事件数据**: 包含变更后的语言代码
- **全局处理**: 其他组件可监听此事件更新自身状态

## 存储策略

### 本地存储
- **存储键**: 使用 'lang' 键存储语言偏好
- **持久化**: 语言选择在会话间保持
- **更新机制**: 语言变更时即时更新存储

## 用户体验

### 无缝切换
- **即时生效**: 语言切换即时应用到界面
- **内容完整性**: 确保所有文本正确翻译
- **视觉一致性**: 保持切换过程中的视觉一致性

### 偏好记忆
- **用户选择**: 记住用户的语言选择
- **系统检测**: 首次访问时检测系统语言
- **回退机制**: 确保总有可用的语言选项