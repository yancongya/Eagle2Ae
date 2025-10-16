# Magic Portfolio - 样式配置 (详细指南)

**核心文件**: `src/resources/once-ui.config.ts`

这个文件是您网站所有视觉样式和效果的“总开关”。

---

### 如何修改全局样式？

通过修改 `style` 对象，您可以轻松改变网站的整体外观和感觉。

*示例: `src/resources/once-ui.config.ts`*
```javascript
const style: StyleConfig = {
  theme:       'dark',         // 'dark' (暗色), 'light' (亮色), 'system' (跟随系统)
  neutral:     'gray',         // 中性色: 'sand', 'gray', 'slate'
  brand:       'blue',         // 品牌色: 'blue', 'indigo', 'violet', 'cyan', 等...
  accent:      'indigo',       // 强调色: 'red', 'orange', 'yellow', 'green', 等...
  solid:       'contrast',     // 实体元素填充风格: 'color' (彩色), 'contrast' (高对比)
  solidStyle:  'flat',         // 实体元素样式: 'flat' (扁平), 'plastic' (仿塑料)
  border:      'playful',      // 边框圆角风格: 'rounded', 'playful', 'conservative'
  surface:     'translucent',  // 表面材质: 'filled' (实心), 'translucent' (半透明)
  transition:  'all',          // 动画过渡效果: 'all', 'micro', 'macro'
  scaling:     '100',          // 全局UI缩放: '90', '95', '100', '105', '110'
};
```
- **修改主题**: 改变 `theme` 的值可以在明暗模式和跟随系统之间切换。
- **修改颜色**: `neutral`, `brand`, `accent` 共同定义了网站的主色调。您可以从注释中列出的选项中选择，来快速改变配色方案。

---

### 如何修改背景效果？

通过修改 `effects` 对象，您可以组合出不同的动态背景效果。

*示例: `src/resources/once-ui.config.ts`*
```javascript
const effects = {
  // ...
  gradient: {
    display: true, // 设置为 true 来显示渐变
    opacity: 50,   // 设置不透明度
    // ...其他参数
  },
  dots: {
    display: true, // 设置为 true 来显示点阵
    size: 2,       // 点的大小
    color: 'brand-on-background-weak',
    opacity: 20
  },
  lines: {
    display: false, // 设置为 true 来显示线条
    // ...
  },
  grid: {
    display: false, // 设置为 true 来显示网格
    // ...
  }
}
```
- **开关效果**: 将您想要的效果的 `display` 属性设置为 `true` 或 `false` 即可打开或关闭它。
- **调整外观**: 您可以修改每个效果的 `opacity` (不透明度), `color` (颜色), `size` (大小) 等参数来进行微调。