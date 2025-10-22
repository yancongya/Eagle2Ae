# 组件测试

## Vue 组件测试基础

### 测试设置
```javascript
import { mount, shallowMount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from '@/components/MyComponent.vue'
```

### 浅渲染 vs 完整渲染
- **浅渲染**: `shallowMount` - 只渲染当前组件，子组件被存根
- **完整渲染**: `mount` - 渲染整个组件树

## 组件测试类型

### 渲染测试
- **元素存在性**: 测试组件渲染的元素是否正确
- **内容验证**: 验证组件渲染的文本内容
- **属性验证**: 验证元素的属性值

### 交互测试
- **事件处理**: 测试用户交互触发的事件
- **方法调用**: 验证组件方法被正确调用
- **状态变化**: 测试交互后的组件状态变化

### Props 测试
- **Props 传递**: 验证 props 被正确传递
- **Props 验证**: 测试 props 验证规则
- **默认值**: 验证 props 的默认值

## Vue 特定测试

### Composition API 测试
```javascript
// 测试组合式函数
import { useCounter } from '@/composables/useCounter'

describe('useCounter', () => {
  it('should increment count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

### 生命周期测试
- **onMounted**: 测试组件挂载后的逻辑
- **onUnmounted**: 测试组件卸载前的清理逻辑
- **响应性**: 测试响应式数据的变化

## Mock 和 Stub

### 服务 Mock
```javascript
// Mock API 服务
const mockApiService = {
  fetchData: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
}
```

### 依赖 Stub
- **路由 Mock**: 模拟 Vue Router 功能
- **状态管理 Mock**: 模拟 Pinia/Vuex 状态
- **第三方库 Mock**: 模拟外部依赖

## 异步测试

### Promise 处理
```javascript
it('should handle async operation', async () => {
  const wrapper = mount(MyComponent)
  await wrapper.find('button').trigger('click')
  expect(wrapper.text()).toContain('Loading...')
})
```

### 时间控制
- **定时器 Mock**: 使用 `vi.useFakeTimers()`
- **异步等待**: 等待异步操作完成

## 组件通信测试

### 事件测试
```javascript
it('should emit custom event', async () => {
  const wrapper = mount(MyComponent)
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted()).toHaveProperty('customEvent')
})
```

### 插槽测试
- **默认插槽**: 验证默认插槽内容
- **具名插槽**: 测试具名插槽渲染
- **作用域插槽**: 测试作用域插槽功能

## 样式和 DOM 测试

### CSS 类测试
- **动态类**: 验证根据条件应用的 CSS 类
- **状态类**: 测试不同状态下的样式类

### DOM 结构测试
- **结构验证**: 验证组件的 DOM 结构
- **选择器**: 使用选择器测试特定元素