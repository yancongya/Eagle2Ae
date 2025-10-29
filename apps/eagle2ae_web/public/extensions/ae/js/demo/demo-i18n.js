// Demo国际化辅助函数
class DemoI18nHelper {
  constructor() {
    this.demoTranslations = {
      'zh-CN': {
        // AE相关数据
        'ae': {
          'projectName': '演示项目',
          'activeComp': '佛跳墙',
          'projectPath': 'D:\\\\工作\\\\今天你吃饭了嘛\\\\反正我吃了.aep'
        },
        // Eagle相关数据
        'eagle': {
          'libraryName': '仓鼠党',
          'execPath': 'D:\\\\仓鼠.library'
        },
        // Demo 连接状态数据
        'demo': {
          'projectName': {
            'connected': '正在做饭'
          },
          'compName': {
            'connected': '佛跳墙'
          },
          'folderName': {
            'connected': '仓鼠党'
          }
        },
        // 图层检测相关数据
        'layerDetection': {
          'compName': '佛跳墙',
          'layers': {
            'backgroundImage': '背景图片.jpg',
            'logoDesign': 'Logo设计.psd',
            'animationVideo': '动画视频.mp4',
            'iconDesign': '图标设计.ai',
            'solidBackground': '纯色背景',
            'titleText': '标题文字',
            'precompEffects': '预合成-特效'
          },
          'paths': {
            'backgroundImage': 'D:\\素材\\图片\\背景图片.jpg',
            'logoDesign': 'D:\\素材\\设计\\Logo设计.psd',
            'animationVideo': 'D:\\素材\\视频\\动画视频.mp4',
            'iconDesign': 'D:\\素材\\设计\\图标设计.ai'
          },
          'materialTypes': {
            'design': '设计',
            'image': '图片', 
            'video': '视频',
            'audio': '音频',
            'animation': '动图',
            'vector': '矢量',
            'raw': '原始',
            'document': '文档',
            'sequence': '序列'
          },
          'materialCategories': {
            'design': '设计文件',
            'material': '素材文件',
            'image': '图片素材',
            'video': '视频素材'
          },
          'layerTypes': {
            'AVLayer': '📦',
            'SolidLayer': '🟦', 
            'TextLayer': '📝',
            'ShapeLayer': '🔷',
            'PrecompLayer': '📁',
            'CameraLayer': '📷',
            'LightLayer': '💡',
            'AdjustmentLayer': '⚙️',
            'SequenceLayer': '🎯'
          },
          'reasons': {
            'materialNotSupport': '图片素材，素材文件不支持导出',
            'canExport': '设计文件，可以导出',
            'videoExportFirstFrame': '视频素材，将导出第一帧',
            'solidNotSupport': '纯色图层不支持导出',
            'textCanExport': '文本图层，可以导出',
            'precompNotSupport': '预合成图层不支持导出'
          },
          'logMessages': {
            'compName': '合成名称',
            'detectedLayers': '检测到 个选中图层:',
            'exportable': '可导出',
            'notExportable': '不可导出',
            'detectionResult': '检测结果',
            'materialStats': '素材统计',
            'typeDistribution': '类型分布'
          },
          'pathSummary': {
            'designFiles': '设计文件',
            'materialFiles': '素材文件'
          }
        }
      },
      'en-US': {
        // AE related data
        'ae': {
          'projectName': 'Demo Project',
          'activeComp': 'Jumps Over the Wall',
          'projectPath': 'D:\\\\Work\\\\HaveYouEatenToday\\\\AnywayIEat.aep'
        },
        // Eagle related data
        'eagle': {
          'libraryName': 'Hamster Party',
          'execPath': 'D:\\\\Hamster.library'
        },
        // Demo connected state data
        'demo': {
          'projectName': {
            'connected': 'Cooking'
          },
          'compName': {
            'connected': 'Jumps Over the Wall'
          },
          'folderName': {
            'connected': 'Hamster Party'
          }
        },
        // Layer detection related data
        'layerDetection': {
          'compName': 'Jumps Over the Wall',
          'layers': {
            'backgroundImage': 'Background.jpg',
            'logoDesign': 'Logo.psd',
            'animationVideo': 'Animation.mp4',
            'iconDesign': 'Icon.ai',
            'solidBackground': 'Solid Background',
            'titleText': 'Title Text',
            'precompEffects': 'Precomp-Effects'
          },
          'paths': {
            'backgroundImage': 'D:\\Materials\\Images\\Background.jpg',
            'logoDesign': 'D:\\Materials\\Design\\Logo.psd',
            'animationVideo': 'D:\\Materials\\Video\\Animation.mp4',
            'iconDesign': 'D:\\Materials\\Design\\Icon.ai'
          },
          'materialTypes': {
            'design': 'Design',
            'image': 'Image',
            'video': 'Video',
            'audio': 'Audio',
            'animation': 'Animation',
            'vector': 'Vector',
            'raw': 'Raw',
            'document': 'Document',
            'sequence': 'Sequence'
          },
          'materialCategories': {
            'design': 'Design File',
            'material': 'Material File',
            'image': 'Image Material',
            'video': 'Video Material'
          },
          'layerTypes': {
            'AVLayer': '📦',
            'SolidLayer': '🟦',
            'TextLayer': '📝',
            'ShapeLayer': '🔷',
            'PrecompLayer': '📁',
            'CameraLayer': '📷',
            'LightLayer': '💡',
            'AdjustmentLayer': '⚙️',
            'SequenceLayer': '🎯'
          },
          'reasons': {
            'materialNotSupport': 'Image material, material files do not support export',
            'canExport': 'Design file, can be exported',
            'videoExportFirstFrame': 'Video material, will export first frame',
            'solidNotSupport': 'Solid layer does not support export',
            'textCanExport': 'Text layer, can be exported',
            'precompNotSupport': 'Precomp layer does not support export'
          },
          'logMessages': {
            'compName': 'Composition Name',
            'detectedLayers': 'Detected layers selected:',
            'exportable': 'exportable',
            'notExportable': 'not exportable',
            'detectionResult': 'Detection Result',
            'materialStats': 'Material Stats',
            'typeDistribution': 'Type Distribution'
          },
          'pathSummary': {
            'designFiles': 'Design Files',
            'materialFiles': 'Material Files'
          }
        }
      }
    };
  }

