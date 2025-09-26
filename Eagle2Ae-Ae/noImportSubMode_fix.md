# noImportSubMode 持久化存储修复方案

## 问题描述

Eagle2Ae扩展项目中"不导入合成"模式下的"创建预合成"设置无法持久化存储，用户切换到创建预合成模式后，页面刷新或重新加载时会丢失设置。

## 问题根源

1. `noImportSubMode`字段的更新没有被正确保存到localStorage中
2. 在`loadQuickSettings()`方法中，没有正确恢复`noImportSubMode`的状态
3. 在导入行为变化监听器中，没有正确处理`noImportSubMode`的状态重置

## 修复方案

### 1. 修复导入行为变化监听器（main.js 第7975行附近）

**位置**: `setupQuickSettings()` 方法中的导入行为变化监听器

**原代码**:
```javascript
} else {
    // 如果"不导入合成"按钮现在是未选中状态，强制清除其特殊样式和文本
    noImportBtn.classList.remove('filled');
    noImportTextSpan.textContent = '不导入合成';
}
```

**修复后**:
```javascript
} else {
    // 如果"不导入合成"按钮现在是未选中状态，强制清除其特殊样式和文本
    noImportBtn.classList.remove('filled');
    noImportTextSpan.textContent = '不导入合成';
    // 重置noImportSubMode为normal状态
    this.settingsManager.updateField('noImportSubMode', 'normal');
}
```

### 2. 修复loadQuickSettings方法（main.js 第8150行附近）

**位置**: `loadQuickSettings()` 方法中的"不导入合成"选项处理

**原代码**:
```javascript
} else {
    // 如果禁用了添加到合成，则选择"不导入合成"
    const noImportRadio = document.querySelector('input[name="import-behavior"][value="no_import"]');
    if (noImportRadio) {
        noImportRadio.checked = true;
    } else {
        this.log('找不到"不导入合成"选项', 'warning');
    }
}
```

**修复后**:
```javascript
} else {
    // 如果禁用了添加到合成，则选择"不导入合成"
    const noImportRadio = document.querySelector('input[name="import-behavior"][value="no_import"]');
    if (noImportRadio) {
        noImportRadio.checked = true;
        
        // 恢复noImportSubMode的视觉状态
        const noImportBtn = document.getElementById('no-import-comp-btn');
        const noImportTextSpan = noImportBtn ? noImportBtn.querySelector('.behavior-text') : null;
        if (noImportBtn && noImportTextSpan) {
            const subMode = settings.noImportSubMode || 'normal';
            if (subMode === 'pre_comp') {
                noImportBtn.classList.add('filled');
                noImportTextSpan.textContent = '创建预合成';
            } else {
                noImportBtn.classList.remove('filled');
                noImportTextSpan.textContent = '不导入合成';
            }
        }
    } else {
        this.log('找不到"不导入合成"选项', 'warning');
    }
}
```

### 3. 修复按钮点击处理逻辑（main.js 文件末尾）

**位置**: DOMContentLoaded事件监听器中的按钮点击处理

**原代码**:
```javascript
noImportCompBtn.addEventListener('click', (event) => {
    if (wasCheckedOnMousedown) {
        event.preventDefault();
        const isFilled = noImportCompBtn.classList.toggle('filled');
        if (isFilled) {
            textSpan.textContent = '创建预合成';
            aeExtension.settingsManager.updateField('noImportSubMode', 'pre_comp');
        } else {
            textSpan.textContent = '不导入合成';
            aeExtension.settingsManager.updateField('noImportSubMode', 'normal');
        }
    }
});
```

**修复后**:
```javascript
noImportCompBtn.addEventListener('click', (event) => {
    if (wasCheckedOnMousedown) {
        event.preventDefault();
        const isFilled = noImportCompBtn.classList.toggle('filled');
        if (isFilled) {
            textSpan.textContent = '创建预合成';
            // 确保设置能够正确保存到localStorage
            const result = aeExtension.settingsManager.updateField('noImportSubMode', 'pre_comp', true, false);
            if (!result.success) {
                console.error('保存noImportSubMode设置失败:', result.error);
            }
        } else {
            textSpan.textContent = '不导入合成';
            // 确保设置能够正确保存到localStorage
            const result = aeExtension.settingsManager.updateField('noImportSubMode', 'normal', true, false);
            if (!result.success) {
                console.error('保存noImportSubMode设置失败:', result.error);
            }
        }
    }
});
```

## 修复要点

1. **自动保存**: 在`updateField`调用中确保`autoSave`参数为`true`
2. **错误处理**: 添加保存失败的错误处理和日志记录
3. **状态恢复**: 在页面加载时正确恢复`noImportSubMode`的视觉状态
4. **状态重置**: 在切换到其他导入行为时重置`noImportSubMode`为`normal`

## 测试验证

修复后需要验证以下场景：

1. 用户点击"不导入合成"按钮切换到"创建预合成"模式
2. 刷新页面后"创建预合成"状态是否保持
3. 切换到其他导入行为后再切换回来，状态是否正确重置
4. 浏览器开发者工具中localStorage是否正确保存了`noImportSubMode`字段

## 实施步骤

1. 备份原始的main.js文件
2. 按照上述修复方案逐一修改代码
3. 测试功能是否正常工作
4. 验证持久化存储是否生效