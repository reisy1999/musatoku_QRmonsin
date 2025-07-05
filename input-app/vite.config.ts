import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('[Vite Config] Loading vite.config.ts')

const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    console.log('[Vite Config] configureServer hook called.')
    server.middlewares.use((req, res, next) => {
      console.log('[Mock API] Hit: ' + req.url)
      if (req.url?.startsWith('/api/templates/')) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ template: { id: 1, name: 'Sample' } }))
        return
      }
      next()
    })
  },
})

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    port: 5174,
  },
})
