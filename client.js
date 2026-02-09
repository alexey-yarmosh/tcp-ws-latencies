import net from 'net';
import WebSocket from 'ws';

const HOST = process.argv[2] || '130.61.179.106';
const PORT = parseInt(process.argv[3]) || 80;
const ITERATIONS = 5;

async function measureTcpRtt() {
  const latencies = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    await new Promise((resolve, reject) => {
      const socket = net.connect(PORT, HOST, () => {
        latencies.push(Number(process.hrtime.bigint() - start) / 1e6);
        socket.destroy();
        resolve();
      });
      socket.on('error', reject);
    });
    await new Promise(r => setTimeout(r, 50));
  }
  latencies.sort((a, b) => a - b);
  return latencies.slice(1, -1).reduce((a, b) => a + b) / (ITERATIONS - 2);
}

async function measureWsRtt() {
  const ws = new WebSocket(`ws://${HOST}:${PORT}`);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  const latencies = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    ws.send('p');
    await new Promise(resolve => {
      ws.once('message', () => {
        latencies.push(Number(process.hrtime.bigint() - start) / 1e6);
        resolve();
      });
    });
    await new Promise(r => setTimeout(r, 50));
  }
  ws.close();
  latencies.sort((a, b) => a - b);
  return latencies.slice(1, -1).reduce((a, b) => a + b) / (ITERATIONS - 2);
}

async function main() {
  console.log(`Testing ${HOST}:${PORT}\n`);

  const tcpRtt = await measureTcpRtt();
  const wsRtt = await measureWsRtt();
  const diff = wsRtt - tcpRtt;
  const isVpn = diff > 30;

  console.log(`Client TCP RTT: ${tcpRtt.toFixed(2)}ms`);
  console.log(`WS RTT:         ${wsRtt.toFixed(2)}ms`);
  console.log(`Diff:           ${diff.toFixed(2)}ms`);
  console.log(`VPN:            ${isVpn ? 'YES' : 'NO'}`);
}

main().catch(console.error);
