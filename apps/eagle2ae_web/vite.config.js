import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      filename: './stats.html', // 分析文件输出路径
      open: true, // 构建后自动打开分析报告
      gzipSize: true, // 显示 Gzip 压缩后的大小
      brotliSize: true, // 显示 Brotli 压缩后的大小
    }),
    // PWA: 预缓存核心 JSON 与静态资源，提高离线与回访命中率
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { 
        enabled: true,
        suppressWarnings: true, // 在开发环境中抑制 Workbox 警告
        type: 'module'
      },
      workbox: {
        // 预缓存构建产物以及 public 目录中常见静态资源与 JSON
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        // 避免导航回退将 /extensions/ae/* 误回退到主应用 index.html
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/extensions\/ae\//],
        // 配置静默模式以减少控制台警告
        skipWaiting: true,
        clientsClaim: true,
        // 过滤掉不希望预缓存的开发时资源
        globIgnores: ['**/node_modules/**/*', '**/.*', '**/config/presets/**/*', '**/vite/**', '**/@vite/**', '**/@id/**', '**/?t=**', '**/?v=**'],
        // 跳过 Vite 开发服务器的特殊文件路径
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.+$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 小时
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^http:\/\/localhost:.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dev-server',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 分钟
              },
            },
          },
        ],
        // 过滤掉可能导致警告的文件
        ignoreURLParametersMatching: [/^t$/, /^v$/], // 忽略时间戳和版本参数
      },
    }),
    // 开发期内置一个极简文件写入 API，用于 Demo 模式将预设写回到 public/config/presets
    {
      name: 'preset-writer-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          try {
            if (req.url && req.url.startsWith('/api/presets') && req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => (body += chunk))
              await new Promise((resolve) => req.on('end', resolve))

              let payload
              try {
                payload = JSON.parse(body || '{}')
              } catch (e) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }))
                return
              }

              const fileName = String(payload.fileName || '')
              const content = String(payload.jsonData ?? payload.content ?? '')

              const allowed = ['Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 'Eagle2Ae3.Presets']
              if (!allowed.includes(fileName)) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Invalid fileName' }))
                return
              }

              const dst = path.join(server.config.root, 'public', 'config', 'presets', fileName)
              try {
                await fs.promises.mkdir(path.dirname(dst), { recursive: true })
                await fs.promises.writeFile(dst, content, 'utf-8')
              } catch (e) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: e.message }))
                return
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, path: dst }))
              return
            }
          } catch (e) {
            // 兜底：任何中间件内部错误，交给下一个处理
          }
          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist'),
    emptyOutDir: true,
  },
})
