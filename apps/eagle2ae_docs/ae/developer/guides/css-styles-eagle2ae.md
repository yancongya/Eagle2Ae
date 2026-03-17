```html
<!-- 扩展主面板样式 -->
#extension-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.panel-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

.panel-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 导入导出按钮组 */
.import-export-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.import-export-buttons .btn {
  flex: 1;
  min-width: 120px;
}

/* 设置面板样式 */
.settings-panel {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--spacing-lg);
  height: 100%;
}

.settings-sidebar {
  border-right: 1px solid var(--border-primary);
  padding-right: var(--spacing-lg);
}

.settings-content {
  padding-left: var(--spacing-lg);
}

.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section-title {
  font-size: var(--font-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-primary);
}

.settings-group {
  margin-bottom: var(--spacing-lg);
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-group-title {
  font-size: var(--font-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.settings-field {
  margin-bottom: var(--spacing-md);
}

.settings-field:last-child {
  margin-bottom: 0;
}

.settings-field-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.settings-field-description {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.settings-field-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.settings-field-group .form-control {
  flex: 1;
}

/* 状态指示器样式 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
}

.status-indicator.connected {
  background-color: var(--success-color);
}

.status-indicator.disconnected {
  background-color: var(--error-color);
}

.status-indicator.warning {
  background-color: var(--warning-color);
}

.status-indicator.info {
  background-color: var(--info-color);
}

/* 连接状态显示 */
.connection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  font-size: var(--font-sm);
}

.connection-status.connected {
  background-color: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.connection-status.disconnected {
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.connection-status.warning {
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

/* 项目列表样式 */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-list-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-fast);
}

.item-list-item:hover {
  background-color: var(--bg-hover);
}

.item-list-item:last-child {
  border-bottom: none;
}

.item-list-item.selected {
  background-color: rgba(0, 122, 204, 0.1);
  border-left: 3px solid var(--primary-color);
}

.item-list-item-icon {
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-list-item-content {
  flex: 1;
}

.item-list-item-title {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.item-list-item-meta {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--spacing-md);
}

.item-list-item-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 拖拽区域样式 */
.drag-drop-area {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  background-color: var(--bg-secondary);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.drag-drop-area:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-hover);
}

.drag-drop-area.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(0, 122, 204, 0.05);
  transform: scale(1.02);
}

.drag-drop-area.active {
  border-style: solid;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
}

.drag-drop-area-icon {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.drag-drop-area-title {
  font-size: var(--font-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.drag-drop-area-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.drag-drop-area-hint {
  font-size: var(--font-xs);
  color: var(--text-muted);
}

/* 加载指示器样式 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.loading-indicator .spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-primary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-left: var(--spacing-md);
  color: var(--text-secondary);
}

/* 通知样式 */
.notification {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1000;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 300px;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;
}

.notification.success {
  background-color: var(--success-color);
}

.notification.error {
  background-color: var(--error-color);
}

.notification.warning {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.notification.info {
  background-color: var(--info-color);
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.notification-message {
  font-size: var(--font-sm);
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-panel {
    grid-template-columns: 1fr;
  }
  
  .settings-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
    padding-right: 0;
    margin-bottom: var(--spacing-lg);
  }
  
  .settings-content {
    padding-left: 0;
  }
  
  .import-export-buttons {
    flex-direction: column;
  }
  
  .import-export-buttons .btn {
    width: 100%;
  }
  
  .panel-header,
  .panel-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .connection-status {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

/* 动画定义 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 打印样式 */
@media print {
  .no-print {
    display: none !important;
  }
  
  .card,
  .btn {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}
```