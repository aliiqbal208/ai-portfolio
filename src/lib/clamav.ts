/* Minimal ClamAV scanning helper with graceful fallbacks.
   - Prefers clamd via TCP or UNIX socket when configured via env.
   - Falls back to clamscan binary if available.
   - If neither is available, returns mode 'disabled' and treats input as clean.
   Server-only utility: do not import in client components. */

import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import net from 'node:net'

export type ScanMode = 'clamd' | 'clamscan' | 'disabled'
export type ScanStatus = 'clean' | 'infected' | 'error'

export interface ScanResult {
  status: ScanStatus
  signature?: string
  raw?: string
}

export interface ScanOutcome {
  ok: boolean
  mode: ScanMode
  scan: ScanResult
  reason?: string
}

export interface ScanOptions {
  timeoutMs?: number
  chunkSize?: number
}

const DEFAULT_TIMEOUT = 5000
const DEFAULT_CHUNK = 64 * 1024

function getenv(name: string): string | undefined {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : undefined
}

function parseClamResponse(text: string): ScanResult {
  const line = (text || '').split(/?
/).find(Boolean) || ''
  if (/OK/i.test(line)) return { status: 'clean', raw: line }
  const m = line.match(/:\s*(.+?)\s+FOUND/i)
  if (m) return { status: 'infected', signature: m[1], raw: line }
  return { status: 'error', raw: text }
}

async function scanWithClamd(buf: Buffer, opts: ScanOptions): Promise<ScanOutcome> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT
  const chunkSize = Math.max(1024, Math.min(opts.chunkSize ?? DEFAULT_CHUNK, 4 * 1024 * 1024))
  const sockPath = getenv('CLAMD_SOCKET')
  const host = getenv('CLAMD_HOST')
  const portRaw = getenv('CLAMD_PORT')
  const port = portRaw ? parseInt(portRaw, 10) : undefined

  if (!sockPath && !(host && port)) {
    throw new Error('clamd not configured')
  }

  return await new Promise<ScanOutcome>((resolve) => {
    const socket = new net.Socket()
    let timer: NodeJS.Timeout | undefined
    let response = ''
    const finish = () => { if (timer) clearTimeout(timer); try { socket.destroy() } catch {} }
    const done = (outcome: ScanOutcome) => { finish(); resolve(outcome) }

    socket.on('data', (d) => { response += d.toString('utf8') })
    socket.on('error', (err) => done({ ok: false, mode: 'clamd', scan: { status: 'error', raw: String(err) }, reason: 'clamd_error' }))
    socket.on('timeout', () => done({ ok: false, mode: 'clamd', scan: { status: 'error', raw: 'timeout' }, reason: 'timeout' }))
    socket.on('close', () => {
      const parsed = parseClamResponse(response)
      done({ ok: parsed.status !== 'error', mode: 'clamd', scan: parsed })
    })

    timer = setTimeout(() => socket.emit('timeout'), timeoutMs)

    try {
      if (sockPath) socket.connect(sockPath)
      else socket.connect({ host: host as string, port: port as number })
    } catch (err) {
      done({ ok: false, mode: 'clamd', scan: { status: 'error', raw: String(err) }, reason: 'clamd_connect_failed' })
      return
    }

    socket.once('connect', () => {
      try {
        socket.write('zINSTREAM
')
        for (let offset = 0; offset < buf.length; offset += chunkSize) {
          const len = Math.min(chunkSize, buf.length - offset)
          const header = Buffer.allocUnsafe(4)
          header.writeUInt32BE(len, 0)
          socket.write(header)
          socket.write(buf.subarray(offset, offset + len))
        }
        const zero = Buffer.alloc(4)
        socket.write(zero)
        setTimeout(() => socket.end(), 10)
      } catch (err) {
        done({ ok: false, mode: 'clamd', scan: { status: 'error', raw: String(err) }, reason: 'clamd_stream_failed' })
      }
    })
  })
}

async function scanWithClamscan(buf: Buffer, opts: ScanOptions): Promise<ScanOutcome> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT
  return await new Promise<ScanOutcome>((resolve) => {
    let proc: ChildProcessWithoutNullStreams
    try {
      proc = spawn('clamscan', ['-', '-n', '--no-summary', '--stdout'], { stdio: ['pipe', 'pipe', 'pipe'] })
    } catch (err) {
      resolve({ ok: false, mode: 'clamscan', scan: { status: 'error', raw: String(err) }, reason: 'clamscan_spawn_failed' })
      return
    }

    let out = ''
    let errOut = ''
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL') } catch {}
      resolve({ ok: false, mode: 'clamscan', scan: { status: 'error', raw: 'timeout' }, reason: 'timeout' })
    }, timeoutMs)

    proc.stdout.on('data', (d) => { out += d.toString('utf8') })
    proc.stderr.on('data', (d) => { errOut += d.toString('utf8') })
    proc.on('error', (err) => {
      clearTimeout(timer)
      resolve({ ok: false, mode: 'clamscan', scan: { status: 'error', raw: String(err) }, reason: 'clamscan_error' })
    })
    proc.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) {
        resolve({ ok: true, mode: 'clamscan', scan: { status: 'clean', raw: out || errOut } })
      } else if (code === 1) {
        const parsed = parseClamResponse(out || errOut)
        resolve({ ok: true, mode: 'clamscan', scan: parsed })
      } else {
        resolve({ ok: false, mode: 'clamscan', scan: { status: 'error', raw: out || errOut }, reason: 'clamscan_failed' })
      }
    })
    proc.stdin.end(buf)
  })
}

export async function scanBuffer(buf: Buffer, options: ScanOptions = {}): Promise<ScanOutcome> {
  const hasClamd = Boolean(getenv('CLAMD_SOCKET') || (getenv('CLAMD_HOST') && getenv('CLAMD_PORT')))
  if (hasClamd) {
    try { return await scanWithClamd(buf, options) } catch {}
  }
  try {
    const out = await scanWithClamscan(buf, options)
    if (out.ok || out.scan.status !== 'error') return out
  } catch {}
  return { ok: true, mode: 'disabled', scan: { status: 'clean' }, reason: 'clamav_not_available' }
}
