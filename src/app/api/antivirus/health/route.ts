import { NextResponse } from 'next/server'
import { isConfigured } from '@/lib/clamav'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = isConfigured()
  return NextResponse.json({ ok: true, configured })
}
