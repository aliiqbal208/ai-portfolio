import { NextResponse } from 'next/server'
import { scanBuffer, isConfigured } from '@/lib/clamav'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ status: 'unavailable' }, { status: 200 })
  }
  const ctype = req.headers.get('content-type') || ''
  if (!ctype.startsWith('application/octet-stream')) {
    return NextResponse.json({ error: 'send raw bytes with application/octet-stream' }, { status: 400 })
  }
  const ab = await req.arrayBuffer()
  const buf = Buffer.from(ab)
  const result = await scanBuffer(buf)
  return NextResponse.json(result, { status: 200 })
}
