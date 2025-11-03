import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // PWA: 预缓存核心 JSON 与静态资源，提高离线与回访命中率
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        // 预缓存构建产物以及 public 目录中常见静态资源与 JSON
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        // 避免导航回退将 /extensions/ae/* 误回退到主应用 index.html
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/extensions\/ae\//],
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
})
