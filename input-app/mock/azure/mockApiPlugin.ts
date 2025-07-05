// Vite plugin providing mock API routes emulating Azure Functions behavior.
// Each route explicitly mirrors an Azure Function that will exist in production.

import type { Plugin } from 'vite'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const mockAzureApiPlugin = (): Plugin => ({
  name: 'vite-plugin-mock-azure-api',
  async configureServer(server) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (!req.url) {
        return next()
      }

      // このエンドポイントは Azure Functions の GetPublicKey に対応
      if (req.method === 'GET' && req.url === '/api/public-key') {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(
          JSON.stringify({
            public_key:
              '-----BEGIN PUBLIC KEY-----\nFAKEKEY123...\n-----END PUBLIC KEY-----',
          }),
        )
        return
      }

      // このエンドポイントは Azure Functions の GetTemplate に対応
      if (req.method === 'GET' && req.url.startsWith('/api/templates/')) {
        const id = req.url.split('/').pop() || ''
        const templatePath = path.resolve(
          __dirname,
          `../../../functions/src/templates/template_${id}.json`,
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
        console.log('[mock] /api/logs called')
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
