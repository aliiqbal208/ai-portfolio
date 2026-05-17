import { NextResponse } from 'next/server'
import { clamdScan } from '@/lib/clamav'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || ''
    if (!ct.startsWith('application/octet-stream')) {
      return NextResponse.json({ error: 'send raw bytes with content-type application/octet-stream' }, { status: 400 })
    }
    const arrayBuf = await req.arrayBuffer()
    const buf = Buffer.from(arrayBuf)
    if (buf.length === 0) {
      return NextResponse.json({ error: 'empty body' }, { status: 400 })
    }
    const result = await clamdScan(buf)
    return NextResponse.json(result, { status: result.ok ? 200 : result.infected ? 422 : 502 })
  } catch (err: any) {
    return NextResponse.json({ error: 'scan_failed', detail: String(err?.message || err) }, { status: 500 })
  }
}