  // 将演示相关的日志与标签注入到全局 i18n.translations
  installIntoI18n() {
    try {
      const lang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
      const layerDetection = this.demoTranslations[lang]?.layerDetection || this.demoTranslations['zh-CN']?.layerDetection || {};

      const labels = layerDetection.materialTypes || {};
      const lm = layerDetection.logMessages || {};

      // 构造 Demo 日志文案（覆盖 demo-apis.js 期望的键）
      const logs = (lang === 'en-US') ? {
        apiSimulatorInit: 'Demo API simulator initialized',
        testConnection: 'Testing connection (demo)...',
        connectionFailed: 'Connection failed (demo)',
        noResponseMessage: 'No response message (demo)',
        mockWSDisconnect: 'Mock WebSocket disconnected (demo)',
        disconnected: 'Disconnected (demo)',
        getProjectInfo: 'Get project info (demo)',
        getEagleFiles: 'Get Eagle files (demo)',
        importFiles: 'Import files (demo)',
        importFailed: 'Import failed (demo)',
        sendMessage: 'Send message type: {type}',
        responseMessage: 'Response message type: {type}',
        detectLayers: 'Detect layers (demo)',
        layerDataNotFound: 'Layer data not found (demo)',
        compName: lm.compName || 'Composition Name',
        compNameLog: (lm.compName || 'Composition Name') + ': {name}',
        detectedLayersLog: (lm.detectedLayers || 'Detected layers selected:') + ' {count}',
        exportable: lm.exportable || 'exportable',
        notExportable: lm.notExportable || 'not exportable',
        detectionResult: lm.detectionResult || 'Detection Result',
        materialStats: lm.materialStats || 'Material Stats',
        typeDistribution: lm.typeDistribution || 'Type Distribution'
      } : {
        apiSimulatorInit: '演示API模拟器初始化',
        testConnection: '正在测试连接(演示)...',
        connectionFailed: '连接失败(演示)',
        noResponseMessage: '无响应消息(演示)',
        mockWSDisconnect: '模拟WebSocket断开(演示)',
        disconnected: '已断开(演示)',
        getProjectInfo: '获取项目信息(演示)',
        getEagleFiles: '获取Eagle文件(演示)',
        importFiles: '导入文件(演示)',
        importFailed: '导入失败(演示)',
        sendMessage: '发送消息类型: {type}',
        responseMessage: '响应消息类型: {type}',
        detectLayers: '检测图层(演示)',
        layerDataNotFound: '未找到图层数据(演示)',
        compName: lm.compName || '合成名称',
        compNameLog: (lm.compName || '合成名称') + ': {name}',
        detectedLayersLog: (lm.detectedLayers || '检测到 个选中图层:') + ' {count}',
        exportable: lm.exportable || '可导出',
        notExportable: lm.notExportable || '不可导出',
        detectionResult: lm.detectionResult || '检测结果',
        materialStats: lm.materialStats || '素材统计',
        typeDistribution: lm.typeDistribution || '类型分布'
      };

      window.i18n = window.i18n || {};
      window.i18n.translations = window.i18n.translations || {};
      window.i18n.translations.demo = { logs, labels };
    } catch (e) {
      console.warn('Failed to install demo translations into i18n:', e);
    }
  }

