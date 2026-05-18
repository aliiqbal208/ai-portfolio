// Minimal ClamAV utility with safe fallbacks and timeouts.
// - Prefers clamd via TCP/UNIX socket when available
// - Falls back to  binary detection
// - Exposes lightweight health detection used by the API route

import { spawn } from 'node:child_process'
import * as net from 'node:net'

export type ClamEngine = 'clamd' | 'clamscan' | 'none'

export interface ClamHealth {
  engine: ClamEngine
  status: 'ok' | 'unavailable'
  details?: string
}

const CLAMD_TCP_HOST = process.env.CLAMAV_HOST || '127.0.0.1'
const CLAMD_TCP_PORT = Number(process.env.CLAMAV_PORT || 3310)
const CLAMD_UNIX_SOCKET = process.env.CLAMAV_UNIX_SOCKET || ''

function withTimeout<T>(p: Promise<T>, ms: number, label = 'timeout'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms)
    p.then(v => { clearTimeout(t); resolve(v) }, e => { clearTimeout(t); reject(e) })
  })
}

type ConnOpts = { path: string } | { host: string; port: number }

function pingOnce(opts: ConnOpts): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let resolved = false
    const timer = setTimeout(() => done(false), 800)

    const sock = 'path' in opts ? net.createConnection(opts.path) : net.createConnection(opts)

    function done(ok: boolean) {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      try { sock.destroy() } catch {}
      resolve(ok)
    }

    let buf = ''
    sock.once('error', () => done(false))
    sock.once('connect', () => {
      try { sock.write('PING\n') } catch { done(false) }
    })
    sock.on('data', (d) => {
      buf += String(d)
      if (buf.includes('PONG')) done(true)
    })
    sock.on('end', () => done(buf.includes('PONG')))
  })
}

async function pingClamd(): Promise<boolean> {
  if (CLAMD_UNIX_SOCKET) {
    try { if (await withTimeout(pingOnce({ path: CLAMD_UNIX_SOCKET }), 900, 'clamd unix timeout')) return true } catch {}
  }
  try { if (await withTimeout(pingOnce({ host: CLAMD_TCP_HOST, port: CLAMD_TCP_PORT }), 900, 'clamd tcp timeout')) return true } catch {}
  return false
}

async function detectClamscan(): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const proc = spawn('clamscan', ['--version'], { stdio: ['ignore', 'ignore', 'ignore'] })
    let done = false
    const killTimer = setTimeout(() => {
      if (!done) {
        done = true
        try { proc.kill('SIGKILL') } catch {}
        resolve(false)
      }
    }, 800)
    proc.on('error', () => { if (!done) { done = true; clearTimeout(killTimer); resolve(false) } })
    proc.on('exit', (code) => { if (!done) { done = true; clearTimeout(killTimer); resolve(code === 0) } })
  })
}

export async function detectClamEngine(): Promise<ClamEngine> {
  if (await pingClamd()) return 'clamd'
  if (await detectClamscan()) return 'clamscan'
  return 'none'
}

export async function health(): Promise<ClamHealth> {
  const engine = await detectClamEngine()
  return {
    engine,
    status: engine === 'none' ? 'unavailable' : 'ok',
  }
}

export async function scanFileWithClamscan(filePath: string): Promise<{ infected: boolean; signature?: string } | null> {
  const ok = await detectClamscan()
  if (!ok) return null
  return await new Promise((resolve) => {
    const proc = spawn('clamscan', ['--no-summary', filePath])
    let out = ''
    proc.stdout?.on('data', (d) => { out += String(d) })
    const finish = () => {
      const line = out.trim().split('\n').pop() || ''
      if (line.endsWith(': OK')) return resolve({ infected: false })
      if (line.endsWith(' FOUND')) {
        const sig = line.substring(line.lastIndexOf(':') + 1).replace('FOUND', '').trim()
        return resolve({ infected: true, signature: sig })
      }
      return resolve({ infected: false })
    }
    proc.on('close', finish)
    proc.on('exit', finish)
    proc.on('error', () => resolve({ infected: false }))
  })
}
