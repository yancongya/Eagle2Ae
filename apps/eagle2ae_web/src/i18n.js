import { createI18n } from 'vue-i18n'

const SUPPORTED = ['zh-CN', 'en-US']

function detectDefaultLocale() {
  const saved = localStorage.getItem('lang')
  if (saved && SUPPORTED.includes(saved)) return saved
  const browser = navigator.language || navigator.userLanguage || 'zh-CN'
  return browser.startsWith('zh') ? 'zh-CN' : 'en-US'
}

export const messages = {
  'zh-CN': {
    nav: {
      home: '首页',
      aePreview: 'AE 演示',
      eaglePreview: 'Eagle 演示',
      download: '下载'
    },
    footer: {
      copyright: '© 2025 烟囱鸭. 保留所有权利。',
      github: 'GitHub',
      feedback: '问题反馈'
    },
    route: {
      title: {
        home: '首页 - Eagle2AE',
        aePreview: 'AE 演示 - Eagle2AE',
        eaglePreview: 'Eagle 演示 - Eagle2AE',
        download: '下载 - Eagle2AE'
      }
    },
    download: {
      labels: {
        version: '版本',
        requirement: '版本需求',
        updated: '更新日期'
      },
      cta: {
        ae: '下载 AE 插件',
        eagle: '打开 Eagle'
      },
      prompt: {
        ae: '点击后将打开 AE 插件的网页（示例链接）。',
        eagle: '将通过 eagle:// 协议打开 Eagle（需本机已注册）。'
      },
      demoNote: '当前为虚拟下载链接，用于演示（无真实文件）。',
      page: {
        heading: '客户端下载',
        subtitle: '立即下载扩展，体验高效素材导出与 AE 项目生成能力。'
      }
    },
    hero: {
      bridge: '的无缝桥梁',
      subtitle: '像Eagle一样，快速在Ae导入导出素材，避免到处拉屎',
      featuresTitles: {
        dragDrop: '拖拽&粘贴导入 AE',
        formatSupport: '多种导入模式',
        smartOptions: '多种导入模式',
        autoSync: '快速导出图层',
        presets: '预设支持',
        performance: '和Eagle进行通信'
      }
    },
    home: {
      downloadCta: '立即下载，体验更高效的 Eagle → AE 工作流',
      features: {
        dragDrop: {
          title: '一键拖拽，轻松导入 AE',
          desc: [
            '将 Eagle 中的素材直接拖拽到 AE，自动识别并导入。 (图1)',
            '支持多种导入模式，例如作为素材或序列。 (图2)',
            '可自定义导入行为，如设置合成尺寸。 (图3)',
            '图层会自动根据文件名命名，方便管理。 (图4)',
            '导入预设可以保存并与团队共享。 (图5)'
          ]
        },
        formatSupport: {
          title: '丰富格式支持，无缝兼容',
          desc: [
            '支持 JPG, PNG, GIF 等多种静态图片格式。 (图1)',
            '矢量文件如 SVG, AI 会被自动转换为形状图层。 (图2)',
            'PSD 文件可以按图层结构导入。 (图3)',
            '视频文件如 MP4, MOV 也能无缝拖入。 (图4)',
            '音频文件如 MP3, WAV 同样支持。 (图5)'
          ]
        },
        smartOptions: {
          title: '智能选项，定制导入行为',
          desc: [
            '选择将素材导入为单个文件或序列。 (图1)',
            '可以创建预合成，并调整其尺寸和帧率。 (图2)',
            '对于矢量文件，可选择保留图层样式。 (图3)',
            '导入时自动应用上次使用的设置。 (图4)',
            '所有选项都可以保存为预设，一键调用。 (图5)'
          ]
        },
        autoSync: {
          title: '自动同步，保持最新版本',
          desc: [
            '当 Eagle 中的源文件被修改后，AE 中会提示更新。 (图1)',
            '一键点击即可将素材同步至最新版本。 (图2)',
            '无需手动重新导入或替换文件。 (图3)',
            '同步功能支持所有已导入的素材类型。 (图4)',
            '确保你的 AE 项目始终使用最新的资源。 (图5)'
          ]
        },
        presets: {
          title: '预设支持，协同更高效',
          desc: [
            '将常用的导入设置保存为预设。 (图1)',
            '团队成员可以共享和使用相同的预设。 (图2)',
            '确保整个团队工作流程的一致性。 (图3)',
            '预设可以导出和导入，方便迁移。 (图4)',
            '大大减少了重复配置导入选项的时间。 (图5)'
          ]
        },
        performance: {
          title: '性能优化，导入更快更稳',
          desc: [
            '针对同时导入数百个文件进行了优化。 (图1)',
            '后台处理队列，避免 AE 界面卡顿。 (图2)',
            '智能缓存机制，加速重复导入过程。 (图3)',
            '减少内存占用，即使在大型项目中也能流畅运行。 (图4)',
            '导入过程稳定，减少未知错误和崩溃。 (图5)'
          ]
        }
      }
    }
  },
  'en-US': {
    nav: {
      home: 'Home',
      aePreview: 'AE Demo',
      eaglePreview: 'Eagle Demo',
      download: 'Download'
    },
    footer: {
      copyright: '© 2025 ChimneyDuck. All Rights Reserved.',
      github: 'GitHub',
      feedback: 'Feedback'
    },
    route: {
      title: {
        home: 'Home - Eagle2AE',
        aePreview: 'AE Demo - Eagle2AE',
        eaglePreview: 'Eagle Demo - Eagle2AE',
        download: 'Download - Eagle2AE'
      }
    },
    download: {
      labels: {
        version: 'Version',
        requirement: 'Requirement',
        updated: 'Updated'
      },
      cta: {
        ae: 'Get AE Plugin',
        eagle: 'Open Eagle'
      },
      prompt: {
        ae: 'This will open the AE plugin page (demo link).',
        eagle: 'Will open Eagle via eagle:// protocol (requires registered handler).'
      },
      demoNote: 'This is a placeholder download link for demo purposes.',
      page: {
        heading: 'Client Download',
        subtitle: 'Download the extension to export assets efficiently and generate AE projects.'
      }
    },
    hero: {
      bridge: 'Seamless bridge',
      subtitle: 'Bring your Eagle library into After Effects in one click—no more tedious dragging and importing.',
      featuresTitles: {
        dragDrop: 'Drag & drop into AE, effortlessly',
        formatSupport: 'Rich format support, seamless compatibility',
        smartOptions: 'Smart options, customizable import behavior',
        autoSync: 'Auto sync, always up to date',
        presets: 'Preset support, collaborate efficiently',
        performance: 'Optimized performance, faster and steadier import'
      }
    },
    home: {
      downloadCta: 'Download now to streamline Eagle → AE workflow',
      features: {
        dragDrop: {
          title: 'Drag & drop into AE, effortlessly',
          desc: [
            'Drag assets from Eagle directly into AE—auto-detected and imported. (Img 1)',
            'Supports multiple import modes, like footage or sequence. (Img 2)',
            'Customize import behavior, such as composition size. (Img 3)',
            'Layers are automatically named based on filenames for easy management. (Img 4)',
            'Import presets can be saved and shared with your team. (Img 5)'
          ]
        },
        formatSupport: {
          title: 'Rich format support, seamless compatibility',
          desc: [
            'Supports various static image formats like JPG, PNG, GIF. (Img 1)',
            'Vector files like SVG, AI are auto-converted to shape layers. (Img 2)',
            'PSD files can be imported with their layer structure. (Img 3)',
            'Video files like MP4, MOV can also be dragged in seamlessly. (Img 4)',
            'Audio files like MP3, WAV are also supported. (Img 5)'
          ]
        },
        smartOptions: {
          title: 'Smart options, customizable import behavior',
          desc: [
            'Choose to import assets as single files or sequences. (Img 1)',
            'Create pre-compositions and adjust their size and frame rate. (Img 2)',
            'For vector files, choose to preserve layer styles. (Img 3)',
            'Automatically applies the last used settings on import. (Img 4)',
            'All options can be saved as presets for one-click recall. (Img 5)'
          ]
        },
        autoSync: {
          title: 'Auto sync, always up to date',
          desc: [
            'When a source file in Eagle is modified, AE will show an update prompt. (Img 1)',
            'One click to sync the asset to the latest version. (Img 2)',
            'No need to manually re-import or replace files. (Img 3)',
            'The sync feature supports all imported asset types. (Img 4)',
            'Ensures your AE project always uses the latest resources. (Img 5)'
          ]
        },
        presets: {
          title: 'Preset support, collaborate efficiently',
          desc: [
            'Save frequently used import settings as presets. (Img 1)',
            'Team members can share and use the same presets. (Img 2)',
            'Ensures consistency across the entire team\'s workflow. (Img 3)',
            'Presets can be exported and imported for easy migration. (Img 4)',
            'Greatly reduces time spent on re-configuring import options. (Img 5)'
          ]
        },
        performance: {
          title: 'Optimized performance, faster and steadier import',
          desc: [
            'Optimized for importing hundreds of files simultaneously. (Img 1)',
            'Background processing queue prevents AE interface from freezing. (Img 2)',
            'Smart caching mechanism speeds up repeated import processes. (Img 3)',
            'Reduces memory usage for smooth operation even in large projects. (Img 4)',
            'Stable import process reduces unknown errors and crashes. (Img 5)'
          ]
        }
      }
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: detectDefaultLocale(),
  fallbackLocale: 'en-US',
  messages
})

export function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return
  const supported = typeof document !== 'undefined' && 'startViewTransition' in document
  const docEl = typeof document !== 'undefined' ? document.documentElement : null
  if (!supported || !docEl) {
    i18n.global.locale.value = locale
    localStorage.setItem('lang', locale)
    try { document.documentElement.lang = locale } catch {}
    window.dispatchEvent(new CustomEvent('lang-changed', { detail: { locale } }))
    return
  }
  docEl.classList.add('vt-lang')
  document.startViewTransition(() => {
    i18n.global.locale.value = locale
    localStorage.setItem('lang', locale)
    document.documentElement.lang = locale
    window.dispatchEvent(new CustomEvent('lang-changed', { detail: { locale } }))
  }).finished.finally(() => {
    docEl.classList.remove('vt-lang')
  })
}

// Initialize html lang
try {
  document.documentElement.lang = i18n.global.locale.value
} catch {}