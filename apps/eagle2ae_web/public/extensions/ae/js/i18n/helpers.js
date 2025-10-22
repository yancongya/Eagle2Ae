// 国际化辅助函数
function updateDynamicContent(lang) {
  // 更新连接状态（仅在显示未连接占位时）
  const statusMain = document.getElementById('status-main');
  if (statusMain) {
    const isDisconnectedPlaceholder = ['未连接', 'Disconnected'].includes(statusMain.textContent.trim());
    if (isDisconnectedPlaceholder) {
      statusMain.textContent = window.i18n.getText('common.notConnected') || statusMain.textContent;
    }
  }

  // 更新测试连接按钮的标题（根据连接状态）
  const testConnectionBtn = document.getElementById('test-connection-btn');
  if (testConnectionBtn) {
    const connected = testConnectionBtn.classList.contains('connected');
    const titleKey = connected ? 'titles.connectionButtonConnected' : 'titles.connectionButtonDisconnected';
    const fallbackTitle = connected ? '左键：断开连接\n右键：刷新状态' : '左键：连接到Eagle\n右键：刷新状态';
    testConnectionBtn.title = window.i18n.getText(titleKey) || window.i18n.getText('common.testConnection') || fallbackTitle;
  }

  // 更新项目信息中的占位文案
  const aeVersion = document.getElementById('ae-version');
  if (aeVersion) {
    const waitingPlaceholders = ['获取中', 'Waiting'];
    if (waitingPlaceholders.some(p => aeVersion.textContent.includes(p))) {
      aeVersion.textContent = window.i18n.getText('common.waitingForImport') || aeVersion.textContent;
    }
  }

  const projectName = document.getElementById('project-name');
  if (projectName) {
    const noProjectPlaceholders = ['未打开项目', 'No project open'];
    if (noProjectPlaceholders.includes(projectName.textContent.trim())) {
      projectName.textContent = window.i18n.getText('common.noProjectOpen') || projectName.textContent;
    }
  }

  const eagleVersion = document.getElementById('eagle-version');
  if (eagleVersion) {
    const waitingPlaceholders = ['获取中', 'Waiting'];
    if (waitingPlaceholders.some(p => eagleVersion.textContent.includes(p))) {
      eagleVersion.textContent = window.i18n.getText('common.waitingForImport') || eagleVersion.textContent;
    }
  }

  // 更新导入状态消息
  const latestLogMessage = document.getElementById('latest-log-message');
  if (latestLogMessage) {
    const waitingPlaceholders = ['等待', 'Waiting'];
    if (waitingPlaceholders.some(p => latestLogMessage.textContent.includes(p))) {
      latestLogMessage.textContent = window.i18n.getText('common.waitingForImport') || latestLogMessage.textContent;
    }
  }

  // 更新最近使用的文件夹标题
  const recentFoldersTitle = document.querySelector('.recent-folders-title');
  if (recentFoldersTitle) {
    recentFoldersTitle.textContent = window.i18n.getText('common.recentlyUsedFolders') || recentFoldersTitle.textContent;
  }

  // 更新最近使用文件夹列表中的删除按钮
  const deleteButtons = document.querySelectorAll('.recent-folder-delete');
  deleteButtons.forEach(button => {
    button.title = window.i18n.getText('common.deleteRecord') || button.title;
  });
}

// 监听语言切换事件
if (window.i18n) {
  // 如果需要在其他地方调用国际化内容，可以使用如下方式：
  // window.i18n.getText('common.projectInfo')
}