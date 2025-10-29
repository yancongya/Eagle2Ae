## 使用示例

### 基本布局

#### 简单页面布局
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eagle2AE 扩展面板</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="extension-panel" class="d-flex flex-column h-full">
        <!-- 头部 -->
        <header class="panel-header">
            <h1 class="h4 font-semibold text-primary">Eagle2AE 扩展</h1>
            <div class="connection-status connected">
                <span class="status-indicator connected"></span>
                <span>Eagle: 已连接</span>
            </div>
        </header>
        
        <!-- 主体 -->
        <main class="panel-body overflow-y-auto">
            <div class="container">
                <div class="card mb-4">
                    <div class="card-header">
                        <h2 class="h5 font-medium text-primary">导入导出</h2>
                    </div>
                    <div class="card-body">
                        <div class="import-export-buttons">
                            <button class="btn btn-primary">导入</button>
                            <button class="btn btn-secondary">导出</button>
                            <button class="btn btn-outline">设置</button>
                        </div>
                        
                        <div class="drag-drop-area mt-4">
                            <div class="drag-drop-area-icon">📁</div>
                            <div class="drag-drop-area-title">拖拽文件到此处</div>
                            <div class="drag-drop-area-description">支持PNG、JPG、PSD等格式</div>
                            <div class="drag-drop-area-hint">或点击选择文件</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="h5 font-medium text-primary">最近的项目</h2>
                    </div>
                    <div class="card-body">
                        <ul class="item-list">
                            <li class="item-list-item">
                                <div class="item-list-item-icon">📄</div>
                                <div class="item-list-item-content">
                                    <div class="item-list-item-title">Project_001.aep</div>
                                    <div class="item-list-item-meta">
                                        <span>2024-01-15</span>
                                        <span>2.5GB</span>
                                    </div>
                                </div>
                            </li>
                            <li class="item-list-item">
                                <div class="item-list-item-icon">📄</div>
                                <div class="item-list-item-content">
                                    <div class="item-list-item-title">Project_002.aep</div>
                                    <div class="item-list-item-meta">
                                        <span>2024-01-14</span>
                                        <span>1.8GB</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- 底部 -->
        <footer class="panel-footer">
            <button class="btn btn-sm btn-secondary">帮助</button>
            <button class="btn btn-sm btn-primary">保存设置</button>
        </footer>
    </div>
</body>
</html>
```

#### 响应式布局
```html
<!-- 响应式卡片布局 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="card">
        <div class="card-body">
            <h3 class="h6 font-semibold text-primary mb-2">导入设置</h3>
            <p class="text-sm text-muted">配置导入选项和默认设置</p>
        </div>
    </div>
    <div class="card">
        <div class="card-body">
            <h3 class="h6 font-semibold text-primary mb-2">导出设置</h3>
            <p class="text-sm text-muted">配置导出选项和格式</p>
        </div>
    </div>
    <div class="card">
        <div class="card-body">
            <h3 class="h6 font-semibold text-primary mb-2">连接设置</h3>
            <p class="text-sm text-muted">配置Eagle连接选项</p>
        </div>
    </div>
</div>

<!-- 响应式按钮组 -->
<div class="d-flex flex-column sm:flex-row gap-2">
    <button class="btn btn-primary flex-grow-1">导入</button>
    <button class="btn btn-secondary flex-grow-1">导出</button>
    <button class="btn btn-outline flex-grow-1">设置</button>
</div>
```

### UI组件使用

#### 按钮组件
```html
<!-- 基础按钮 -->
<button class="btn">默认按钮</button>
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-success">成功按钮</button>
<button class="btn btn-warning">警告按钮</button>
<button class="btn btn-danger">危险按钮</button>

<!-- 不同尺寸 -->
<button class="btn btn-lg">大号按钮</button>
<button class="btn">默认按钮</button>
<button class="btn btn-sm">小号按钮</button>

<!-- 块级按钮 -->
<button class="btn btn-primary btn-block">块级按钮</button>

<!-- 带图标按钮 -->
<button class="btn btn-primary">
    <span class="mr-2">📁</span>
    选择文件
</button>

<!-- 禁用按钮 -->
<button class="btn btn-primary" disabled>禁用按钮</button>
```

#### 表单组件
```html
<!-- 基础表单 -->
<form class="space-y-4">
    <div class="settings-field">
        <label class="settings-field-label">项目名称</label>
        <input type="text" class="form-control" placeholder="输入项目名称">
        <div class="settings-field-description">项目的显示名称</div>
    </div>
    
    <div class="settings-field">
        <label class="settings-field-label">导入模式</label>
        <select class="form-control">
            <option value="direct">直接导入</option>
            <option value="project_adjacent" selected>项目旁复制</option>
            <option value="custom_folder">指定文件夹</option>
        </select>
    </div>
    
    <div class="settings-field">
        <label class="settings-field-label">
            <input type="checkbox" class="mr-2">
            添加到合成
        </label>
    </div>
    
    <div class="settings-field">
        <label class="settings-field-label">序列帧间隔</label>
        <input type="number" class="form-control" value="1.0" min="0.1" step="0.1">
    </div>
</form>
```

#### 卡片组件
```html
<!-- 基础卡片 -->
<div class="card">
    <div class="card-header">
        <h3 class="h6 font-semibold">卡片标题</h3>
    </div>
    <div class="card-body">
        <p>这里是卡片内容</p>
    </div>
    <div class="card-footer">
        <small>卡片底部内容</small>
    </div>
</div>

<!-- 带徽章的卡片 -->
<div class="card">
    <div class="card-body">
        <div class="d-flex justify-between items-center">
            <h3 class="h6 font-semibold">任务名称</h3>
            <span class="badge badge-success">完成</span>
        </div>
        <p class="text-sm text-muted mt-2">任务描述信息</p>
        <div class="progress mt-3">
            <div class="progress-bar" style="width: 75%"></div>
        </div>
    </div>
</div>
```

#### 状态指示组件
```html
<!-- 连接状态 -->
<div class="connection-status connected">
    <span class="status-indicator connected"></span>
    <span>Eagle: 已连接 (v2.3.0)</span>
</div>

<div class="connection-status disconnected">
    <span class="status-indicator disconnected"></span>
    <span>Eagle: 未连接</span>
</div>

<div class="connection-status warning">
    <span class="status-indicator warning"></span>
    <span>Eagle: 版本不兼容</span>
</div>

<!-- 项目状态 -->
<div class="d-flex items-center">
    <span class="status-indicator connected mr-2"></span>
    <span>项目: Project.aep</span>
</div>

<div class="d-flex items-center">
    <span class="status-indicator warning mr-2"></span>
    <span>合成: 未选择</span>
</div>
```