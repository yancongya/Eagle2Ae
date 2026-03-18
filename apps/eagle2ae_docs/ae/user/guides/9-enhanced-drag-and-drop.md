# 9. 拖拽导入增强功能

## 概述

Eagle2Ae AE 扩展 v2.4.0 对拖拽导入功能进行了全面增强，新增了文件夹拖拽支持、序列帧自动检测、项目内文件检测等多项功能。这些改进显著提升了用户的导入体验和工作效率。

## 核心特性

### 文件夹拖拽支持
- 支持直接拖拽整个文件夹到扩展面板
- 保持文件夹结构，便于组织素材
- 提供实时状态反馈和进度显示

### 序列帧自动检测
- 自动识别图片序列（如 frame001.png, frame002.png, ...）
- 将序列帧作为单个序列导入到AE中
- 支持多种命名模式和数字格式

### 项目内文件检测
- 检测拖拽的文件是否已在当前AE项目中
- 防止重复导入，提高工作效率
- 提供清晰的警告提示和选择选项

### 增强的视觉反馈
- 拖拽过程中的实时状态提示
- 智能文件类型识别和图标显示
- 详细的文件信息预览

## 使用指南

### 基本拖拽导入

#### 拖拽单个文件
1. 从文件管理器中选择一个或多个文件
2. 将文件拖拽到Eagle2Ae扩展面板的任意位置
3. 松开鼠标，系统将自动开始导入流程

#### 拖拽文件夹
1. 从文件管理器中选择一个文件夹
2. 将文件夹拖拽到扩展面板
3. 系统将递归扫描文件夹内容并显示预览

#### 混合拖拽
1. 可同时拖拽多个文件和文件夹
2. 系统将自动分类并显示相关信息

### 拖拽悬浮选择导入行为

#### 功能概述
Eagle2Ae AE 扩展 v2.5.0 新增了拖拽悬浮选择导入行为功能，允许用户在拖拽文件过程中，通过将鼠标悬浮到不同的导入行为按钮上来动态切换导入行为方式。这一功能大幅提升了导入的灵活性和效率。

#### 导入行为按钮
扩展面板提供了四个导入行为选项：
- **不导入合成** - 仅将素材导入到项目面板，不添加到时间轴
- **创建预合成** - 为导入的素材自动创建预合成
- **当前时间** - 将素材添加到时间轴当前时间指针位置
- **时间轴开始** - 将素材移至时间轴开始处（0秒位置）

#### 使用步骤
1. 开始拖拽文件到扩展面板
2. 在释放文件之前，将鼠标移动到想要的导入行为按钮上
3. 按钮会自动显示高亮选中状态（橙色边框和文字）
4. 继续移动鼠标到其他按钮可切换不同的导入行为
5. 在目标按钮上方释放鼠标，文件将使用选中的导入行为进行导入

#### 技术特点
- **实时响应**：拖拽过程中实时检测鼠标位置
- **智能切换**：自动切换按钮选中状态，确保只有一个按钮被选中
- **视觉反馈**：使用现有的高亮样式提供清晰的视觉反馈
- **无弹窗干扰**：移除了拖拽时的"拖拽文件到此处"弹窗提示
- **状态保持**：选中的导入行为会应用到最终的文件导入操作

#### 注意事项
- 拖拽悬浮功能仅在有文件被拖拽时激活
- 导入行为按钮的选择是实时的，可以随时切换
- 最终使用的导入行为取决于释放文件时鼠标悬浮的按钮
- 该功能与点击按钮选择导入行为功能并存，用户可以选择任一方式

### 序列帧检测

#### 自动识别序列帧
系统会自动检测以下格式的序列帧：
```
render_0001.png, render_0002.png, render_0003.png, ...
sequence001.jpg, sequence002.jpg, sequence003.jpg, ...
anim_1.tga, anim_2.tga, anim_3.tga, ...
```

#### 序列帧处理流程
1. 拖拽包含序列帧的文件夹
2. 系统自动识别序列帧模式
3. 在导入确认对话框中，序列帧显示为单个项目
4. 导入时，AE将序列帧作为单个序列处理

