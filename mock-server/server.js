
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const app = express();

app.use(cors());

// Public Key API
// 本番環境では、このAPIはAzure Functionsとして実装され、
// Azure Key Vaultから公開鍵を取得して返すことを想定しています。
// このモックサーバーでは、ローカルの.pemファイルを「仮想的なKey Vault」として扱います。
app.get('/api/public-key', async (req, res) => {
  const keyPath = resolve(projectRoot, 'mock/azurevaultkey/public.pem');
  try {
    const publicKey = await fs.readFile(keyPath, 'utf-8');
    res.json({ public_key: publicKey });
  } catch (e) {
    console.error('Failed to load public key:', e);
    res.status(500).json({ error: 'Failed to load public key' });
  }
});

// Template API
app.get('/api/templates/:id', async (req, res) => {
    const { id } = req.params;
    const templatePath = resolve(projectRoot, 'functions/src/templates', `template_${id}.json`);
    try {
        const data = await fs.readFile(templatePath, 'utf-8');
        res.json({ template: JSON.parse(data) });
    } catch (e) {
        console.error(`Template ${id} not found:`, e);
        res.status(404).json({ error: 'Template not found' });
    }
});

// Logs API
app.post('/api/logs', express.json(), (req, res) => {
  console.log('Received log:', req.body);
  res.status(204).send();
});

const PORT = 7071; // Azure Functionsのデフォルトポート
app.listen(PORT, () => {
  console.log(`[Mock API Server] Running at http://localhost:${PORT}`);
});
