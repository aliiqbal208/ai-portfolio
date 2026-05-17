import type { NextRequest } from 'next/server'
import { getClamavConfigFromEnv, isEnabled, pingClamAV, scanBase64 } from '@/lib/clamav'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function GET() {
  const cfg = getClamavConfigFromEnv()
  if (!isEnabled(cfg)) return Response.json({ ok: true, enabled: false })
  try {
    const ping = await pingClamAV(cfg)
    return Response.json({ ok: true, enabled: true, ping })
  } catch (err: any) {
    return Response.json({ ok: false, enabled: true, error: String(err?.message || err) })
  }
}

export async function POST(req: NextRequest) {
  const cfg = getClamavConfigFromEnv()
  let data: any
  try {
    data = await req.json()
  } catch {
    return new Response('Expected JSON body', { status: 400 })
  }
  const b64 = typeof (data && data.data) === 'string' ? data.data : ''
  if (!b64) return new Response('Missing  (base64 string)', { status: 400 })
  if (!isEnabled(cfg)) return Response.json({ ok: true, enabled: false, skipped: true })
  try {
    const result = await scanBase64(cfg, b64)
    return Response.json({ ok: true, enabled: true, result })
  } catch (err: any) {
    return Response.json({ ok: false, enabled: true, error: String(err?.message || err) }, { status: 500 })
  }
}
