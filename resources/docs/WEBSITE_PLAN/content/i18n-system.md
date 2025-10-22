# 国际化系统 (i18n)

## 系统架构

### 核心组件
- **vue-i18n**: Vue.js 官方国际化插件
- **Composition API**: 基于组合式 API 的国际化支持
- **JSON 消息文件**: 多语言文本内容存储
- **语言检测**: 自动检测和保存用户语言偏好

### 消息文件结构
```
src/
└── locales/
    ├── zh-CN.json    # 中文简体
    └── en-US.json    # 英文美式
```

## 语言支持

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

## 消息结构

### 消息文件格式
```json
{
  "nav": {
    "home": "首页",
    "aePreview": "AE 预览",
    "eaglePreview": "Eagle 预览",
    "download": "下载",
    "about": "关于",
    "docs": "使用文档"
  },
  "home": {
    "title": "Eagle 与 AE 的无缝桥梁",
    "features": {
      "dragDrop": {
        "title": "拖拽导入",
        "desc": [
          "从 Eagle 直接拖拽素材到 AE",
          "支持多种文件格式"
        ]
      }
    }
  }
}
```

### 嵌套结构优势
- **组织性**: 按功能模块组织文本
- **可维护性**: 便于查找和修改
- **一致性**: 统一的命名规范

## 在组件中使用国际化

### 1. 基础使用
```vue
<template>
  <h1>{{ t('home.title') }}</h1>
  <nav>
    <router-link to="/">{{ t('nav.home') }}</router-link>
    <router-link to="/ae-preview">{{ t('nav.aePreview') }}</router-link>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>
```

### 2. 动态消息
```vue
<template>
  <p>{{ t('messages.welcome', { name: userName }) }}</p>
  <p>{{ t('messages.itemsCount', itemCount) }}</p>
</template>
```

### 3. 复数处理
```json
{
  "messages": {
    "itemsCount": "有 {count} 个项目 | 有 {count} 个项目 | 有 {count} 个项目"
  }
}
```

### 4. 计算属性中的国际化
```javascript
const features = computed(() => {
  const localeMessages = tm('home.features');
  return [
    {
      id: 'feature-drag-drop',
      title: localeMessages.dragDrop.title,
      descriptionLines: localeMessages.dragDrop.desc,
      imageUrls: [
        '/images/features/feature-drag-import.png',
        // ... 其他图片
      ]
    }
  ];
});
```

## 语言切换机制

### 1. 语言切换函数
```javascript
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

### 2. 语言切换组件
```vue
<template>
  <select @change="changeLocale" :value="currentLocale">
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

## 动态语言加载

### 1. 按需加载语言包
```javascript
// 动态导入语言包
const loadLanguageAsync = async (locale) => {
  const messages = await import(`../locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
  return locale
}
```

### 2. 语言包预加载
```javascript
// 在应用启动时预加载所有支持的语言
const preloadLanguages = async () => {
  const supportedLanguages = ['zh-CN', 'en-US']
  const promises = supportedLanguages.map(locale => 
    import(`../locales/${locale}.json`)
      .then(module => {
        i18n.global.setLocaleMessage(locale, module.default)
      })
  )
  await Promise.all(promises)
}
```

## 国际化最佳实践

### 1. 消息键命名规范
```
// 按模块+功能+具体描述的层次结构
module.feature.description
home.hero.title
nav.links.download
features.dragDrop.title
```

### 2. 避免内联文本
```javascript
// ❌ 避免
const title = "首页"

// ✅ 推荐
const title = t('nav.home')
```

### 3. 处理复杂文本
```json
{
  "complex": {
    "terms": "使用本服务即表示您同意我们的 {0} 和 {1}",
    "highlightedText": "重要提示：{highlight}内容{endHighlight}需要特别注意"
  }
}
```

```vue
<template>
  <p v-html="t('complex.terms', ['服务条款', '隐私政策'])"></p>
</template>
```

## 完整的国际化配置

### 1. i18n.js 配置文件
```javascript
import { createI18n } from 'vue-i18n'

const SUPPORTED = ['zh-CN', 'en-US']

// 消息对象（实际项目中的完整消息）
export const messages = {
  'zh-CN': {
    // ... 中文消息
  },
  'en-US': {
    // ... 英文消息
  }
}

export const i18n = createI18n({
  legacy: false,              // 使用 Composition API
  locale: detectDefaultLocale(), // 默认语言
  fallbackLocale: 'en-US',    // 备用语言
  messages,                   // 语言消息
  missingWarn: false,         // 隐藏缺失翻译警告
  fallbackWarn: false         // 隐藏备用语言警告
})

// 导出语言切换函数
export function setLocale(locale) {
  // 实现语言切换逻辑
}
```

### 2. 在 main.js 中使用
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

## 性能优化

### 1. 消息懒加载
```javascript
// 只在需要时加载特定模块的消息
const loadModuleMessages = async (module, locale) => {
  const moduleMessages = await import(`../locales/modules/${module}/${locale}.json`)
  i18n.global.mergeLocaleMessage(locale, {
    [module]: moduleMessages.default
  })
}
```

### 2. 缓存机制
```javascript
// 缓存已翻译的文本
const translationCache = new Map()

const cachedT = (key, ...args) => {
  const cacheKey = `${key}:${JSON.stringify(args)}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }
  
  const result = t(key, ...args)
  translationCache.set(cacheKey, result)
  return result
}
```

## 测试策略

### 1. 国际化测试
```javascript
// 测试语言切换功能
test('language switching', () => {
  expect(i18n.global.locale.value).toBe('zh-CN')
  setLocale('en-US')
  expect(i18n.global.locale.value).toBe('en-US')
})

// 测试翻译键存在性
test('translation keys exist', () => {
  expect(t('nav.home')).toBeDefined()
  expect(t('nav.aePreview')).toBeDefined()
})
```

### 2. 完整性检查
```javascript
// 检查所有语言的消息键是否一致
const checkTranslationCompleteness = () => {
  const zhKeys = Object.keys(messages['zh-CN'])
  const enKeys = Object.keys(messages['en-US'])
  
  const missingInEn = zhKeys.filter(key => !enKeys.includes(key))
  const missingInZh = enKeys.filter(key => !zhKeys.includes(key))
  
  return {
    missingInEn,
    missingInZh
  }
}
```