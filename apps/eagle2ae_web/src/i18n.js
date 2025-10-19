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
      demoNote: '当前为虚拟下载链接，用于演示（无真实文件）。'
    },
    hero: {
      bridge: '的无缝桥梁',
      subtitle: '一键将您的 Eagle 素材库带入 After Effects，告别繁琐的拖拽与导入。',
      featuresTitles: {
        dragDrop: '一键拖拽，轻松导入 AE',
        formatSupport: '丰富格式支持，无缝兼容',
        smartOptions: '智能选项，定制导入行为',
        autoSync: '自动同步，保持最新版本',
        presets: '预设支持，协同更高效',
        performance: '性能优化，导入更快更稳'
      }
    },
    home: {
      downloadCta: '立即下载，体验更高效的 Eagle → AE 工作流',
      features: {
        dragDrop: {
          title: '一键拖拽，轻松导入 AE',
          desc: '将 Eagle 中的素材直接拖拽到 AE，自动识别并导入。'
        },
        formatSupport: {
          title: '丰富格式支持，无缝兼容',
          desc: '支持多种图片、矢量与动图格式，导入更稳定。'
        },
        smartOptions: {
          title: '智能选项，定制导入行为',
          desc: '导入时可选择作为素材、预合成或形状图层等。'
        },
        autoSync: {
          title: '自动同步，保持最新版本',
          desc: '素材更新后可一键同步到 AE，避免重复导入。'
        },
        presets: {
          title: '预设支持，协同更高效',
          desc: '导入行为可保存为预设，团队成员快速复用。'
        },
        performance: {
          title: '性能优化，导入更快更稳',
          desc: '针对大批量素材导入进行优化，显著减少等待时间。'
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
      demoNote: 'This is a placeholder download link for demo purposes.'
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
          desc: 'Drag assets from Eagle directly into AE—auto-detected and imported.'
        },
        formatSupport: {
          title: 'Rich format support, seamless compatibility',
          desc: 'Supports many image, vector, and animated formats for stable imports.'
        },
        smartOptions: {
          title: 'Smart options, customizable import behavior',
          desc: 'Choose import as footage, pre-comp, or shape layers, and more.'
        },
        autoSync: {
          title: 'Auto sync, always up to date',
          desc: 'One-click sync to AE after assets update—avoid re-imports.'
        },
        presets: {
          title: 'Preset support, collaborate efficiently',
          desc: 'Save import behavior as presets for quick team reuse.'
        },
        performance: {
          title: 'Optimized performance, faster and steadier import',
          desc: 'Optimized for bulk imports—significantly reduces waiting time.'
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