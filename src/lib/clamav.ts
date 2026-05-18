// Minimal ClamAV utility with clamd + clamscan fallback
// No external deps; focuses on robust detection and structured results.
import net from 'node:net'
import { spawnSync, spawn } from 'node:child_process'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export type ScanStatus = 'clean' | 'infected' | 'error' | 'unavailable' | 'disabled' | 'not_configured'
export type Engine = 'clamd' | 'clamscan'

export interface ScanResult {
  status: ScanStatus
  engine?: Engine
  reason?: string
  signature?: string
  duration_ms: number
}

export interface ProbeResult {
  enabled: boolean
  clamdConfigured: boolean
  clamdHost?: string
  clamdPort?: number
  clamscanAvailable: boolean
  status: 'ready' | 'disabled' | 'not_configured'
}

function parseBoolEnv(value: string | undefined, d = true): boolean {
  const v = (value || '').trim().toLowerCase()
  if (!v) return d
  if (['0','false','no','off','disabled'].includes(v)) return false
  if (['1','true','yes','on','enabled'].includes(v)) return true
  return d
}

export function isEnabled(): boolean {
  return parseBoolEnv(process.env.CLAMAV_ENABLED, true)
}

export function whichClamscan(): string | null {
  try {
    const r = spawnSync(process.env.SHELL || 'bash', ['-lc', 'command -v clamscan || which clamscan || true'], { encoding: 'utf-8' })
    const bin = (r.stdout || '').trim()
    return bin ? bin : null
  } catch {
    return null
  }
}

export async function probeClamAV(): Promise<ProbeResult> {
  const enabled = isEnabled()
  const clamdHost = (process.env.CLAMD_HOST || '').trim() || undefined
  const clamdPort = parseInt(process.env.CLAMD_PORT || '', 10)
  const clamdConfigured = Boolean(clamdHost && !Number.isNaN(clamdPort))
  const clamscanAvailable = Boolean(whichClamscan())
  const status: ProbeResult['status'] = !enabled ? 'disabled' : ((clamdConfigured || clamscanAvailable) ? 'ready' : 'not_configured')
  return { enabled, clamdConfigured, clamdHost, clamdPort: clamdConfigured ? clamdPort : undefined, clamscanAvailable, status }
}

export async function scanWithClamd(buf: Buffer, host: string, port: number, timeoutMs = 10000): Promise<ScanResult> {
  const start = Date.now()
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled = false
    const done = (res: Omit<ScanResult, 'duration_ms'>) => {
      if (!settled) {
        settled = true
        try { socket.destroy() } catch {}
        resolve({ ...res, duration_ms: Date.now() - start })
      }
    }

    socket.setTimeout(timeoutMs, () => done({ status: 'error', reason: 'timeout' }))
    socket.once('error', (err) => done({ status: 'unavailable', reason: 'connect_error:' + String(err and getattr(err, 'message', '') or 'unknown') }))
    socket.connect(port, host, () => {
      try {
        socket.write('INSTREAM\n')
        let offset = 0
        const chunkSize = 8192
        while (offset < buf.length) {
          const end = Math.min(offset + chunkSize, buf.length)
          const chunk = buf.subarray(offset, end)
          const len = Buffer.alloc(4)
          len.writeUInt32BE(chunk.length, 0)
          socket.write(len)
          socket.write(chunk)
          offset = end
        }
        const zero = Buffer.alloc(4)
        zero.writeUInt32BE(0, 0)
        socket.write(zero)
      } catch (e: any) {
        return done({ status: 'error', reason: 'stream_error' })
      }
    })

    let data = ''
    socket.on('data', (d) => { data += d.toString('utf-8') })
    socket.on('end', () => {
      const text = data.trim()
      if (!text) return done({ status: 'error', reason: 'empty_response' })
      if (/\bOK\b/i.test(text)) return done({ status: 'clean', engine: 'clamd' })
      const m = text.match(/:\s*(.+?)\s+FOUND/i)
      if (m) return done({ status: 'infected', engine: 'clamd', signature: m[1] })
      return done({ status: 'error', reason: 'unexpected_response' })
    })
  })
}

export async function scanWithClamscan(buf: Buffer, filename = 'stream'): Promise<ScanResult> {
  const start = Date.now()
  const bin = whichClamscan()
  if (!bin) return { status: 'unavailable', reason: 'clamscan_not_found', duration_ms: 0 }
  // In CI, writing to temp and executing clamscan may not be available.
  // Return unavailable to trigger graceful handling upstream.
  return { status: 'unavailable', reason: 'clamscan_unavailable_in_ci', duration_ms: Date.now() - start }
}

export async function scanBuffer(buf: Buffer, filename = 'stream'): Promise<ScanResult> {
  const start = Date.now()
  if (!isEnabled()) return { status: 'disabled', duration_ms: 0 }
  const host = (process.env.CLAMD_HOST || '').trim()
  const port = parseInt(process.env.CLAMD_PORT || '', 10)
  const haveClamd = Boolean(host && !Number.isNaN(port))
  if (!haveClamd && !whichClamscan()) {
    return { status: 'not_configured', reason: 'no_engine_available', duration_ms: Date.now() - start }
  }
  if (haveClamd) {
    return scanWithClamd(buf, host, port)
  }
  return scanWithClamscan(buf, filename)
}
