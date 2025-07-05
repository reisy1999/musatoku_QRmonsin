import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockAzureApiPlugin from './mock/azure/mockApiPlugin'

export default defineConfig({
  plugins: [react(), mockAzureApiPlugin()],
  server: {
    port: 5174,
  },
})
