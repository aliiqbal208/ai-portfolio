/**
 * Minimal ClamAV (clamd) client using Node's net sockets.
 * - Supports PING and INSTREAM scan per clamd protocol
 * - Adds timeouts and safe parsing
 *
 * No external deps. Configure via env:
 * - CLAMD_HOST (default 127.0.0.1)
 * - CLAMD_PORT (default 3310)
 * - CLAMD_TIMEOUT_MS (default 4000)
 */
import net from 'node:net'

export type ClamScanResult = {
  ok: boolean
  infected: boolean
  signature?: string
  raw: string
}

function envInt(name: string, fallback: number): number {
  const v = process.env[name]
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function getConfig() {
  return {
    host: process.env.CLAMD_HOST || '127.0.0.1',
    port: envInt('CLAMD_PORT', 3310),
    timeoutMs: envInt('CLAMD_TIMEOUT_MS', 4000),
  }
}

export async function clamdPing(): Promise<{ ok: boolean; raw: string }>{
  const cfg = getConfig()
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let buffer = ''
    const onDone = (ok: boolean) => {
      try { socket.destroy() } catch {}
      resolve({ ok, raw: buffer })
    }
    socket.setTimeout(cfg.timeoutMs, () => onDone(false))
    socket.on('error', () => onDone(false))
    socket.connect(cfg.port, cfg.host, () => {
      socket.write('PING
')
    })
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      if (buffer.includes('PONG')) onDone(true)
    })
    socket.on('end', () => onDone(buffer.includes('PONG')))
  })
}

/**
 * Stream bytes to clamd via INSTREAM. Data is split into safe chunks.
 */
export async function clamdScan(buffer: Buffer): Promise<ClamScanResult> {
  const cfg = getConfig()
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let response = ''
    const finish = (ok: boolean) => {
      try { socket.destroy() } catch {}
      const infected = /FOUND/i.test(response)
      const sigMatch = response.match(/:\s*([^\s]+)\s+FOUND/i)
      resolve({ ok, infected, signature: sigMatch?.[1], raw: response.trim() })
    }

    socket.setTimeout(cfg.timeoutMs, () => finish(false))
    socket.on('error', () => finish(false))

    socket.connect(cfg.port, cfg.host, () => {
      socket.write('INSTREAM
')
      // Send in 8KiB chunks with big-endian size prefix as per protocol
      const CHUNK = 8192
      for (let i = 0; i < buffer.length; i += CHUNK) {
        const slice = buffer.subarray(i, Math.min(i + CHUNK, buffer.length))
        const lenBuf = Buffer.allocUnsafe(4)
        lenBuf.writeUInt32BE(slice.length, 0)
        socket.write(lenBuf)
        socket.write(slice)
      }
      // zero-length chunk terminates stream
      const zero = Buffer.alloc(4)
      socket.write(zero)
    })

    socket.on('data', (chunk) => {
      response += chunk.toString('utf8')
      // clamd typically responds with 'stream: OK' or 'stream: <sig> FOUND'

      if (/OK/i.test(response) || /FOUND/i.test(response)) {
        const ok = /OK/i.test(response)
        finish(ok)
      }
    })

    socket.on('end', () => {
      const ok = /OK/i.test(response)
      finish(ok)
    })
  })
}