  getDemoText(key) {
    const lang = window.i18n?.currentLang || 'zh-CN';
    try {
      const keys = key.split('.');
      let value = this.demoTranslations[lang];
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return null;
        }
      }
      return value;
    } catch (error) {
      console.warn(`Demo translation key not found: ${key}`, error);
      // 回退到中文
      return this.getFallbackDemoText(key);
    }
  }

  getFallbackDemoText(key) {
    try {
      const keys = key.split('.');
      let value = this.demoTranslations['zh-CN'];
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return null;
        }
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  // 获取当前语言的完整演示数据
  getLocalizedDemoData() {
    // 优先使用window.i18n.currentLang，否则从localStorage获取，最后回退到zh-CN
    const lang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
    
    // 确保在页面加载时正确初始化语言
    if (!window.i18n) {
      console.warn('i18n not initialized, using language from localStorage or default zh-CN');
    }
    
    return {
      ae: {
        version: '2024 (24.0.0)',
        projectName: this.getDemoText('ae.projectName'),
        projectPath: this.getDemoText('ae.projectPath'),
        activeComp: this.getDemoText('ae.activeComp'),
        compDuration: '00:00:30:00',
        frameRate: 30,
        resolution: '1920x1080'
      },
      eagle: {
        version: '4.0.0 build 1 pid 41536',
        libraryPath: this.getDemoText('eagle.execPath'),
        totalItems: 1247,
        selectedFolder: this.getDemoText('eagle.libraryName')
      },
      layerDetection: {
        compName: this.getDemoText('layerDetection.compName'),
        selectedLayers: [
          {
            index: 1,
            name: this.getDemoText('layerDetection.layers.backgroundImage'),
            type: 'MaterialLayer',
            exportable: false,
            reason: this.getDemoText('layerDetection.reasons.materialNotSupport'),
            sourceInfo: {
              type: 'File',
              fileName: this.getDemoText('layerDetection.layers.backgroundImage'),
              originalPath: 'D:\\\\素材\\\\图片\\\\背景图片.jpg',
              materialType: 'image',
              materialCategory: this.getDemoText('layerDetection.materialCategories.image'),
              categoryType: 'material',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.material'),
              fileExtension: 'jpg',
              width: 1920,
              height: 1080,
              duration: null,
              hasAlpha: false
            },
            tooltipInfo: {
              categoryType: 'material',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.material'),
              originalPath: 'D:\\\\素材\\\\图片\\\\背景图片.jpg',
              materialType: 'image',
              materialCategory: this.getDemoText('layerDetection.materialCategories.image'),
              fileSize: '2.1MB',
              fileDate: '2024-01-15 14:30:22',
              dimensions: '1920x1080',
              hasActionButtons: true,
              actionButtonType: 'open-folder'
            }
          },
          {
            index: 2,
            name: this.getDemoText('layerDetection.layers.logoDesign'),
            type: 'MaterialLayer',
            exportable: true,
            reason: this.getDemoText('layerDetection.reasons.canExport'),
            sourceInfo: {
              type: 'File',
              fileName: this.getDemoText('layerDetection.layers.logoDesign'),
              originalPath: 'D:\\\\素材\\\\设计\\\\Logo设计.psd',
              materialType: 'design',
              materialCategory: this.getDemoText('layerDetection.materialCategories.design'),
              categoryType: 'design',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.design'),
              fileExtension: 'psd',
              width: 512,
              height: 512,
              duration: null,
              hasAlpha: true
            },
            tooltipInfo: {
              categoryType: 'design',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.design'),
              originalPath: 'D:\\\\素材\\\\设计\\\\Logo设计.psd',
              materialType: 'design',
              materialCategory: this.getDemoText('layerDetection.materialCategories.design'),
              fileSize: '15.8MB',
              fileDate: '2024-01-20 09:15:33',
              dimensions: '512x512',
              hasActionButtons: true,
              actionButtonType: 'export'
            }
          },
          {
            index: 3,
            name: this.getDemoText('layerDetection.layers.animationVideo'),
            type: 'MaterialLayer',
            exportable: false,
            reason: this.getDemoText('layerDetection.reasons.videoExportFirstFrame'),
            sourceInfo: {
              type: 'File',
              fileName: this.getDemoText('layerDetection.layers.animationVideo'),
              originalPath: 'D:\\\\素材\\\\视频\\\\动画视频.mp4',
              materialType: 'video',
              materialCategory: this.getDemoText('layerDetection.materialCategories.video'),
              categoryType: 'material',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.material'),
              fileExtension: 'mp4',
              width: 1920,
              height: 1080,
              duration: '00:00:15:00',
              hasAlpha: false
            },
            tooltipInfo: {
              categoryType: 'material',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.material'),
              originalPath: 'D:\\\\素材\\\\视频\\\\动画视频.mp4',
              materialType: 'video',
              materialCategory: this.getDemoText('layerDetection.materialCategories.video'),
              fileSize: '15.2MB',
              fileDate: '2024-12-15 14:30:25',
              dimensions: '1920x1080',
              duration: '00:00:15:00'
            }
          },
          {
            index: 4,
            name: this.getDemoText('layerDetection.layers.iconDesign'),
            type: 'MaterialLayer',
            exportable: true,
            reason: this.getDemoText('layerDetection.reasons.canExport'),
            sourceInfo: {
              type: 'File',
              fileName: this.getDemoText('layerDetection.layers.iconDesign'),
              originalPath: 'D:\\\\素材\\\\设计\\\\图标设计.ai',
              materialType: 'design',
              materialCategory: this.getDemoText('layerDetection.materialCategories.design'),
              categoryType: 'design',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.design'),
              fileExtension: 'ai',
              width: 256,
              height: 256,
              duration: null,
              hasAlpha: true
            },
            tooltipInfo: {
              categoryType: 'design',
              categoryDisplayName: this.getDemoText('layerDetection.materialCategories.design'),
              originalPath: 'D:\\\\素材\\\\设计\\\\图标设计.ai',
              materialType: 'design',
              materialCategory: this.getDemoText('layerDetection.materialCategories.design'),
              fileSize: '8.7MB',
              fileDate: '2024-01-22 11:20:45',
              dimensions: '256x256',
              hasActionButtons: true,
              actionButtonType: 'export'
            }
          },
          {
            index: 5,
            name: this.getDemoText('layerDetection.layers.solidBackground'),
            type: 'SolidLayer',
            exportable: false,
            reason: this.getDemoText('layerDetection.reasons.solidNotSupport'),
            sourceInfo: {
              type: 'Solid',
              color: [255, 128, 0],
              width: 1920,
              height: 1080
            }
          },
          {
            index: 6,
            name: this.getDemoText('layerDetection.layers.titleText'),
            type: 'TextLayer',
            exportable: true,
            reason: this.getDemoText('layerDetection.reasons.textCanExport'),
            sourceInfo: {
              type: 'Text',
              text: '佛跳墙制作教程',
              fontSize: 48,
              fontFamily: '微软雅黑'
            }
          },
          {
            index: 7,
            name: this.getDemoText('layerDetection.layers.precompEffects'),
            type: 'PrecompLayer',
            exportable: false,
            reason: this.getDemoText('layerDetection.reasons.precompNotSupport'),
            sourceInfo: {
              type: 'Composition',
              compName: '特效合成',
              width: 1920,
              height: 1080,
              duration: '00:00:10:00'
            }
          }
        ],
        materialStats: {
          totalMaterials: 4,
          design: 2,
          image: 1,
          video: 1,
          audio: 0,
          animation: 0,
          vector: 0,
          raw: 0,
          document: 0,
          sequence: 0,
          shape: 0,
          text: 1,
          solid: 1,
          precomp: 1,
          other: 0,
          totalLayers: 7,
          exportableCount: 3,
          designFiles: 2,
          materialFiles: 2,
          pathSummary: {
            'D:\\\\素材\\\\图片\\\\背景图片.jpg': {
              path: 'D:\\\\素材\\\\图片\\\\背景图片.jpg',
              fileName: this.getDemoText('layerDetection.layers.backgroundImage'),
              categoryType: 'material',
              materialType: 'image',
              layers: [this.getDemoText('layerDetection.layers.backgroundImage')]
            },
            'D:\\\\素材\\\\设计\\\\Logo设计.psd': {
              path: 'D:\\\\素材\\\\设计\\\\Logo设计.psd',
              fileName: this.getDemoText('layerDetection.layers.logoDesign'),
              categoryType: 'design',
              materialType: 'design',
              layers: [this.getDemoText('layerDetection.layers.logoDesign')]
            },
            'D:\\\\素材\\\\视频\\\\动画视频.mp4': {
              path: 'D:\\\\素材\\\\视频\\\\动画视频.mp4',
              fileName: this.getDemoText('layerDetection.layers.animationVideo'),
              categoryType: 'material',
              materialType: 'video',
              layers: [this.getDemoText('layerDetection.layers.animationVideo')]
            },
            'D:\\\\素材\\\\设计\\\\图标设计.ai': {
              path: 'D:\\\\素材\\\\设计\\\\图标设计.ai',
              fileName: this.getDemoText('layerDetection.layers.iconDesign'),
              categoryType: 'design',
              materialType: 'design',
              layers: [this.getDemoText('layerDetection.layers.iconDesign')]
            }
          }
        },
        pathSummaryAvailable: true,
        pathSummaryReport: `=== ${this.getDemoText('layerDetection.pathSummary.designFiles')} === (2 ${this.getDemoText('layerDetection.logMessages.materialFiles')})`
      },
      ui: {
        messages: { connected: '✅ 已连接到演示环境' }
      }
    };
  }
}

