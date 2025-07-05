// Vite plugin providing mock API routes emulating Azure Functions behavior.
// Each route explicitly mirrors an Azure Function that will exist in production.

import type { Plugin } from 'vite'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve the project root relative to this file. The plugin may be
// moved around inside the repository but the resources it uses live two
// directories above the plugin location.
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

export const mockAzureApiPlugin = (): Plugin => ({
  name: 'vite-plugin-mock-azure-api',
  async configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url) {
        return next()
      }

      // このエンドポイントは Azure Functions の GetPublicKey に対応
      if (req.method === 'GET' && req.url === '/api/public-key') {
        // Public key used by the mock API. Its location is fixed under the
        // `mock/azurevaultkey` directory in the project root.
        const keyPath = resolve(projectRoot, 'mock/azurevaultkey/public.pem')
        try {
          const publicKey = await fs.readFile(keyPath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ public_key: publicKey }))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(
            JSON.stringify({ error: 'Failed to load public key' }),
          )
        }
        return
      }

      // このエンドポイントは Azure Functions の GetTemplate に対応
      if (req.method === 'GET' && req.url.startsWith('/api/templates/')) {
        const id = req.url.split('/').pop() || ''
        const templatePath = resolve(
          projectRoot,
          'functions/src/templates',
          `template_${id}.json`,
        )
        try {
          const data = await fs.readFile(templatePath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ template: JSON.parse(data) }))
        } catch {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ error: 'Template not found' }))
        }
        return
      }

      // このエンドポイントは Azure Functions の SendLog に対応
      if (req.method === 'POST' && req.url === '/api/logs') {
        res.statusCode = 204
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end()
        return
      }

      next()
    })
  },
})

export default mockAzureApiPlugin
