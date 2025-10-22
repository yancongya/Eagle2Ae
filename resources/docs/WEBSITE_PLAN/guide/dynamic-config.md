# 动态配置系统

## 配置文件架构

### 配置文件位置
- **下载页面配置**: `public/config/download.json`
- **关于页面配置**: `public/config/about-socials.json`
- **配置优先级**: 配置文件 > 国际化文本 > 默认值

### 配置加载机制
```javascript
// 下载页面配置加载
const loadConfig = async () => {
  try {
    const res = await fetch('/config/download.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('网络错误')
    const data = await res.json()
    if (data.platforms && typeof data.platforms === 'object') {
      platforms.value = data.platforms
    }
    if (data.defaultOS && ['ae', 'eagle'].includes(data.defaultOS)) {
      selectedOS.value = data.defaultOS
    }
  } catch (e) {
    console.warn('下载配置加载失败', e)
    // 使用默认配置
  }
}
```

## 下载页面动态配置

### 配置结构
```json
{
  "platforms": {
    "ae": {
      "version": "1.0",
      "requirement": "Ae CC 2017+",
      "updated": "2025-10-18",
      "url": "https://example.com/ae-plugin",
      "ctaText": {
        "zh-CN": "下载 AE 插件",
        "en-US": "Get AE Plugin"
      },
      "prompt": {
        "zh-CN": "点击后将打开 AE 插件下载页面",
        "en-US": "This will open the AE plugin download page"
      },
      "target": "_blank",
      "downloadFilename": ""
    },
    "eagle": {
      "version": "1.0", 
      "requirement": "Eagle 4.0+",
      "updated": "2025-10-18",
      "url": "eagle://",
      "target": "protocol"
    }
  },
  "defaultOS": "ae"
}
```

### 配置项说明
- **version**: 扩展版本号
- **requirement**: 系统或软件版本要求
- **updated**: 更新日期
- **url**: 下载或操作链接
- **ctaText**: 呼吁行动按钮文本（支持国际化）
- **prompt**: 按钮下方的提示文本（支持国际化）
- **target**: 链接打开方式
  - `_blank`: 新窗口打开
  - `protocol`: 自定义协议（如 eagle://）
  - `_self`: 当前窗口打开
  - `download`: 触发下载

### 链接处理策略
- **自定义协议**: `eagle://` 等协议直接修改 `window.location.href`
- **普通链接**: 使用 `window.open()` 在新窗口打开
- **下载链接**: 使用 `<a>` 元素的 `download` 属性触发下载
- **同源文件**: 直接跳转到链接

## 关于页面动态配置

### 社交链接配置
```json
{
  "buttons": [
    {
      "id": "github",
      "iconPath": "/images/social/github.svg",
      "href": "https://github.com/...",
      "colors": {
        "from": "#4b5563",
        "to": "#111827", 
        "textColor": "#fff"
      }
    }
  ]
}
```

### 按钮配置项
- **id**: 按钮唯一标识符
- **iconPath**: 图标路径
- **href**: 链接地址
- **colors**: 渐变色配置
  - `from`: 渐变起始色
  - `to`: 渐变结束色
  - `textColor`: 文字颜色

## 配置加载策略

### 错误处理与降级
- **网络错误**: 使用预设的默认配置
- **解析错误**: 捕获并记录错误，使用默认值
- **缓存策略**: 使用 `cache: 'no-cache'` 遡保获取最新配置
- **国际化支持**: 配置中的文本支持多语言

### 组件生命周期集成
- **挂载时加载**: 在 `onMounted` 钩子中加载配置
- **响应式更新**: 配置加载后自动更新界面
- **语言变更**: 监听语言变更事件重新加载配置

## 动画效果集成

### 配置切换动画
下载页面在切换 AE/Eagle 选项时会触发动画：

- **按钮切换**: 标签间的滑动过渡
- **信息区域**: 3D 翻转动画显示新的版本、要求和更新日期
- **按钮和提示**: 淡入淡出动画
- **时间协调**: 使用 GSAP 时间轴协调多个动画

## 安全考虑

### 内全策略
- **URL 验证**: 验证配置中的链接格式
- **协议限制**: 限制可使用的链接协议
- **跨域处理**: 配置文件的跨域访问策略
- **XSS 防护**: 验证配置中的文本内容

## 维护考虑

### 配置更新
- **实时生效**: 配置更改后立即生效
- **版本控制**: 配置文件的版本管理
- **回滚策略**: 配置错误时的回滚机制
- **监控告警**: 配置加载失败的监控

### 开发者工具
- **本地测试**: 支持本地配置文件测试
- **调试接口**: 配置加载状态的调试接口
- **预览模式**: 配置更改的预览功能

## 最佳实践

### 配置设计
- **语义化结构**: 配置结构清晰易懂
- **扩展性**: 支持未来功能扩展
- **向后兼容**: 配置结构的向后兼容性
- **文档完整**: 配置项的完整文档说明