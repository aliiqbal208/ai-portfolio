export const runtime = nodejs
import { NextRequest } from 'next/server'
import { probeClamAV, scanBuffer } from '@/lib/clamav'

export const dynamic = 'force-dynamic'

export async function GET() {
  const probe = await probeClamAV()
  return Response.json(probe, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!/application\/json/i.test(contentType)) {
      return Response.json({ error: 'expected application/json' }, { status: 415 })
    }
    const body = await req.json()
    const b64 = String(body?.dataBase64 || '')
    if (!b64) return Response.json({ error: 'dataBase64 required' }, { status: 400 })
    const filename = String(body?.filename || 'stream')
    const buf = Buffer.from(b64, 'base64')
    const result = await scanBuffer(buf, filename)
    return Response.json(result, { status: 200 })
  } catch (e: any) {
    return Response.json({ status: 'error', reason: e?.message || 'unknown' }, { status: 500 })
  }
}