// 全局初始化Demo国际化辅助类
window.DemoI18nHelper = new DemoI18nHelper();

// 初次加载时注入 demo 文案，确保 demo-apis 可用
if (window.DemoI18nHelper) {
  try {
    window.DemoI18nHelper.installIntoI18n();
  } catch (e) {
    console.warn('Initial demo i18n injection failed:', e);
  }
}

// 等待 i18n 完成翻译加载后再次注入，避免被 loadTranslations 覆盖
try {
  if (window.i18n?.ready && typeof window.i18n.ready.then === 'function') {
    window.i18n.ready.then(() => {
      try {
        window.DemoI18nHelper?.installIntoI18n();
      } catch (e) {
        console.warn('Re-inject demo i18n after i18n.ready failed:', e);
      }
    });
  }
} catch (e) {
  console.warn('Hook i18n.ready for demo injection failed:', e);
}

// 监听语言变化事件，当语言变化时更新演示模式数据
document.addEventListener('DOMContentLoaded', function() {
  // 监听语言变化事件
  const originalSwitchLanguage = window.i18n?.switchLanguage;
  if (window.i18n && originalSwitchLanguage) {
    // 保存原始的switchLanguage方法
    window.i18n.originalSwitchLanguage = originalSwitchLanguage;
    
    // 重写switchLanguage方法以支持演示模式更新（只刷新 AE/Eagle 文本，不更改连接状态）
    window.i18n.switchLanguage = function(lang) {
      // 确保语言设置被正确保存到localStorage
      try {
        localStorage.setItem('language', lang);
        localStorage.setItem('lang', lang);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
      
      // 更新演示模式数据（如果存在）
      try {
        // 语言切换时重新注入 demo 文案
        window.DemoI18nHelper?.installIntoI18n();
      } catch (e) {
        console.warn('Failed to refresh demo i18n on language switch:', e);
      }

      if (window.DemoI18nHelper && window.demoMode && window.demoMode.config) {
        // 重新加载配置以确保使用正确的语言数据
        window.demoMode.config = window.demoMode.getDefaultConfig();
        
        // 如果演示模式UI已经激活，仅刷新 AE/Eagle 文本数据，避免触发连接状态变更
        if (window.demoMode.setAEInfo && window.demoMode.setEagleInfo) {
          try {
            window.demoMode.setAEInfo();
            window.demoMode.setEagleInfo();
          } catch (e) {
            console.warn('刷新 AE/Eagle 文本失败:', e);
          }
        }

        // 语言切换后同步 DemoAPIs 的翻译引用，确保日志/标签立即生效
        try {
          if (window.demoMode.demoAPIs) {
            window.demoMode.demoAPIs.t = window.i18n?.translations || window.demoMode.demoAPIs.t;
          }
        } catch (e) {
          console.warn('刷新 DemoAPIs 文案失败:', e);
        }
      }
      
      // 调用原始方法
      const result = this.originalSwitchLanguage(lang);
      
      return result;
    };
  }
});