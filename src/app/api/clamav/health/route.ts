import * as net from 'node:net';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function send(host: string, port: number, cmd: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let buf = '';
    let settled = false;
    const finish = (text: string) => {
      if (!settled) {
        settled = true;
        try { socket.end(); } catch {}
        resolve(text);
      }
    };
    socket.setTimeout(timeoutMs, () => finish('timeout'));
    socket.on('data', (d) => { buf += d.toString('utf8'); });
    socket.on('error', (e) => finish('error: ' + String((e as any)?.message || e)));
    socket.on('close', () => finish(buf || 'closed'));
    socket.write(cmd + '\n');
  });
}

export async function GET() {
  const host = (process.env.CLAMAV_HOST || '127.0.0.1').trim();
  const port = Number(process.env.CLAMAV_PORT || '3310');
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || '1500');
  const pong = (await send(host, port, 'PING', timeoutMs)).trim();
  const ver = (await send(host, port, 'VERSION', timeoutMs)).trim();
  const available = pong.includes('PONG');
  return NextResponse.json({ available, version: ver });
}

