import { Socket } from 'net';

export type ClamScanStatus = 'OK' | 'FOUND' | 'ERROR';
export interface ClamScanResult {
  status: ClamScanStatus;
  signature?: string;
  raw?: string;
}

export interface ClamAVOptions {
  host?: string;
  port?: number;
  timeoutMs?: number;
  maxChunkBytes?: number;
}

function resolveOpts(opts?: ClamAVOptions) {
  return {
    host: opts?.host || process.env.CLAMAV_HOST || '127.0.0.1',
    port: Number(opts?.port || process.env.CLAMAV_PORT || 3310),
    timeoutMs: Number(opts?.timeoutMs || process.env.CLAMAV_TIMEOUT_MS || 10000),
    maxChunkBytes: Number(opts?.maxChunkBytes || 64 * 1024),
  } as Required<ClamAVOptions>;
}

export async function pingClamAV(opts?: ClamAVOptions): Promise<boolean> {
  const { host, port, timeoutMs } = resolveOpts(opts);
  return new Promise<boolean>((resolve) => {
    const socket = new Socket();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return; done = true;
      try { socket.destroy(); } catch {}
      resolve(ok);
    };
    socket.setNoDelay(true);
    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once('error', () => finish(false));
    socket.once('data', (buf) => {
      const s = buf.toString('utf-8').trim();
      finish(s === 'PONG');
    });
    socket.connect(port, host, () => {
      socket.write('PING
');
    });
  });
}

export async function scanBuffer(buffer: Buffer, opts?: ClamAVOptions): Promise<ClamScanResult> {
  const { host, port, timeoutMs, maxChunkBytes } = resolveOpts(opts);
  return new Promise<ClamScanResult>((resolve) => {
    const socket = new Socket();
    let done = false;
    let response = Buffer.alloc(0);
    const finish = (res: ClamScanResult) => {
      if (done) return; done = true;
      try { socket.destroy(); } catch {}
      resolve(res);
    };

    socket.setNoDelay(true);
    socket.setTimeout(timeoutMs, () => finish({ status: 'ERROR', raw: 'timeout' }));
    socket.on('error', (err) => finish({ status: 'ERROR', raw: String((err as any)?.message || err) }));
    socket.on('data', (chunk) => { response = Buffer.concat([response, chunk]); });
    socket.on('end', () => {
      const text = response.toString('utf-8').trim();
      if (/OK$/.test(text)) {
        finish({ status: 'OK', raw: text });
      } else if (/FOUND$/.test(text)) {
        const m = text.match(/stream: (.*) FOUND/i);
        finish({ status: 'FOUND', signature: (m && m[1]) || 'UNKNOWN', raw: text });
      } else {
        finish({ status: 'ERROR', raw: text || 'unknown response' });
      }
    });

    socket.connect(port, host, () => {
      socket.write('INSTREAM
');
      let offset = 0;
      while (offset < buffer.length) {
        const chunkSize = Math.min(maxChunkBytes, buffer.length - offset);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunkSize, 0);
        socket.write(len);
        socket.write(buffer.subarray(offset, offset + chunkSize));
        offset += chunkSize;
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
      socket.end();
    });
  });
}
