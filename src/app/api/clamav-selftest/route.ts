import { NextResponse } from 'next/server'
import { scanBuffer } from '@/lib/clamav'

export const runtime = 'nodejs'

const EICAR = Buffer.from(
  'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*',
  'utf8'
)

export async function GET() {
  const res = await scanBuffer(Buffer.from('hello'), { timeoutMs: 1000 })
  return NextResponse.json({ mode: res.mode, status: res.scan.status, reason: res.reason })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { sample?: string }
  const sample = (body.sample || '').toLowerCase()
  const buf = sample === 'eicar' ? EICAR : Buffer.from('hello')
  const result = await scanBuffer(buf, { timeoutMs: 2000 })
  return NextResponse.json(result)
}
