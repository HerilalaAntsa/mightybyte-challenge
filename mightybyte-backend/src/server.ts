import express from 'express';
import { WebSocketServer } from 'ws';
import { saveUrl, getUrl } from './urlStore';
import { registerClient, sendWithAck } from './wsManager';

const app = express();
app.use(express.json());
const PORT = 3000;

// Generate 5 chars code
function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /url
app.post('/url', async (req, res) => {
  const { url, clientId } = req.body;
  if (!url || !clientId) return res.status(400).send('Missing url or clientId');

  const code = generateCode();
  await saveUrl(code, url);

  // We don t send the shortened URL via HTTP
  res.status(202).send('Accepted');

  // But via WS WS
  sendWithAck(clientId, { shortenedURL: `http://localhost:${PORT}/${code}`, code });
});

// GET /:code
app.get('/:code', async (req, res) => {
  const url = await getUrl(req.params.code);
  if (!url) return res.status(404).send('Not found');
  res.json({ url });
});

// WS Server
const wss = new WebSocketServer({ port: 3001 });
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'register') registerClient(data.clientId, ws);
    if (data.type === 'ack') console.log(`Ack received for code ${data.code}`);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
console.log('WebSocket server on ws://localhost:3001');
