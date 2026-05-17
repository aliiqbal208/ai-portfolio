// Minimal ClamAV scan helper with safe fallbacks.
// - Prefers clamd via TCP if configured
// - Falls back to local  if available
// - Supports a non-production mock mode for tests via options.mockResult

import { spawn } from 'node:child_process'
import net from 'node:net'

export type ScanResult = { status: 'clean' | 'infected'; signature?: string }

export type ScanOptions = {
  sizeLimitBytes?: number
  timeoutMs?: number
  // Used only in non-production to force a specific result (for tests)
  mockResult?: 'clean' | 'infected'
  clamdHost?: string
  clamdPort?: number
}

const DEFAULTS = { sizeLimitBytes: 5 * 1024 * 1024, timeoutMs: 15_000 }

export async function scanBuffer(buf: Buffer, opts: ScanOptions = {}): Promise<ScanResult> {
  const sizeLimit = opts.sizeLimitBytes ?? DEFAULTS.sizeLimitBytes
  const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs

  if (!buf || buf.length === 0) throw new Error('Empty payload')
  if (buf.length > sizeLimit) throw new Error('Payload too large')

  // Mock path is allowed only outside production
  if (process.env.NODE_ENV !== 'production' && opts.mockResult) {
    return { status: opts.mockResult }
  }

  // Try clamd first if configured
  const host = opts.clamdHost || process.env.CLAMD_HOST
  const port = Number(opts.clamdPort || process.env.CLAMD_PORT || 3310)
  if (host) {
    const res = await scanViaClamd(buf, { host, port, timeoutMs })
    if (res) return res
  }

  // Try local clamscan as a fallback
  const res = await scanViaClamscan(buf, { timeoutMs })
  if (res) return res

  // Scanning unavailable
  throw Object.assign(new Error('Scanning unavailable'), { code: 'UNAVAILABLE' })
}

async function scanViaClamd(buf: Buffer, { host, port, timeoutMs }: { host: string; port: number; timeoutMs: number }): Promise<ScanResult | null> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled = false
    const done = (val: ScanResult | null) => { if (!settled) { settled = true; try { socket.destroy() } catch {}; resolve(val) } }

    const timer = setTimeout(() => done(null), timeoutMs)
    socket.once('error', () => { clearTimeout(timer); done(null) })
    socket.connect(port, host, () => {
      socket.write('zINSTREAM
')
      // Send size-prefixed chunk, then zero-size to end
      const len = Buffer.alloc(4)
      len.writeUInt32BE(buf.length, 0)
      socket.write(len)
      socket.write(buf)
      const zero = Buffer.alloc(4)
      zero.writeUInt32BE(0, 0)
      socket.write(zero)
    })

    let data = ''
    socket.on('data', (chunk) => { data += chunk.toString('utf8') })
    socket.on('end', () => {
      clearTimeout(timer)
      // Typical: stream: OK or stream: Eicar-Test-Signature FOUND
      const m = /(.*?):\s+(OK|FOUND)(?:\s+(.*))?/i.exec(data)
      if (!m) return done(null)
      const status = m[2].toUpperCase() === 'OK' ? 'clean' : 'infected'
      const signature = status === 'infected' ? (m[3] || 'UNKNOWN') : undefined
      done({ status, signature })
    })
  })
}

async function scanViaClamscan(buf: Buffer, { timeoutMs }: { timeoutMs: number }): Promise<ScanResult | null> {
  return new Promise((resolve) => {
    let settled = false
    const done = (val: ScanResult | null) => { if (!settled) { settled = true; resolve(val) } }

    let ps
    try {
      ps = spawn('clamscan', ['--no-summary', '-'])
    } catch {
      return resolve(null)
    }

    const timer = setTimeout(() => { try { ps.kill('SIGKILL') } catch {}; done(null) }, timeoutMs)

    ps.stdin.write(buf)
    ps.stdin.end()

    let out = ''
    ps.stdout.on('data', (d) => { out += d.toString('utf8') })
    ps.on('error', () => { clearTimeout(timer); done(null) })
    ps.on('close', () => {
      clearTimeout(timer)
      // Typical: stdin: OK or stdin: Eicar-Test-Signature FOUND
      const m = /(.*?):\s+(OK|FOUND)(?:\s+(.*))?/i.exec(out)
      if (!m) return done(null)
      const status = m[2].toUpperCase() === 'OK' ? 'clean' : 'infected'
      const signature = status === 'infected' ? (m[3] || 'UNKNOWN') : undefined
      done({ status, signature })
    })
  })
}
