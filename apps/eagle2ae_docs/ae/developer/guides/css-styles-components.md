```css
/* 
 * Eagle2AE Extension UI组件样式
 * 包含所有自定义UI组件的样式定义
 */

/* 1. 按钮组件样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: var(--font-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 主要按钮 */
.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--primary-active);
  border-color: var(--primary-active);
  transform: translateY(1px);
}

/* 次要按钮 */
.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--border-primary);
}

.btn-secondary:active:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
  transform: translateY(1px);
}

/* 成功按钮 */
.btn-success {
  background-color: var(--success-color);
  color: var(--text-light);
  border-color: var(--success-color);
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-success:active:not(:disabled) {
  background-color: #1e7e34;
  border-color: #1c7430;
}

/* 警告按钮 */
.btn-warning {
  background-color: var(--warning-color);
  color: var(--text-dark);
  border-color: var(--warning-color);
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
  border-color: #d39e00;
}

.btn-warning:active:not(:disabled) {
  background-color: #d39e00;
  border-color: #c69500;
}

/* 危险按钮 */
.btn-danger {
  background-color: var(--error-color);
  color: var(--text-light);
  border-color: var(--error-color);
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-danger:active:not(:disabled) {
  background-color: #bd2130;
  border-color: #b21f2d;
}

/* 大号按钮 */
.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: var(--font-lg);
}

/* 小号按钮 */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-sm);
}

/* 块级按钮 */
.btn-block {
  display: block;
  width: 100%;
}

/* 2. 输入框组件样式 */
.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--font-md);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  background-clip: padding-box;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  appearance: none;
}

.form-control:focus {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 122, 204, 0.25);
}

.form-control:disabled,
.form-control[readonly] {
  background-color: var(--bg-secondary);
  opacity: 1;
}

.form-control-sm {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-sm);
  border-radius: var(--radius-sm);
}

.form-control-lg {
  padding: 0.75rem 1rem;
  font-size: var(--font-lg);
  border-radius: var(--radius-lg);
}

/* 3. 表单标签样式 */
.form-label {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-label.required::after {
  content: " *";
  color: var(--error-color);
}

/* 4. 卡片组件样式 */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: var(--bg-primary);
  background-clip: border-box;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.card-body {
  flex: 1 1 auto;
  padding: var(--spacing-lg);
}

.card-header {
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: 0;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.card-header:first-child {
  border-radius: calc(var(--radius-md) - 1px) calc(var(--radius-md) - 1px) 0 0;
}

.card-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}

.card-footer:last-child {
  border-radius: 0 0 calc(var(--radius-md) - 1px) calc(var(--radius-md) - 1px);
}

/* 5. 导航栏组件样式 */
.navbar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.navbar-brand {
  display: inline-block;
  padding-top: 0.3125rem;
  padding-bottom: 0.3125rem;
  margin-right: var(--spacing-lg);
  font-size: var(--font-lg);
  line-height: inherit;
  white-space: nowrap;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}

.navbar-nav {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.navbar-nav .nav-link {
  padding-right: 0;
  padding-left: 0;
  color: var(--text-secondary);
}

.navbar-nav .nav-link:hover,
.navbar-nav .nav-link:focus {
  color: var(--primary-color);
}

.navbar-text {
  display: inline-block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  color: var(--text-secondary);
}

/* 6. 导航链接样式 */
.nav-link {
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition-normal);
}

.nav-link:hover,
.nav-link:focus {
  color: var(--primary-color);
  background-color: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.nav-link.disabled {
  color: var(--text-muted);
  pointer-events: none;
  cursor: default;
}

/* 7. 标签页样式 */
.nav-tabs {
  border-bottom: 1px solid var(--border-primary);
}

.nav-tabs .nav-item {
  margin-bottom: -1px;
}

.nav-tabs .nav-link {
  border: 1px solid transparent;
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.nav-tabs .nav-link:hover,
.nav-tabs .nav-link:focus {
  border-color: var(--border-primary) var(--border-primary) var(--border-primary);
}

.nav-tabs .nav-link.disabled {
  color: var(--text-muted);
  background-color: transparent;
  border-color: transparent;
}

.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
  color: var(--primary-color);
  background-color: var(--bg-primary);
  border-color: var(--border-primary) var(--border-primary) var(--bg-primary);
}

/* 8. 徽章组件样式 */
.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: var(--radius-full);
  transition: var(--transition-normal);
}

.badge:empty {
  display: none;
}

.btn .badge {
  position: relative;
  top: -1px;
}

.badge-primary {
  color: var(--text-light);
  background-color: var(--primary-color);
}

.badge-secondary {
  color: var(--text-light);
  background-color: var(--secondary-color);
}

.badge-success {
  color: var(--text-light);
  background-color: var(--success-color);
}

.badge-warning {
  color: var(--text-dark);
  background-color: var(--warning-color);
}

.badge-danger {
  color: var(--text-light);
  background-color: var(--error-color);
}

.badge-info {
  color: var(--text-light);
  background-color: var(--info-color);
}

/* 9. 进度条样式 */
.progress {
  display: flex;
  height: 1rem;
  overflow: hidden;
  font-size: 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.progress-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: var(--text-light);
  text-align: center;
  white-space: nowrap;
  background-color: var(--primary-color);
  transition: width 0.6s ease;
}

.progress-bar-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-bar-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* 10. 提示框样式 */
.tooltip {
  position: absolute;
  z-index: 1070;
  display: block;
  margin: 0;
  font-family: inherit;
  font-style: normal;
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  white-space: normal;
  line-break: auto;
  font-size: var(--font-sm);
  word-wrap: break-word;
  opacity: 0;
}

.tooltip.show {
  opacity: 0.9;
}

.tooltip .tooltip-arrow {
  position: absolute;
  display: block;
  width: 0.8rem;
  height: 0.4rem;
}

.tooltip .tooltip-arrow::before {
  position: absolute;
  content: "";
  border-color: transparent;
  border-style: solid;
}

.bs-tooltip-top,
.bs-tooltip-auto[x-placement^="top"] {
  padding: 0.4rem 0;
}

.bs-tooltip-top .tooltip-arrow,
.bs-tooltip-auto[x-placement^="top"] .tooltip-arrow {
  bottom: 0;
}

.bs-tooltip-top .tooltip-arrow::before,
.bs-tooltip-auto[x-placement^="top"] .tooltip-arrow::before {
  top: 0;
  border-width: 0.4rem 0.4rem 0;
  border-top-color: #000;
}

.bs-tooltip-right,
.bs-tooltip-auto[x-placement^="right"] {
  padding: 0 0.4rem;
}

.bs-tooltip-right .tooltip-arrow,
.bs-tooltip-auto[x-placement^="right"] .tooltip-arrow {
  left: 0;
  width: 0.4rem;
  height: 0.8rem;
}

.bs-tooltip-right .tooltip-arrow::before,
.bs-tooltip-auto[x-placement^="right"] .tooltip-arrow::before {
  right: 0;
  border-width: 0.4rem 0.4rem 0.4rem 0;
  border-right-color: #000;
}

.bs-tooltip-bottom,
.bs-tooltip-auto[x-placement^="bottom"] {
  padding: 0.4rem 0;
}

.bs-tooltip-bottom .tooltip-arrow,
.bs-tooltip-auto[x-placement^="bottom"] .tooltip-arrow {
  top: 0;
}

.bs-tooltip-bottom .tooltip-arrow::before,
.bs-tooltip-auto[x-placement^="bottom"] .tooltip-arrow::before {
  bottom: 0;
  border-width: 0 0.4rem 0.4rem;
  border-bottom-color: #000;
}

.bs-tooltip-left,
.bs-tooltip-auto[x-placement^="left"] {
  padding: 0 0.4rem;
}

.bs-tooltip-left .tooltip-arrow,
.bs-tooltip-auto[x-placement^="left"] .tooltip-arrow {
  right: 0;
  width: 0.4rem;
  height: 0.8rem;
}

.bs-tooltip-left .tooltip-arrow::before,
.bs-tooltip-auto[x-placement^="left"] .tooltip-arrow::before {
  left: 0;
  border-width: 0.4rem 0 0.4rem 0.4rem;
  border-left-color: #000;
}

.tooltip-inner {
  max-width: 200px;
  padding: 0.25rem 0.5rem;
  color: var(--text-light);
  text-align: center;
  background-color: #000;
  border-radius: var(--radius-sm);
}

/* 11. 弹出框样式 */
.popover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1060;
  display: block;
  max-width: 276px;
  font-family: inherit;
  font-style: normal;
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  white-space: normal;
  line-break: auto;
  font-size: var(--font-sm);
  word-wrap: break-word;
  background-color: var(--bg-primary);
  background-clip: padding-box;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.popover .popover-arrow {
  position: absolute;
  display: block;
  width: 1rem;
  height: 0.5rem;
  margin: 0 0.3rem;
}

.popover .popover-arrow::before,
.popover .popover-arrow::after {
  position: absolute;
  display: block;
  content: "";
  border-color: transparent;
  border-style: solid;
}

.bs-popover-top,
.bs-popover-auto[x-placement^="top"] {
  margin-bottom: 0.5rem;
}

.bs-popover-top > .popover-arrow,
.bs-popover-auto[x-placement^="top"] > .popover-arrow {
  bottom: calc(-0.5rem - 1px);
}

.bs-popover-top > .popover-arrow::before,
.bs-popover-auto[x-placement^="top"] > .popover-arrow::before {
  bottom: 0;
  border-width: 0.5rem 0.5rem 0;
  border-top-color: var(--border-primary);
}

.bs-popover-top > .popover-arrow::after,
.bs-popover-auto[x-placement^="top"] > .popover-arrow::after {
  bottom: 1px;
  border-width: 0.5rem 0.5rem 0;
  border-top-color: var(--bg-primary);
}

.bs-popover-right,
.bs-popover-auto[x-placement^="right"] {
  margin-left: 0.5rem;
}

.bs-popover-right > .popover-arrow,
.bs-popover-auto[x-placement^="right"] > .popover-arrow {
  left: calc(-0.5rem - 1px);
  width: 0.5rem;
  height: 1rem;
  margin: 0.3rem 0;
}

.bs-popover-right > .popover-arrow::before,
.bs-popover-auto[x-placement^="right"] > .popover-arrow::before {
  left: 0;
  border-width: 0.5rem 0.5rem 0.5rem 0;
  border-right-color: var(--border-primary);
}

.bs-popover-right > .popover-arrow::after,
.bs-popover-auto[x-placement^="right"] > .popover-arrow::after {
  left: 1px;
  border-width: 0.5rem 0.5rem 0.5rem 0;
  border-right-color: var(--bg-primary);
}

.bs-popover-bottom,
.bs-popover-auto[x-placement^="bottom"] {
  margin-top: 0.5rem;
}

.bs-popover-bottom > .popover-arrow,
.bs-popover-auto[x-placement^="bottom"] > .popover-arrow {
  top: calc(-0.5rem - 1px);
}

.bs-popover-bottom > .popover-arrow::before,
.bs-popover-auto[x-placement^="bottom"] > .popover-arrow::before {
  top: 0;
  border-width: 0 0.5rem 0.5rem 0.5rem;
  border-bottom-color: var(--border-primary);
}

.bs-popover-bottom > .popover-arrow::after,
.bs-popover-auto[x-placement^="bottom"] > .popover-arrow::after {
  top: 1px;
  border-width: 0 0.5rem 0.5rem 0.5rem;
  border-bottom-color: var(--bg-primary);
}

.bs-popover-bottom .popover-header::before,
.bs-popover-auto[x-placement^="bottom"] .popover-header::before {
  position: absolute;
  top: 0;
  left: 50%;
  display: block;
  width: 1rem;
  margin-left: -0.5rem;
  content: "";
  border-bottom: 1px solid var(--bg-secondary);
}

.bs-popover-left,
.bs-popover-auto[x-placement^="left"] {
  margin-right: 0.5rem;
}

.bs-popover-left > .popover-arrow,
.bs-popover-auto[x-placement^="left"] > .popover-arrow {
  right: calc(-0.5rem - 1px);
  width: 0.5rem;
  height: 1rem;
  margin: 0.3rem 0;
}

.bs-popover-left > .popover-arrow::before,
.bs-popover-auto[x-placement^="left"] > .popover-arrow::before {
  right: 0;
  border-width: 0.5rem 0 0.5rem 0.5rem;
  border-left-color: var(--border-primary);
}

.bs-popover-left > .popover-arrow::after,
.bs-popover-auto[x-placement^="left"] > .popover-arrow::after {
  right: 1px;
  border-width: 0.5rem 0 0.5rem 0.5rem;
  border-left-color: var(--bg-primary);
}

.popover-header {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0;
  font-size: var(--font-md);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  border-top-left-radius: calc(var(--radius-lg) - 1px);
  border-top-right-radius: calc(var(--radius-lg) - 1px);
}

.popover-header:empty {
  display: none;
}

.popover-body {
  padding: 0.5rem 0.75rem;
  color: var(--text-primary);
}

/* 12. 模态框样式 */
.modal-open {
  overflow: hidden;
}

.modal-open .modal {
  overflow-x: hidden;
  overflow-y: auto;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  display: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 0.5rem;
  pointer-events: none;
}

.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}

.modal.modal-static .modal-dialog {
  transform: scale(1.02);
}

.modal-dialog-scrollable {
  display: flex;
  max-height: calc(100% - 1rem);
}

.modal-dialog-scrollable .modal-content {
  max-height: calc(100vh - 1rem);
  overflow: hidden;
}

.modal-dialog-scrollable .modal-header,
.modal-dialog-scrollable .modal-footer {
  flex-shrink: 0;
}

.modal-dialog-scrollable .modal-body {
  overflow-y: auto;
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 1rem);
}

.modal-dialog-centered::before {
  display: block;
  height: calc(100vh - 1rem);
  content: "";
}

.modal-dialog-centered.modal-dialog-scrollable {
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.modal-dialog-centered.modal-dialog-scrollable .modal-content {
  max-height: none;
}

.modal-dialog-centered.modal-dialog-scrollable::before {
  content: none;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: var(--bg-primary);
  background-clip: padding-box;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}

.modal-backdrop.fade {
  opacity: 0;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--border-primary);
  border-top-left-radius: calc(var(--radius-lg) - 1px);
  border-top-right-radius: calc(var(--radius-lg) - 1px);
}

.modal-header .close {
  padding: 1rem 1rem;
  margin: -1rem -1rem -1rem auto;
}

.modal-title {
  margin-bottom: 0;
  line-height: var(--line-height-normal);
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem;
  border-top: 1px solid var(--border-primary);
  border-bottom-right-radius: calc(var(--radius-lg) - 1px);
  border-bottom-left-radius: calc(var(--radius-lg) - 1px);
}

.modal-footer > * {
  margin: 0.25rem;
}

.modal-scrollbar-measure {
  position: absolute;
  top: -9999px;
  width: 50px;
  height: 50px;
  overflow: scroll;
}

@media (min-width: 576px) {
  .modal-dialog {
    max-width: 500px;
    margin: 1.75rem auto;
  }
  .modal-dialog-scrollable {
    max-height: calc(100% - 3.5rem);
  }
  .modal-dialog-scrollable .modal-content {
    max-height: calc(100vh - 3.5rem);
  }
  .modal-dialog-centered {
    min-height: calc(100% - 3.5rem);
  }
  .modal-dialog-centered::before {
    height: calc(100vh - 3.5rem);
  }
  .modal-sm {
    max-width: 300px;
  }
}

@media (min-width: 992px) {
  .modal-lg,
  .modal-xl {
    max-width: 800px;
  }
}

@media (min-width: 1200px) {
  .modal-xl {
    max-width: 1140px;
  }
}

/* 13. 警告框样式 */
.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.alert-heading {
  color: inherit;
}

.alert-link {
  font-weight: var(--font-weight-bold);
}

.alert-dismissible {
  padding-right: 4rem;
}

.alert-dismissible .close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 1.25rem;
  color: inherit;
}

.alert-primary {
  color: #004085;
  background-color: #cce5ff;
  border-color: #b8daff;
}

.alert-primary hr {
  border-top-color: #9fcdff;
}

.alert-primary .alert-link {
  color: #002752;
}

.alert-secondary {
  color: #383d41;
  background-color: #e2e3e5;
  border-color: #d6d8db;
}

.alert-secondary hr {
  border-top-color: #c8cbcf;
}

.alert-secondary .alert-link {
  color: #202326;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-success hr {
  border-top-color: #b1dfbb;
}

.alert-success .alert-link {
  color: #0b2e13;
}

.alert-info {
  color: #0c5460;
  background-color: #d1ecf1;
  border-color: #bee5eb;
}

.alert-info hr {
  border-top-color: #abdde5;
}

.alert-info .alert-link {
  color: #062c33;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.alert-warning hr {
  border-top-color: #ffe199;
}

.alert-warning .alert-link {
  color: #533f03;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.alert-danger hr {
  border-top-color: #f1b0b7;
}

.alert-danger .alert-link {
  color: #491217;
}

.alert-light {
  color: #818182;
  background-color: #fefefe;
  border-color: #fdfdfe;
}

.alert-light hr {
  border-top-color: #ececf6;
}

.alert-light .alert-link {
  color: #686868;
}

.alert-dark {
  color: #1b1e21;
  background-color: #d6d8d9;
  border-color: #c6c8ca;
}

.alert-dark hr {
  border-top-color: #b9bbbe;
}

.alert-dark .alert-link {
  color: #040505;
}

/* 14. 列表组样式 */
.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  border-radius: var(--radius-md);
}

.list-group-item-action {
  width: 100%;
  color: var(--text-secondary);
  text-align: inherit;
}

.list-group-item-action:hover,
.list-group-item-action:focus {
  z-index: 1;
  color: var(--text-primary);
  text-decoration: none;
  background-color: var(--bg-hover);
}

.list-group-item-action:active {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
}

.list-group-item:first-child {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.list-group-item:last-child {
  border-bottom-right-radius: inherit;
  border-bottom-left-radius: inherit;
}

.list-group-item.disabled,
.list-group-item:disabled {
  color: var(--text-muted);
  pointer-events: none;
  background-color: var(--bg-primary);
}

.list-group-item.active {
  z-index: 2;
  color: var(--text-light);
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.list-group-item + .list-group-item {
  border-top-width: 0;
}

.list-group-item + .list-group-item.active {
  margin-top: -1px;
  border-top-width: 1px;
}

.list-group-horizontal {
  flex-direction: row;
}

.list-group-horizontal > .list-group-item:first-child {
  border-bottom-left-radius: var(--radius-md);
  border-top-right-radius: 0;
}

.list-group-horizontal > .list-group-item:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-left-radius: 0;
}

.list-group-horizontal > .list-group-item.active {
  margin-top: 0;
}

.list-group-horizontal > .list-group-item + .list-group-item {
  border-top-width: 1px;
  border-left-width: 0;
}

.list-group-horizontal > .list-group-item + .list-group-item.active {
  margin-left: -1px;
  border-left-width: 1px;
}

@media (min-width: 576px) {
  .list-group-horizontal-sm {
    flex-direction: row;
  }
  .list-group-horizontal-sm > .list-group-item:first-child {
    border-bottom-left-radius: var(--radius-md);
    border-top-right-radius: 0;
  }
  .list-group-horizontal-sm > .list-group-item:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-left-radius: 0;
  }
  .list-group-horizontal-sm > .list-group-item.active {
    margin-top: 0;
  }
  .list-group-horizontal-sm > .list-group-item + .list-group-item {
    border-top-width: 1px;
    border-left-width: 0;
  }
  .list-group-horizontal-sm > .list-group-item + .list-group-item.active {
    margin-left: -1px;
    border-left-width: 1px;
  }
}

@media (min-width: 768px) {
  .list-group-horizontal-md {
    flex-direction: row;
  }
  .list-group-horizontal-md > .list-group-item:first-child {
    border-bottom-left-radius: var(--radius-md);
    border-top-right-radius: 0;
  }
  .list-group-horizontal-md > .list-group-item:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-left-radius: 0;
  }
  .list-group-horizontal-md > .list-group-item.active {
    margin-top: 0;
  }
  .list-group-horizontal-md > .list-group-item + .list-group-item {
    border-top-width: 1px;
    border-left-width: 0;
  }
  .list-group-horizontal-md > .list-group-item + .list-group-item.active {
    margin-left: -1px;
    border-left-width: 1px;
  }
}

@media (min-width: 992px) {
  .list-group-horizontal-lg {
    flex-direction: row;
  }
  .list-group-horizontal-lg > .list-group-item:first-child {
    border-bottom-left-radius: var(--radius-md);
    border-top-right-radius: 0;
  }
  .list-group-horizontal-lg > .list-group-item:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-left-radius: 0;
  }
  .list-group-horizontal-lg > .list-group-item.active {
    margin-top: 0;
  }
  .list-group-horizontal-lg > .list-group-item + .list-group-item {
    border-top-width: 1px;
    border-left-width: 0;
  }
  .list-group-horizontal-lg > .list-group-item + .list-group-item.active {
    margin-left: -1px;
    border-left-width: 1px;
  }
}

@media (min-width: 1200px) {
  .list-group-horizontal-xl {
    flex-direction: row;
  }
  .list-group-horizontal-xl > .list-group-item:first-child {
    border-bottom-left-radius: var(--radius-md);
    border-top-right-radius: 0;
  }
  .list-group-horizontal-xl > .list-group-item:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-left-radius: 0;
  }
  .list-group-horizontal-xl > .list-group-item.active {
    margin-top: 0;
  }
  .list-group-horizontal-xl > .list-group-item + .list-group-item {
    border-top-width: 1px;
    border-left-width: 0;
  }
  .list-group-horizontal-xl > .list-group-item + .list-group-item.active {
    margin-left: -1px;
    border-left-width: 1px;
  }
}

.list-group-flush {
  border-radius: 0;
}

.list-group-flush > .list-group-item {
  border-width: 0 0 1px;
}

.list-group-flush > .list-group-item:last-child {
  border-bottom-width: 0;
}

.list-group-item-primary {
  color: #004085;
  background-color: #b8daff;
}

.list-group-item-primary.list-group-item-action:hover,
.list-group-item-primary.list-group-item-action:focus {
  color: #004085;
  background-color: #9fcdff;
}

.list-group-item-primary.list-group-item-action.active {
  color: #fff;
  background-color: #004085;
  border-color: #004085;
}

.list-group-item-secondary {
  color: #383d41;
  background-color: #d6d8db;
}

.list-group-item-secondary.list-group-item-action:hover,
.list-group-item-secondary.list-group-item-action:focus {
  color: #383d41;
  background-color: #c8cbcf;
}

.list-group-item-secondary.list-group-item-action.active {
  color: #fff;
  background-color: #383d41;
  border-color: #383d41;
}

.list-group-item-success {
  color: #155724;
  background-color: #c3e6cb;
}

.list-group-item-success.list-group-item-action:hover,
.list-group-item-success.list-group-item-action:focus {
  color: #155724;
  background-color: #b1dfbb;
}

.list-group-item-success.list-group-item-action.active {
  color: #fff;
  background-color: #155724;
  border-color: #155724;
}

.list-group-item-info {
  color: #0c5460;
  background-color: #bee5eb;
}

.list-group-item-info.list-group-item-action:hover,
.list-group-item-info.list-group-item-action:focus {
  color: #0c5460;
  background-color: #abdde5;
}

.list-group-item-info.list-group-item-action.active {
  color: #fff;
  background-color: #0c5460;
  border-color: #0c5460;
}

.list-group-item-warning {
  color: #856404;
  background-color: #ffeaa7;
}

.list-group-item-warning.list-group-item-action:hover,
.list-group-item-warning.list-group-item-action:focus {
  color: #856404;
  background-color: #ffe199;
}

.list-group-item-warning.list-group-item-action.active {
  color: #fff;
  background-color: #856404;
  border-color: #856404;
}

.list-group-item-danger {
  color: #721c24;
  background-color: #f5c6cb;
}

.list-group-item-danger.list-group-item-action:hover,
.list-group-item-danger.list-group-item-action:focus {
  color: #721c24;
  background-color: #f1b0b7;
}

.list-group-item-danger.list-group-item-action.active {
  color: #fff;
  background-color: #721c24;
  border-color: #721c24;
}

.list-group-item-light {
  color: #818182;
  background-color: #fdfdfe;
}

.list-group-item-light.list-group-item-action:hover,
.list-group-item-light.list-group-item-action:focus {
  color: #818182;
  background-color: #ececf6;
}

.list-group-item-light.list-group-item-action.active {
  color: #fff;
  background-color: #818182;
  border-color: #818182;
}

.list-group-item-dark {
  color: #1b1e21;
  background-color: #c6c8ca;
}

.list-group-item-dark.list-group-item-action:hover,
.list-group-item-dark.list-group-item-action:focus {
  color: #1b1e21;
  background-color: #b9bbbe;
}

.list-group-item-dark.list-group-item-action.active {
  color: #fff;
  background-color: #1b1e21;
  border-color: #1b1e21;
}

/* 15. 表格样式 */
.table {
  width: 100%;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid var(--border-primary);
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid var(--border-primary);
}

.table tbody + tbody {
  border-top: 2px solid var(--border-primary);
}

.table-sm th,
.table-sm td {
  padding: 0.3rem;
}

.table-bordered {
  border: 1px solid var(--border-primary);
}

.table-bordered th,
.table-bordered td {
  border: 1px solid var(--border-primary);
}

.table-bordered thead th,
.table-bordered thead td {
  border-bottom-width: 2px;
}

.table-borderless th,
.table-borderless td,
.table-borderless thead th,
.table-borderless tbody + tbody {
  border: 0;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-hover tbody tr:hover {
  color: var(--text-primary);
  background-color: rgba(0, 0, 0, 0.075);
}

.table-primary,
.table-primary > th,
.table-primary > td {
  background-color: #b8daff;
}

.table-primary th,
.table-primary td,
.table-primary thead th,
.table-primary tbody + tbody {
  border-color: #7abaff;
}

.table-hover .table-primary:hover {
  background-color: #9fcdff;
}

.table-hover .table-primary:hover > td,
.table-hover .table-primary:hover > th {
  background-color: #9fcdff;
}

.table-secondary,
.table-secondary > th,
.table-secondary > td {
  background-color: #d6d8db;
}

.table-secondary th,
.table-secondary td,
.table-secondary thead th,
.table-secondary tbody + tbody {
  border-color: #b3b7bb;
}

.table-hover .table-secondary:hover {
  background-color: #c8cbcf;
}

.table-hover .table-secondary:hover > td,
.table-hover .table-secondary:hover > th {
  background-color: #c8cbcf;
}

.table-success,
.table-success > th,
.table-success > td {
  background-color: #c3e6cb;
}

.table-success th,
.table-success td,
.table-success thead th,
.table-success tbody + tbody {
  border-color: #8fd19e;
}

.table-hover .table-success:hover {
  background-color: #b1dfbb;
}

.table-hover .table-success:hover > td,
.table-hover .table-success:hover > th {
  background-color: #b1dfbb;
}

.table-info,
.table-info > th,
.table-info > td {
  background-color: #bee5eb;
}

.table-info th,
.table-info td,
.table-info thead th,
.table-info tbody + tbody {
  border-color: #86cfda;
}

.table-hover .table-info:hover {
  background-color: #abdde5;
}

.table-hover .table-info:hover > td,
.table-hover .table-info:hover > th {
  background-color: #abdde5;
}

.table-warning,
.table-warning > th,
.table-warning > td {
  background-color: #ffeaa7;
}

.table-warning th,
.table-warning td,
.table-warning thead th,
.table-warning tbody + tbody {
  border-color: #ffd670;
}

.table-hover .table-warning:hover {
  background-color: #ffe199;
}

.table-hover .table-warning:hover > td,
.table-hover .table-warning:hover > th {
  background-color: #ffe199;
}

.table-danger,
.table-danger > th,
.table-danger > td {
  background-color: #f5c6cb;
}

.table-danger th,
.table-danger td,
.table-danger thead th,
.table-danger tbody + tbody {
  border-color: #ed969e;
}

.table-hover .table-danger:hover {
  background-color: #f1b0b7;
}

.table-hover .table-danger:hover > td,
.table-hover .table-danger:hover > th {
  background-color: #f1b0b7;
}

.table-light,
.table-light > th,
.table-light > td {
  background-color: #fdfdfe;
}

.table-light th,
.table-light td,
.table-light thead th,
.table-light tbody + tbody {
  border-color: #fbfcfc;
}

.table-hover .table-light:hover {
  background-color: #ececf6;
}

.table-hover .table-light:hover > td,
.table-hover .table-light:hover > th {
  background-color: #ececf6;
}

.table-dark,
.table-dark > th,
.table-dark > td {
  background-color: #c6c8ca;
}

.table-dark th,
.table-dark td,
.table-dark thead th,
.table-dark tbody + tbody {
  border-color: #95999c;
}

.table-hover .table-dark:hover {
  background-color: #b9bbbe;
}

.table-hover .table-dark:hover > td,
.table-hover .table-dark:hover > th {
  background-color: #b9bbbe;
}

.table-active,
.table-active > th,
.table-active > td {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-hover .table-active:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-hover .table-active:hover > td,
.table-hover .table-active:hover > th {
  background-color: rgba(0, 0, 0, 0.075);
}

.table .thead-dark th {
  color: var(--text-light);
  background-color: #343a40;
  border-color: #454d55;
}

.table .thead-light th {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}
```