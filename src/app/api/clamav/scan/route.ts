import * as net from 'node:net';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function connect(host: string, port: number, timeoutMs: number): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const cleanup = () => { socket.setTimeout(0); };
    const onErr = (e: Error) => { cleanup(); reject(e); };
    const onTo = () => { cleanup(); reject(new Error('clamd socket timeout')); };
    socket.once('error', onErr);
    socket.setTimeout(timeoutMs, onTo);
    socket.once('connect', () => { cleanup(); resolve(socket); });
  });
}

async function scanBuffer(buf: Buffer, host: string, port: number, timeoutMs: number, chunkSize: number = 8192): Promise<string> {
  const socket = await connect(host, port, timeoutMs);
  return new Promise((resolve, reject) => {
    let response = '';
    const onData = (d: Buffer) => { response += d.toString('utf8'); };
    const onErr = (e: Error) => { socket.destroy(); reject(e); };
    const onClose = () => { resolve(response.trim()); };
    socket.on('data', onData);
    socket.once('error', onErr);
    socket.once('close', onClose);
    socket.write('zINSTREAM\n');
    const writeChunk = (chunk: Buffer) => new Promise<void>((res, rej) => {
      const len = Buffer.alloc(4); len.writeUInt32BE(chunk.length, 0);
      socket.write(len, (e) => { if (e) return rej(e); socket.write(chunk, (e2) => e2 ? rej(e2) : res()); });
    });
    (async () => {
      try {
        for (let i = 0; i < buf.length; i += chunkSize) {
          const slice = buf.subarray(i, Math.min(i + chunkSize, buf.length));
          await writeChunk(slice);
        }
        const zero = Buffer.alloc(4); zero.writeUInt32BE(0, 0); socket.write(zero); socket.end();
      } catch (e) { socket.destroy(); reject(e as Error); }
    })();
  });
}

export async function POST(req: Request) {
  let data: any = {};
  try { data = await req.json(); } catch {}
  const content = (data?.content || '').toString();
  if (!content) return NextResponse.json({ error: 'missing content' }, { status: 400 });
  const host = (process.env.CLAMAV_HOST || '127.0.0.1').trim();
  const port = Number(process.env.CLAMAV_PORT || '3310');
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || '1500');
  const raw = await scanBuffer(Buffer.from(content, 'utf8'), host, port, timeoutMs);
  const m = raw.match(/:\s*(.+?)\s+(FOUND|OK|ERROR)$/i);
  if (!m) return NextResponse.json({ verdict: 'ERROR', raw });
  const middle = m[1]; const tail = m[2].toUpperCase();
  if (tail === 'OK') return NextResponse.json({ verdict: 'OK', raw });
  if (tail === 'FOUND') return NextResponse.json({ verdict: 'FOUND', signature: middle, raw });
  return NextResponse.json({ verdict: 'ERROR', raw });
}

