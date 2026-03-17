import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Eagle2Ae 文档中心",
  description: "Eagle2Ae 项目的 AE 扩展和 Eagle 扩展的综合文档",
  lang: 'zh-CN',
  ignoreDeadLinks: true,
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
          text: '👤 用户文档',
          items: [
            { text: '概述', link: '/ae/' },
            { text: '入门指南',
              items: [
                { text: '入门', link: '/ae/user/getting-started/' }
              ]
            },
            { text: '使用指南',
              items: [
                { text: '快速入门指南', link: '/ae/user/guides/1-quick-start-guide' },
                { text: '界面概览与核心设置', link: '/ae/user/guides/2-interface-overview-settings' },
                { text: '处理导入的各类素材', link: '/ae/user/guides/3-handling-imported-assets' },
                { text: '提取归档', link: '/ae/user/guides/4-extract-archive-assets-from-ae' },
                { text: '高级设置与预设管理', link: '/ae/user/guides/5-advanced-settings-preset-management' },
                { text: '常见问题与解答', link: '/ae/user/guides/6-faq' },
                { text: '多面板支持', link: '/ae/user/guides/7-multi-panel-support' },
                { text: 'UI 控制系统', link: '/ae/user/guides/8-ui-control-system' },
                { text: '拖拽导入增强功能', link: '/ae/user/guides/9-enhanced-drag-and-drop' },
                { text: '剪贴板导入优化', link: '/ae/user/guides/10-optimized-clipboard-import' },
                { text: '项目状态检测器', link: '/ae/user/guides/11-project-status-checker' },
                { text: '虚拟对话框系统', link: '/ae/user/guides/12-virtual-dialog-system' },
                { text: '更新日志', link: '/ae/user/guides/CHANGELOG' }
              ]
            },
            { text: '故障排除',
              items: [
                { text: '常见问题', link: '/ae/user/troubleshooting/' },
                { text: '面板单选切换异常', link: '/ae/user/troubleshooting/面板单选切换异常-排查总结' }
              ]
            }
          ]
        },
        {
          text: '💻 开发者文档',
          items: [
            { text: '架构设计',
              items: [
                { text: '概述', link: '/ae/developer/architecture/' },
                { text: 'CEP 扩展架构', link: '/ae/developer/architecture/cep-extension-architecture' },
                { text: '通信协议', link: '/ae/developer/architecture/communication-protocol' }
              ]
            },
            { text: 'API 参考',
              items: [
                { text: '概述', link: '/ae/developer/api/' },
                { text: '前端 JS API', link: '/ae/developer/api/frontend-js-api' },
                { text: '智能对话框系统', link: '/ae/developer/api/dialog-system' },
                { text: '虚拟弹窗系统', link: '/ae/developer/api/virtual-dialog-system' },
                { text: '状态监控器', link: '/ae/developer/api/status-monitor' },
                { text: '批量状态检测器', link: '/ae/developer/api/batch-status-checker' },
                { text: '轮询管理器', link: '/ae/developer/api/polling-manager' },
                { text: '连接监控器', link: '/ae/developer/api/connection-monitor' },
                { text: '错误处理系统', link: '/ae/developer/api/error-handling' },
                { text: '事件系统', link: '/ae/developer/api/event-system' },
                { text: '配置管理系统', link: '/ae/developer/api/config-management' },
                { text: '日志系统增强', link: '/ae/developer/api/logging-enhancements' },
                { text: '性能监控', link: '/ae/developer/api/performance-monitor' },
                { text: '音效播放器', link: '/ae/developer/api/sound-player' },
                { text: '端口发现服务', link: '/ae/developer/api/port-discovery' },
                { text: '通信API', link: '/ae/developer/api/communication-api' },
                { text: '函数映射', link: '/ae/developer/api/function-mapping' },
                { text: 'JSX 脚本', link: '/ae/developer/api/jsx-scripts' },
                { text: '预设管理系统', link: '/ae/developer/api/preset-management-system' },
                { text: '项目状态检测器', link: '/ae/developer/api/project-status-checker' },
                { text: '设置管理系统', link: '/ae/developer/api/settings-management-system' },
                { text: 'UI控制系统', link: '/ae/developer/api/ui-control-system' },
                { text: '虚拟对话框系统', link: '/ae/developer/api/virtual-dialog-system' },
                { text: '多面板支持', link: '/ae/developer/api/multi-panel-support' },
                { text: '增强拖拽导入', link: '/ae/developer/api/enhanced-drag-and-drop' },
                { text: '优化剪贴板导入', link: '/ae/developer/api/optimized-clipboard-import' }
              ]
            },
            { text: '核心组件',
              items: [
                { text: '概述', link: '/ae/developer/components/' },
                { text: 'AE扩展', link: '/ae/developer/components/ae-extension' },
                { text: 'Eagle连接管理器', link: '/ae/developer/components/eagle-connection-manager' },
                { text: '导出管理器', link: '/ae/developer/components/export-manager' },
                { text: '导入管理器', link: '/ae/developer/components/import-manager' },
                { text: '日志管理器', link: '/ae/developer/components/log-manager' },
                { text: '项目状态检测器', link: '/ae/developer/components/project-status-checker' },
                { text: '设置管理器', link: '/ae/developer/components/settings-manager' }
              ]
            },
            { text: '开发指南',
              items: [
                { text: '概述', link: '/ae/developer/guides/' },
                { text: 'Demo 指南', link: '/ae/developer/guides/demo-guide' },
                { text: '开发指南', link: '/ae/developer/guides/development-guide' },
                { text: '对话框系统', link: '/ae/developer/guides/dialog-system' },
                { text: '导入逻辑', link: '/ae/developer/guides/import-logic' },
                { text: '设置指南', link: '/ae/developer/guides/setup-guide' },
                { text: 'UI 交互指南', link: '/ae/developer/guides/ui-interaction-guide' },
                { text: '拖拽导入增强指南', link: '/ae/developer/guides/enhanced-drag-and-drop-guide' },
                { text: '多面板快速入门', link: '/ae/developer/guides/multi-panel-quick-start' },
                { text: '预设管理指南', link: '/ae/developer/guides/preset-management-guide' },
                { text: '项目状态检测器详细指南', link: '/ae/developer/guides/project-status-checker-detailed' },
                { text: '项目状态检测器优化指南', link: '/ae/developer/guides/project-status-checker-optimization' },
                { text: '项目状态检测器快速入门', link: '/ae/developer/guides/project-status-checker-quick-start' },
                { text: 'UI控制系统指南', link: '/ae/developer/guides/ui-control-system-guide' },
                { text: '架构文档',
                  items: [
                    { text: '数据持久化', link: '/ae/developer/guides/data-persistence' },
                    { text: '错误处理', link: '/ae/developer/guides/error-handling' },
                    { text: '事件系统', link: '/ae/developer/guides/event-system' },
                    { text: '日志系统', link: '/ae/developer/guides/logging-system' },
                    { text: '模块系统', link: '/ae/developer/guides/module-system' },
                    { text: '网络通信', link: '/ae/developer/guides/network-communication' },
                    { text: '性能优化', link: '/ae/developer/guides/performance-optimization' },
                    { text: '状态管理', link: '/ae/developer/guides/state-management' }
                  ]
                },
                { text: '编码标准',
                  items: [
                    { text: '构建打包标准', link: '/ae/developer/guides/build-packaging-standards' },
                    { text: '配置管理标准', link: '/ae/developer/guides/configuration-management-standards' },
                    { text: 'E2E测试标准', link: '/ae/developer/guides/e2e-testing-standards' },
                    { text: '文件组织标准', link: '/ae/developer/guides/file-organization-standards' },
                    { text: '集成测试标准', link: '/ae/developer/guides/integration-testing-standards' },
                    { text: 'JavaScript编码标准', link: '/ae/developer/guides/javascript-coding-standards' },
                    { text: 'JSX编码标准', link: '/ae/developer/guides/jsx-coding-standards' },
                    { text: '性能测试标准', link: '/ae/developer/guides/performance-testing-standards' },
                    { text: '项目结构标准', link: '/ae/developer/guides/project-structure-standards' },
                    { text: '单元测试标准', link: '/ae/developer/guides/unit-testing-standards' },
                    { text: '版本控制标准', link: '/ae/developer/guides/version-control-standards' }
                  ]
                },
                { text: 'CSS样式',
                  items: [
                    { text: 'CSS样式API', link: '/ae/developer/guides/css-styles-api' },
                    { text: 'CSS样式最佳实践', link: '/ae/developer/guides/css-styles-best-practices' },
                    { text: 'CSS样式组件', link: '/ae/developer/guides/css-styles-components' },
                    { text: 'CSS样式Eagle2Ae', link: '/ae/developer/guides/css-styles-eagle2ae' },
                    { text: 'CSS样式示例', link: '/ae/developer/guides/css-styles-examples' },
                    { text: 'CSS样式变量', link: '/ae/developer/guides/css-styles-variables' }
                  ]
                }
              ]
            },
            { text: '性能优化',
              items: [
                { text: '概述', link: '/ae/developer/performance/' },
                { text: '最佳实践', link: '/ae/developer/performance/best-practices' },
                { text: '文件处理优化', link: '/ae/developer/performance/file-processing-optimization' },
                { text: '内存优化', link: '/ae/developer/performance/memory-optimization' },
                { text: '监控与分析', link: '/ae/developer/performance/monitoring-and-analysis' },
                { text: '网络优化', link: '/ae/developer/performance/network-optimization' },
                { text: '启动优化', link: '/ae/developer/performance/startup-optimization' },
                { text: 'UI优化', link: '/ae/developer/performance/ui-optimization' }
              ]
            }
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