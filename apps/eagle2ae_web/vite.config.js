import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
