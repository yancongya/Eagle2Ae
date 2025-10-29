import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Eagle2Ae 文档中心",
  description: "Eagle2Ae 项目的 AE 扩展和 Eagle 扩展的综合文档",
  lang: 'zh-CN',
  ignoreDeadLinks: true, // 暂时禁用死链接检查，以便调试
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['script', { src: 'https://cdn.jsdelivr.net/gh/moezx/cdn@master/busuanzi/busuanzi.pure.mini.js', async: true }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'AE 扩展文档', link: '/ae/' },
      { text: 'Eagle 插件文档', link: '/eagle/' },
      { text: '通用指南', link: '/shared/' }
    ],
    sidebar: {
      '/ae/': [
        {
          text: 'AE 扩展 - 入门手册',
          items: [
            { text: '概述', link: '/ae/' },
            { text: '使用手册',
              items: [
                { text: '快速入门指南', link: '/ae/使用手册/1-quick-start-guide' },
                { text: '界面概览与核心设置', link: '/ae/使用手册/2-interface-overview-settings' },
                { text: '处理导入的各类素材', link: '/ae/使用手册/3-handling-imported-assets' },
                { text: '提取归档', link: '/ae/使用手册/4-extract-archive-assets-from-ae' },
                { text: '高级设置与预设管理', link: '/ae/使用手册/5-advanced-settings-preset-management' },
                { text: '常见问题与解答', link: '/ae/使用手册/6-faq' },
                { text: '多面板支持', link: '/ae/使用手册/7-multi-panel-support' },
                { text: 'UI 控制系统', link: '/ae/使用手册/8-ui-control-system' },
                { text: '拖拽导入增强功能', link: '/ae/使用手册/9-enhanced-drag-and-drop' },
                { text: '剪贴板导入优化', link: '/ae/使用手册/10-optimized-clipboard-import' },
                { text: '项目状态检测器', link: '/ae/使用手册/11-project-status-checker' },
                { text: '虚拟对话框系统', link: '/ae/使用手册/12-virtual-dialog-system' }
              ]
            }
          ]
        },
        {
          text: 'AE 扩展 - 开发手册',
          items: [
            {
              text: 'API 参考',
              items: [
                { text: '概述', link: '/ae/api/' },
                { text: '前端 JS API', link: '/ae/api/frontend-js-api' },
                { text: '智能对话框系统', link: '/ae/api/dialog-system' },
                { text: '虚拟弹窗系统', link: '/ae/api/virtual-dialog-system' },
                { text: '状态监控器', link: '/ae/api/status-monitor' },
                { text: '批量状态检测器', link: '/ae/api/batch-status-checker' },
                { text: '轮询管理器', link: '/ae/api/polling-manager' },
                { text: '连接监控器', link: '/ae/api/connection-monitor' },
                { text: '错误处理系统', link: '/ae/api/error-handling' },
                { text: '事件系统', link: '/ae/api/event-system' },
                { text: '配置管理系统', link: '/ae/api/config-management' },
                { text: '日志系统增强', link: '/ae/api/logging-enhancements' },
                { text: '性能监控', link: '/ae/api/performance-monitoring' },
                { text: '音效播放器', link: '/ae/api/sound-player' },
                { text: '端口发现服务', link: '/ae/api/port-discovery' },
                { text: '通信API', link: '/ae/api/communication-api' }
              ]
            },
            {
              text: '架构',
              items: [
                { text: '概述', link: '/ae/architecture/' },
                { text: 'CEP 扩展架构', link: '/ae/architecture/cep-extension-architecture' },
                { text: '通信协议', link: '/ae/architecture/communication-protocol' }
              ]
            },
            {
              text: '开发',
              items: [
                { text: '概述', link: '/ae/development/' },
                { text: 'Demo 指南', link: '/ae/development/demo-guide' },
                { text: '开发指南', link: '/ae/development/development-guide' },
                { text: '对话框系统', link: '/ae/development/dialog-system' },
                { text: '导入逻辑', link: '/ae/development/import-logic' },
                { text: '项目状态检测器', link: '/ae/development/project-status-checker' },
                { text: '设置指南', link: '/ae/development/setup-guide' },
                { text: 'UI 交互指南', link: '/ae/development/ui-interaction-guide' }
              ]
            },
            {
              text: '标准',
              items: [
                { text: '概述', link: '/ae/standards/' },
                { text: '编码标准', link: '/ae/standards/coding-standards' },
                { text: '项目标准', link: '/ae/standards/project-standards' },
                { text: '测试标准', link: '/ae/standards/testing-standards' }
              ]
            },
            {
              text: '核心组件',
              items: [
                { text: '概述', link: '/ae/core-components/' },
                { text: 'AE扩展', link: '/ae/core-components/ae-extension' },
                { text: 'Eagle连接管理器', link: '/ae/core-components/eagle-connection-manager' },
                { text: '导出管理器', link: '/ae/core-components/export-manager' },
                { text: '导入管理器', link: '/ae/core-components/import-manager' },
                { text: '日志管理器', link: '/ae/core-components/log-manager' },
                { text: '项目状态检测器', link: '/ae/core-components/project-status-checker' },
                { text: '设置管理器', link: '/ae/core-components/settings-manager' }
              ]
            },
            {
              text: '核心功能',
              items: [
                { text: '概述', link: '/ae/core-functionality/' },
                { text: '数据持久化', link: '/ae/core-functionality/data-persistence' },
                { text: '错误处理', link: '/ae/core-functionality/error-handling' },
                { text: '事件系统', link: '/ae/core-functionality/event-system' },
                { text: '日志系统', link: '/ae/core-functionality/logging-system' },
                { text: '模块系统', link: '/ae/core-functionality/module-system' },
                { text: '网络通信', link: '/ae/core-functionality/network-communication' },
                { text: '性能优化', link: '/ae/core-functionality/performance-optimization' },
                { text: '状态管理', link: '/ae/core-functionality/state-management' }
              ]
            },
            {
              text: '指南',
              items: [
                { text: '概述', link: '/ae/guides/' },
                { text: '拖拽导入增强指南', link: '/ae/guides/enhanced-drag-and-drop-guide' },
                { text: '多面板快速入门', link: '/ae/guides/multi-panel-quick-start' },
                { text: '预设管理指南', link: '/ae/guides/preset-management-guide' },
                { text: '项目状态检测器详细指南', link: '/ae/guides/project-status-checker-detailed' },
                { text: '项目状态检测器优化指南', link: '/ae/guides/project-status-checker-optimization' },
                { text: '项目状态检测器快速入门', link: '/ae/guides/project-status-checker-quick-start' },
                { text: 'UI控制系统指南', link: '/ae/guides/ui-control-system-guide' }
              ]
            },
            {
              text: '面板功能',
              items: [
                { text: '概述', link: '/ae/panel-functions/' },
                { text: '高级设置面板', link: '/ae/panel-functions/advanced-settings-panel' },
                { text: '连接状态', link: '/ae/panel-functions/connection-status' },
                { text: '检测图层', link: '/ae/panel-functions/detect-layers' },
                { text: '导出到Eagle', link: '/ae/panel-functions/export-to-eagle' },
                { text: '导入行为设置', link: '/ae/panel-functions/import-behavior-settings' },
                { text: '导入模式设置', link: '/ae/panel-functions/import-mode-settings' }
              ]
            },
            {
              text: '性能',
              items: [
                { text: '概述', link: '/ae/performance/' },
                { text: '最佳实践', link: '/ae/performance/best-practices' },
                { text: '文件处理优化', link: '/ae/performance/file-processing-optimization' },
                { text: '内存优化', link: '/ae/performance/memory-optimization' },
                { text: 'UI优化', link: '/ae/performance/ui-optimization' }
              ]
            },
            {
              text: 'UI 组件',
              items: [
                { text: '概述', link: '/ae/ui-components/' },
                { text: 'Eagle2AE样式系统', link: '/ae/ui-components/css-styles-eagle2ae' },
                { text: 'CSS变量', link: '/ae/ui-components/css-styles-variables' },
                { text: '组件样式', link: '/ae/ui-components/css-styles-components' },
                { text: 'API参考', link: '/ae/ui-components/css-styles-api' },
                { text: '使用示例', link: '/ae/ui-components/css-styles-examples' },
                { text: '最佳实践', link: '/ae/ui-components/css-styles-best-practices' }
              ]
            }
          ]
        },
        {
          text: 'AE 扩展 - 通用',
          items: [
            {
              text: '功能',
              items: [
                { text: '概述', link: '/ae/features/' },
                { text: '拖拽导入增强', link: '/ae/features/enhanced-drag-and-drop' },
                { text: '文件处理系统', link: '/ae/features/file-processing-system' },
                { text: '文件夹打开模块', link: '/ae/features/folder-opener-module' },
                { text: '文件夹打开系统升级', link: '/ae/features/folder-opening-system-upgrade' },
                { text: '全屏模式', link: '/ae/features/fullscreen-mode' },
                { text: '语言切换', link: '/ae/features/language-switching' },
                { text: '图层检测系统升级', link: '/ae/features/layer-detection-system-upgrade' },
                { text: '素材分类修复', link: '/ae/features/material-classification-fix' },
                { text: '素材分类', link: '/ae/features/material-classification' },
                { text: '多语言支持', link: '/ae/features/multi-language-support' },
                { text: '多面板支持', link: '/ae/features/multi-panel-support' },
                { text: '剪贴板导入优化', link: '/ae/features/optimized-clipboard-import' },
                { text: '预设管理系统', link: '/ae/features/preset-management-system' },
                { text: '项目状态检测器', link: '/ae/features/project-status-checker' },
                { text: '响应式UI', link: '/ae/features/responsive-ui' },
                { text: '设置管理系统', link: '/ae/features/settings-management-system' },
                { text: '主题切换系统', link: '/ae/features/theme-switching-system' },
                { text: '主题切换', link: '/ae/features/theme-switching' },
                { text: 'UI控制系统', link: '/ae/features/ui-control-system' },
                { text: '虚拟对话框系统', link: '/ae/features/virtual-dialog-system' }
              ],
            },
            {
              text: '指南',
              items: [
                { text: '概述', link: '/ae/guides/' },
                { text: '项目状态检测器指南', link: '/ae/guides/project-status-checker-guide' }
              ]
            },
            {
              text: '面板功能',
              items: [
                { text: '概述', link: '/ae/panel-functions/' },
                { text: '高级设置面板', link: '/ae/panel-functions/advanced-settings-panel' },
                { text: '批量图层导出', link: '/ae/panel-functions/batch-layer-export' },
                { text: '连接状态', link: '/ae/panel-functions/connection-status' },
                { text: '检测图层', link: '/ae/panel-functions/detect-layers' },
                { text: '导出路径设置', link: '/ae/panel-functions/export-path-settings' },
                { text: '导出到 Eagle', link: '/ae/panel-functions/export-to-eagle' },
                { text: '导入行为设置', link: '/ae/panel-functions/import-behavior-settings' },
                { text: '导入模式设置', link: '/ae/panel-functions/import-mode-settings' },
                { text: '导入设置指南', link: '/ae/panel-functions/import-settings-guide' }
              ]
            },
            {
              text: '性能',
              items: [
                { text: '概述', link: '/ae/performance/' },
                { text: '最佳实践', link: '/ae/performance/best-practices' },
                { text: '文件处理优化', link: '/ae/performance/file-processing-optimization' },
                { text: '内存优化', link: '/ae/performance/memory-optimization' },
                { text: '监控与分析', link: '/ae/performance/monitoring-and-analysis' },
                { text: '网络优化', link: '/ae/performance/network-optimization' },
                { text: '启动优化', link: '/ae/performance/startup-optimization' },
                { text: 'UI优化', link: '/ae/performance/ui-optimization' }
              ]
            },
            {
              text: '故障排除',
              items: [
                { text: '概述', link: '/ae/troubleshooting/' },
                { text: '常见问题', link: '/ae/troubleshooting/common-issues' },
                { text: '面板单选切换异常', link: '/ae/troubleshooting/面板单选切换异常-排查总结' }
              ]
            },
            { text: '更新日志', link: '/ae/CHANGELOG' }
          ]
        }
      ],
      '/eagle/': [
        {
          text: 'Eagle 扩展 - 入门手册',
          items: [
            { text: '概述', link: '/eagle/' },
            { text: '使用手册',
              items: [
                { text: '快速入门指南', link: '/eagle/使用手册/1-quick-start-guide' },
                { text: '界面概览与核心设置', link: '/eagle/使用手册/2-interface-overview-settings' },
                { text: '常见问题与解答', link: '/eagle/使用手册/3-faq' }
              ]
            }
          ]
        },
        {
          text: 'Eagle 扩展 - 开发手册',
          items: [
            { text: 'API 参考',
              items: [
                { text: '概述', link: '/eagle/api/' },
                { text: '数据库 API', link: '/eagle/api/database-api' },
                { text: '函数映射', link: '/eagle/api/function-mapping' },
                { text: '插件 API', link: '/eagle/api/plugin-api' },
                { text: '插件组件', link: '/eagle/api/plugin-components' },
                { text: 'WebSocket 服务器', link: '/eagle/api/websocket-server' }
              ]
            },
            {
              text: '架构',
              items: [
                { text: '概述', link: '/eagle/architecture/' },
                { text: 'Eagle 插件架构', link: '/eagle/architecture/eagle-plugin-architecture' }
              ]
            },
            {
              text: '开发',
              items: [
                { text: '概述', link: '/eagle/development/' },
                { text: '调试指南', link: '/eagle/development/debugging-guide' },
                { text: '插件开发指南', link: '/eagle/development/plugin-development-guide' },
                { text: '插件交互指南', link: '/eagle/development/plugin-interaction-guide' }
              ]
            },
            {
              text: '标准',
              items: [
                { text: '概述', link: '/eagle/standards/' },
                { text: '编码标准', link: '/eagle/standards/coding-standards' },
                { text: '项目标准', link: '/eagle/standards/project-standards' },
                { text: '测试标准', link: '/eagle/standards/testing-standards' }
              ]
            }
          ]
        }
      ],
      '/shared/': [
        {
          text: '通用指南',
          items: [
            { text: '概述', link: '/shared/' },
            { text: '提交规范', link: '/shared/commit-conventions' },
            { text: '通信协议', link: '/shared/communication-protocol' },
            { text: '开发指南', link: '/shared/development-guidelines' },
            { text: '系统概览', link: '/shared/system-overview' }
          ]
        }
      ]
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Eagle2Ae'
    }
  }
})