### 项目内文件检测

#### 检测机制
1. 拖拽文件时，系统自动检查文件路径
2. 与当前AE项目中的素材进行比对
3. 识别已在项目中的文件并标记

#### 处理选项
- **继续导入**: 忽略警告，强制导入所有文件
- **仅导入新文件**: 只导入项目中不存在的文件
- **取消导入**: 取消整个导入操作

## 技术实现

### 拖拽事件处理

```javascript
/**
 * 设置拖拽监听
 */
setupDragAndDrop() {
    document.addEventListener('dragover', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.add('drag-over');
        await this.handleDragPreview(e);
    });

    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('dragleave', (e) => {
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.classList.remove('drag-over');
            this.resetDragPreviewState();
        }
    });

    document.addEventListener('drop', this.handleFileDrop.bind(this));
}
```

### 序列帧检测算法

```javascript
/**
 * 检测图片序列
 * @param {Array} files - 文件数组
 * @returns {Object|null} 序列帧信息或null
 */
detectImageSequence(files) {
    // 只检测图片文件
    const imageFiles = files.filter(file => this.getFileCategory(file) === 'image');

    if (imageFiles.length < 2) return null;

    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));

    // 尝试找到数字模式
    const patterns = [];

    for (const file of imageFiles) {
        const name = file.name;
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));

        // 查找数字模式 - 支持多种数字格式，优先匹配最后一个数字序列
        const numberMatches = nameWithoutExt.match(/(.*?)(\d+)([^\d]*)$/);
        if (numberMatches) {
            const [, prefix, number, suffix] = numberMatches;
            patterns.push({
                prefix: prefix || '',
                number: parseInt(number),
                suffix: suffix || '',
                numberLength: number.length,
                originalNumber: number,
                file
            });
        }
    }

    // 找到最一致的模式
    const patternGroups = {};
    patterns.forEach(p => {
        const key = `${p.prefix}_${p.suffix}_${p.numberLength}`;
        if (!patternGroups[key]) {
            patternGroups[key] = [];
        }
        patternGroups[key].push(p);
    });

    // 找到最大的组
    let bestGroup = null;
    let maxSize = 0;

    for (const [key, group] of Object.entries(patternGroups)) {
        if (group.length > maxSize) {
            maxSize = group.length;
            bestGroup = group;
        }
    }

    // 排序并检查连续性
    bestGroup.sort((a, b) => a.number - b.number);

    const numbers = bestGroup.map(p => p.number);
    const start = numbers[0];
    const end = numbers[numbers.length - 1];

    // 检测步长
    let step = 1;
    if (numbers.length > 1) {
        const diffs = [];
        for (let i = 1; i < numbers.length; i++) {
            diffs.push(numbers[i] - numbers[i - 1]);
        }

        // 找到最常见的差值作为步长
        const diffCounts = {};
        diffs.forEach(diff => {
            diffCounts[diff] = (diffCounts[diff] || 0) + 1;
        });

        let maxCount = 0;
        for (const [diff, count] of Object.entries(diffCounts)) {
            if (count > maxCount) {
                maxCount = count;
                step = parseInt(diff);
            }
        }
    }

    // 构建模式字符串
    const firstPattern = bestGroup[0];
    const pattern = `${firstPattern.prefix}[${start}-${end}]${firstPattern.suffix}`;

    return {
        files: bestGroup.map(p => p.file),
        pattern,
        start,
        end,
        step,
        totalFiles: bestGroup.length
    };
}
```

### 项目内文件检测

