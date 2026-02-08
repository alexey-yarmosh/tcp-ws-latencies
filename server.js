import { WebSocketServer } from 'ws';
import http from 'http';
import { execSync } from 'child_process';

function getTcpRtt(socket) {
  try {
    const out = execSync(`ss -ti state established 2>/dev/null | grep -A1 "${socket.remotePort}"`, { encoding: 'utf8' });
    const match = out.match(/rtt:(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  } catch { return null; }
}

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress;
  console.log(`HTTP ${req.method} from ${ip}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Use client.js to measure RTT diff\n\nnode client.js <host> <port>');
});

const clients = new Map();

server.on('connection', (socket) => {
  const ip = socket.remoteAddress;
  console.log(`TCP connected: ${ip}`);
  
  socket.once('data', () => {
    const rtt = getTcpRtt(socket);
    if (rtt !== null) {
      clients.set(ip, rtt);
      console.log(`TCP RTT for ${ip}: ${rtt.toFixed(3)}ms`);
    }
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`WS connected: ${ip}`);
  ws.on('message', (msg) => {
    if (msg.toString() === 'p') ws.send('p');
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
