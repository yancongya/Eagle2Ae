// 面板配置 - 与 manifest.xml 保持同步
export const PANEL_CONFIG = {
  panel1: {
    id: 'com.eagle.eagle2ae.panel1',
    menuName: 'Eagle2Ae 1@烟囱鸭',
    title: '默认配置'
  },
  panel2: {
    id: 'com.eagle.eagle2ae.panel2', 
    menuName: 'Eagle2Ae 2@烟囱鸭',
    title: '快速预览'
  },
  panel3: {
    id: 'com.eagle.eagle2ae.panel3',
    menuName: 'Eagle2Ae 3@烟囱鸭', 
    title: '音频项目'
  }
};

export const getPanelLabel = (panelId) => PANEL_CONFIG[panelId]?.menuName || panelId;
export const getPanelTitle = (panelId) => PANEL_CONFIG[panelId]?.title || panelId;