```javascript
/**
 * 检查文件是否已在当前AE项目中导入
 * @param {Array} files - 文件数组
 * @returns {Object} 检测结果
 */
async isProjectInternalFile(files) {
    try {
        this.log(`🔍 开始检查 ${files.length} 个文件的项目状态`, 'info');

        // 快速提取文件路径数组
        const filePaths = [];
        for (const file of files) {
            const filePath = file.path || file.webkitRelativePath || file.name;
            if (filePath) {
                filePaths.push(filePath);
            }
        }

        if (filePaths.length === 0) {
            this.log('❌ 无法获取任何文件路径，允许导入', 'warning');
            return {
                hasProjectFiles: false,
                projectFiles: [],
                externalFiles: files
            };
        }

        // 首先快速检查是否有AE项目文件（这个检查很快）
        const aeProjectCheck = await this.executeExtendScript('checkAEProjectFiles', filePaths);

        if (aeProjectCheck && aeProjectCheck.success && aeProjectCheck.aeProjectFiles.length > 0) {
            this.log(`⚠️ 检测到 ${aeProjectCheck.aeProjectFiles.length} 个AE项目文件，禁止导入`, 'warning');

            // 使用哈希表快速匹配AE项目文件
            const aeProjectPathsSet = new Set();
            aeProjectCheck.aeProjectFiles.forEach(path => {
                aeProjectPathsSet.add(path.toLowerCase().replace(/\\/g, '/'));
            });

            const projectFiles = [];
            const externalFiles = [];

            for (const file of files) {
                const currentPath = file.path || file.webkitRelativePath || file.name;
                const normalizedCurrent = currentPath.toLowerCase().replace(/\\/g, '/');

                // 检查是否为AE项目文件
                const isAEProject = aeProjectPathsSet.has(normalizedCurrent) ||
                    Array.from(aeProjectPathsSet).some(projectPath =>
                        normalizedCurrent.includes(projectPath) || projectPath.includes(normalizedCurrent)
                    );

                if (isAEProject) {
                    projectFiles.push({
                        name: file.name,
                        path: currentPath,
                        type: 'ae_project'
                    });
                } else {
                    externalFiles.push(file);
                }
            }

            return {
                hasProjectFiles: true,
                projectFiles: projectFiles,
                externalFiles: externalFiles
            };
        }

        // 如果没有AE项目文件，检查是否已在项目中导入
        this.log('📡 检查文件是否已在项目中...', 'info');

        // 对于大量文件，进行分批处理以提高性能
        let checkResult;
        if (filePaths.length > 100) {
            this.log(`📦 文件数量较多(${filePaths.length})，使用分批处理`, 'info');
            const batchSize = 50;
            const allImportedFiles = [];
            const allExternalFiles = [];

            for (let i = 0; i < filePaths.length; i += batchSize) {
                const batch = filePaths.slice(i, i + batchSize);
                const batchResult = await this.executeExtendScript('checkProjectImportedFiles', batch);

                if (batchResult && batchResult.success) {
                    allImportedFiles.push(...(batchResult.importedFiles || []));
                    allExternalFiles.push(...(batchResult.externalFiles || []));
                }
            }

            checkResult = {
                success: true,
                importedFiles: allImportedFiles,
                externalFiles: allExternalFiles
            };
        } else {
            checkResult = await this.executeExtendScript('checkProjectImportedFiles', filePaths);
        }

        if (!checkResult || !checkResult.success) {
            const errorMsg = checkResult?.error || '未知错误';
            this.log(`💥 项目文件检查失败: ${errorMsg}`, 'error');
            // 检测失败时允许导入，避免阻止正常功能
            return {
                hasProjectFiles: false,
                projectFiles: [],
                externalFiles: files
            };
        }

        const importedFiles = checkResult.importedFiles || [];

        if (importedFiles.length > 0) {
            this.log(`检测到 ${importedFiles.length} 个已在项目中的文件`, 'warning');

            // 使用哈希表快速匹配已导入文件
            const importedPathsSet = new Set();
            importedFiles.forEach(path => {
                importedPathsSet.add(path.toLowerCase().replace(/\\/g, '/'));
            });

            const projectFiles = [];
            const externalFiles = [];

            for (const file of files) {
                const currentPath = file.path || file.webkitRelativePath || file.name;
                const normalizedCurrent = currentPath.toLowerCase().replace(/\\/g, '/');

                if (importedPathsSet.has(normalizedCurrent)) {
                    projectFiles.push({
                        name: file.name,
                        path: currentPath
                    });
                } else {
                    externalFiles.push(file);
                }
            }

            return {
                hasProjectFiles: true,
                projectFiles: projectFiles,
                externalFiles: externalFiles
            };
        }

        this.log('✅ 所有文件都不在项目中，允许导入', 'info');
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: files
        };

    } catch (error) {
        this.log(`项目内文件检测失败: ${error.message}`, 'error');
        // 检测失败时允许导入，避免阻止正常功能
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: files
        };
    }
}
```

