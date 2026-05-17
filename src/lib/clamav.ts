import { Socket, createConnection } from 'net'

export type ClamavMode = 'disabled' | 'tcp' | 'unix'

export interface ClamavConfig {
  mode: ClamavMode
  host?: string
  port?: number
  socket?: string
  timeoutMs: number
  maxBytes: number
}

function boolFromEnv(value: string | undefined, defaultValue = false): boolean {
  if (value == null) return defaultValue
  const v = String(value).trim().toLowerCase()
  if ([1,true,yes,on,enabled].includes(v)) return true
  if ([0,false,no,off,disabled].includes(v)) return false
  return defaultValue
}

function intFromEnv(value: string | undefined, def: number): number {
  if (!value) return def
  const n = Number.parseInt(String(value).trim(), 10)
  return Number.isFinite(n) && n > 0 ? n : def
}

export function getClamavConfigFromEnv(): ClamavConfig {
  const enabled = boolFromEnv(process.env.CLAMAV_ENABLED, false)
  const socket = (process.env.CLAMAV_SOCKET || '').trim() || undefined
  const host = (process.env.CLAMAV_HOST || '').trim() || '127.0.0.1'
  const port = intFromEnv(process.env.CLAMAV_PORT, 3310)
  const timeoutMs = intFromEnv(process.env.CLAMAV_TIMEOUT_MS, 3000)
  const maxBytes = intFromEnv(process.env.CLAMAV_MAX_BYTES, 5 * 1024 * 1024)

  if (!enabled) {
    return { mode: 'disabled', timeoutMs, maxBytes }
  }
  if (socket) {
    return { mode: 'unix', socket, timeoutMs, maxBytes }
  }
  return { mode: 'tcp', host, port, timeoutMs, maxBytes }
}

export function isEnabled(cfg: ClamavConfig): boolean {
  return cfg.mode !== 'disabled'
}

function connect(cfg: ClamavConfig): Promise<Socket> {
  return new Promise((resolve, reject) => {
    let sock: Socket
    const to: any = setTimeout(() => {
      try { sock && sock.destroy(new Error('ClamAV connect timeout')) } catch {}
      reject(new Error('ClamAV connect timeout'))
    }, cfg.timeoutMs as any)

    const onError = (err: any) => {
      clearTimeout(to)
      reject(err instanceof Error ? err : new Error(String(err)))
    }

    if (cfg.mode === 'unix' && cfg.socket) {
      sock = createConnection(cfg.socket)
    } else if (cfg.mode === 'tcp' && cfg.host && cfg.port) {
      sock = createConnection({ host: cfg.host, port: cfg.port })
    } else {
      clearTimeout(to)
      return reject(new Error('Invalid ClamAV configuration'))
    }

    sock.setNoDelay(true)
    sock.once('error', onError)
    sock.once('connect', () => {
      clearTimeout(to)
      sock.removeListener('error', onError)
      resolve(sock)
    })
  })
}

export async function pingClamAV(cfg: ClamavConfig): Promise<boolean> {
  if (!isEnabled(cfg)) return false
  const sock = await connect(cfg)
  try {
    const result = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      const timer: any = setTimeout(() => {
        try { sock.destroy(new Error('ClamAV PING timeout')) } catch {}
        reject(new Error('ClamAV PING timeout'))
      }, cfg.timeoutMs as any)

      sock.once('error', reject)
      sock.on('data', (d) => chunks.push(Buffer.from(d)))
      sock.once('end', () => {
        clearTimeout(timer)
        resolve(Buffer.concat(chunks).toString('utf8'))
      })

      sock.write('PING\n')
      setTimeout(() => { try { sock.end() } catch {} }, 10)
    })
    return /PONG/.test(result)
  } finally {
    try { sock.destroy() } catch {}
  }
}

export interface ClamScanResult {
  status: 'OK' | 'FOUND' | 'ERROR'
  malware?: string
  raw: string
}

export async function scanBuffer(cfg: ClamavConfig, data: Buffer): Promise<ClamScanResult> {
  if (!isEnabled(cfg)) {
    return { status: 'ERROR', raw: 'ClamAV disabled by configuration' }
  }
  if (data.length > cfg.maxBytes) {
    return { status: 'ERROR', raw: 'Payload too large: ' + String(data.length) + ' > ' + String(cfg.maxBytes) }
  }
  const sock = await connect(cfg)
  try {
    const responsePromise = new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      const timer: any = setTimeout(() => {
        try { sock.destroy(new Error('INSTREAM timeout')) } catch {}
        reject(new Error('ClamAV INSTREAM timeout'))
      }, Math.max(cfg.timeoutMs, 2000) as any)

      sock.once('error', reject)
      sock.on('data', (d) => chunks.push(Buffer.from(d)))
      sock.once('end', () => {
        clearTimeout(timer)
        resolve(Buffer.concat(chunks).toString('utf8'))
      })
    })

    sock.write('INSTREAM\n')

    const chunkSize = 64 * 1024
    let offset = 0
    while (offset < data.length) {
      const size = Math.min(chunkSize, data.length - offset)
      const header = Buffer.alloc(4)
      header.writeUInt32BE(size, 0)
      const slice = data.subarray(offset, offset + size)
      const ok1 = sock.write(header)
      const ok2 = sock.write(slice)
      if (!ok1 || !ok2) {
        await new Promise((r) => sock.once('drain', r as any))
      }
      offset += size
    }
    const endHeader = Buffer.alloc(4)
    endHeader.writeUInt32BE(0, 0)
    sock.end(endHeader)

    const raw = await responsePromise
    const text = raw.trim()
    if (/\bOK\b/i.test(text) && !/\bFOUND\b/i.test(text)) {
      return { status: 'OK', raw: text }
    }
    const foundMatch = text.match(/\b([^\s:]+)\s+FOUND\b/i)
    if (foundMatch) {
      return { status: 'FOUND', malware: foundMatch[1], raw: text }
    }
    return { status: 'ERROR', raw: text }
  } finally {
    try { sock.destroy() } catch {}
  }
}

export async function scanBase64(cfg: ClamavConfig, b64: string): Promise<ClamScanResult> {
  const bytes = Buffer.from(b64, 'base64')
  return scanBuffer(cfg, bytes)
}
