import { NextResponse } from 'next/server'
import { clamdPing } from '@/lib/clamav'

export const runtime = 'nodejs'

export async function GET() {
  const { ok, raw } = await clamdPing()
  return NextResponse.json({ ok, raw }, { status: ok ? 200 : 503 })
}
