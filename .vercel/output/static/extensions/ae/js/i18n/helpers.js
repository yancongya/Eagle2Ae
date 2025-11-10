// 国际化辅助函数
function updateDynamicContent(lang) {
  // 更新连接状态（仅在显示未连接占位时）
  const statusMain = document.getElementById('status-main');
  if (statusMain) {
    const text = statusMain.textContent.trim();
    const isDemo = /(\(演示\)|\(Demo\))/.test(text);
    const disconnectedPlaceholders = ['未连接', 'Disconnected', '未连接 (演示)', 'Disconnected (Demo)'];
    const connectedPlaceholders = ['已连接', 'Connected', '已连接 (演示)', 'Connected (Demo)'];

    if (disconnectedPlaceholders.includes(text)) {
      const key = isDemo ? 'common.disconnectedDemo' : 'common.notConnected';
      statusMain.textContent = window.i18n?.getText(key) || statusMain.textContent;
    } else if (connectedPlaceholders.includes(text)) {
      const key = isDemo ? 'common.connectedDemo' : 'common.connected';
      statusMain.textContent = window.i18n?.getText(key) || statusMain.textContent;
    }
  }

  // 更新测试连接按钮的标题（根据连接状态）
  const testConnectionBtn = document.getElementById('test-connection-btn');
  if (testConnectionBtn) {
    const connected = testConnectionBtn.classList.contains('connected');
    const titleKey = connected ? 'titles.connectionButtonConnected' : 'titles.connectionButtonDisconnected';
    const fallbackTitle = connected ? '左键：断开连接\n右键：刷新状态' : '左键：连接到Eagle\n右键：刷新状态';
    testConnectionBtn.title = window.i18n?.getText(titleKey) || window.i18n?.getText('common.testConnection') || fallbackTitle;
  }

  // 更新项目信息中的占位文案
  const aeVersion = document.getElementById('ae-version');
  if (aeVersion) {
    const waitingPlaceholders = ['获取中', 'Waiting'];
    if (waitingPlaceholders.some(p => aeVersion.textContent.includes(p))) {
      aeVersion.textContent = window.i18n?.getText('common.waitingForImport') || aeVersion.textContent;
    }
    // 同步悬浮提示为当前语言
    const prefix = window.i18n?.getText('tooltips.aeVersionPrefix') || 'AE版本:';
    const value = aeVersion.textContent.trim();
    if (value) aeVersion.title = `${prefix} ${value}`;
  }

  const projectName = document.getElementById('project-name');
  if (projectName) {
    const noProjectPlaceholders = ['未打开项目', 'No project open'];
    if (noProjectPlaceholders.includes(projectName.textContent.trim())) {
      projectName.textContent = window.i18n?.getText('common.noProjectOpen') || projectName.textContent;
    }
    // 悬浮提示直接显示项目名
    const value = projectName.textContent.trim();
    if (value) projectName.title = value;
  }

  const compName = document.getElementById('comp-name');
  if (compName) {
    const value = compName.textContent.trim();
    if (value) compName.title = value;
  }

  const projectPath = document.getElementById('project-path');
  if (projectPath) {
    const value = projectPath.textContent.trim();
    if (value) projectPath.title = value;
  }

  const eagleVersion = document.getElementById('eagle-version');
  if (eagleVersion) {
    const waitingPlaceholders = ['获取中', 'Waiting'];
    if (waitingPlaceholders.some(p => eagleVersion.textContent.includes(p))) {
      eagleVersion.textContent = window.i18n.getText('common.waitingForImport') || eagleVersion.textContent;
    }
    const prefix = window.i18n?.getText('tooltips.eagleVersionPrefix') || 'Eagle版本:';
    const value = eagleVersion.textContent.trim();
    if (value) eagleVersion.title = `${prefix} ${value}`;
  }

  const eaglePath = document.getElementById('eagle-path');
  if (eaglePath) {
    const prefix = window.i18n?.getText('tooltips.libraryPathPrefix') || '路径:';
    const value = eaglePath.title?.trim() || eaglePath.textContent.trim();
    if (value) eaglePath.title = `${prefix} ${value}`;
  }

  const eagleLibrary = document.getElementById('eagle-library');
  if (eagleLibrary) {
    const prefix = window.i18n?.getText('tooltips.libraryPrefix') || '资源库:';
    const value = eagleLibrary.textContent.trim();
    if (value) {
      eagleLibrary.setAttribute('title', `${prefix} ${value}`);
      eagleLibrary.title = `${prefix} ${value}`;
    }
  }

  const eagleFolder = document.getElementById('eagle-folder');
  if (eagleFolder) {
    const prefix = window.i18n?.getText('tooltips.currentGroupPrefix') || '当前组:';
    const value = eagleFolder.textContent.trim();
    if (value) eagleFolder.title = `${prefix} ${value}`;
  }

  // 更新导入状态消息，并设置悬浮提示为完整文本
  const latestLogMessage = document.getElementById('latest-log-message');
  if (latestLogMessage) {
    const waitingPlaceholders = ['等待', 'Waiting'];
    if (waitingPlaceholders.some(p => latestLogMessage.textContent.includes(p))) {
      latestLogMessage.textContent = window.i18n.getText('common.waitingForImport') || latestLogMessage.textContent;
    }

    const setTooltipTitle = () => {
      const fullText = latestLogMessage.textContent.trim();
      latestLogMessage.setAttribute('title', fullText);
    };

    // 初始化一次标题
    setTooltipTitle();

    // 监听文本更新，保持 title 同步，确保悬浮查看完整信息
    const logMessageObserver = new MutationObserver(() => setTooltipTitle());
    logMessageObserver.observe(latestLogMessage, {
      childList: true,
      characterData: true,
      subtree: true,
    });
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