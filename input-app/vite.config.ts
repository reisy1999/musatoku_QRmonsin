import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
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