## 导入确认对话框

### 功能特点

1. **智能文件分组**
   - 序列帧文件分组合并显示
   - 普通文件按类型分组
   - 提供文件统计信息

2. **实时状态显示**
   - 显示检测到的文件数量和类型
   - 提供序列帧检测结果
   - 显示项目内文件警告

3. **导入设置预览**
   - 实时显示当前导入模式
   - 显示时间轴放置行为
   - 提供设置修改入口

### 界面元素

```html
<!-- 导入确认对话框 -->
<div class="eagle-confirm-dialog">
    <div class="eagle-confirm-content">
        <div class="eagle-confirm-header">
            <h3>拖拽导入确认</h3>
        </div>
        <div class="eagle-confirm-body">
            <p>检测到 3 个序列帧文件夹，共 150 个文件</p>
            <div class="file-list">
                <div class="file-item-simple">
                    <span class="file-icon">🎞️</span>
                    <span class="file-name">render_[0001-0050].png</span>
                    <span class="file-size">2.3 MB</span>
                    <span class="file-type">序列帧</span>
                </div>
                <div class="file-item-simple">
                    <span class="file-icon">🎞️</span>
                    <span class="file-name">sequence_[001-100].jpg</span>
                    <span class="file-size">15.7 MB</span>
                    <span class="file-type">序列帧</span>
                </div>
            </div>
            <div class="import-settings-dark">
                <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">项目旁复制</span></div>
                <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">当前时间</span></div>
            </div>
        </div>
        <div class="eagle-confirm-actions-flex">
            <button id="drag-confirm-yes" class="btn-outline-primary">确认导入</button>
            <button id="drag-confirm-no" class="btn-outline-secondary">取消</button>
        </div>
    </div>
</div>
```

## 最佳实践

### 使用建议

#### 文件组织
1. 在导入前合理组织文件夹结构
2. 将序列帧文件放在单独的文件夹中
3. 避免混杂不同类型的文件

#### 序列帧命名
1. 遵循统一的序列帧命名规范
2. 使用连续的数字编号
3. 保持文件扩展名一致

#### 项目管理
1. 定期清理项目内不再需要的素材
2. 使用有意义的文件名和文件夹名
3. 建立素材版本管理机制

### 性能优化

#### 批量处理
1. 对于大量文件，使用分批处理避免阻塞
2. 合理设置防抖延迟
3. 优化文件路径比较算法

#### 内存管理
1. 及时清理临时文件对象
2. 避免重复读取文件信息
3. 合理使用缓存机制

## 故障排除

### 常见问题

#### 序列帧检测失败
- **症状**：序列帧文件未被正确识别
- **解决**：检查文件命名是否符合规范，重启扩展

#### 拖拽无响应
- **症状**：拖拽文件到面板无任何反应
- **解决**：检查拖拽事件监听器是否正常绑定，重启AE

#### 文件检测错误
- **症状**：已在项目中的文件被错误标记为新文件
- **解决**：手动刷新项目状态，检查文件路径匹配规则

### 调试技巧

#### 启用调试日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');
```

#### 查看检测过程
1. 在导入过程中查看控制台日志
2. 关注文件路径解析和匹配过程
3. 检查序列帧检测算法输出

#### 性能监控
1. 使用浏览器性能工具监控拖拽处理性能
2. 检查内存使用情况
3. 优化文件处理算法