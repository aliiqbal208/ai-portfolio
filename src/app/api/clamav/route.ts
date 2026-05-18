import { NextRequest, NextResponse } from 'next/server'
import { instreamScan, isEnabled, ping, version } from '@/lib/clamav'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(_req: NextRequest) {
  const enabled = isEnabled()
  if (!enabled) {
    return NextResponse.json({ enabled: false, reachable: false, version: null })
  }
  const reachable = await ping()
  const ver = await version()
  return NextResponse.json({ enabled: true, reachable, version: ver })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const b64: string | undefined = body?.base64
    if (!b64) {
      return NextResponse.json({ ok: false, error: 'MISSING_BASE64' }, { status: 400 })
    }
    const buf = Buffer.from(b64, 'base64')
    const res = await instreamScan(buf)
    return NextResponse.json(res, { status: res.ok ? 200 : 422 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
