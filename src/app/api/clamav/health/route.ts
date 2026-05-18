import { NextResponse } from 'next/server'
import { health } from '@/lib/clamav'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const h = await health()
    return NextResponse.json(h, { status: 200 })
  } catch (err) {
    return NextResponse.json({ engine: 'none', status: 'unavailable' }, { status: 200 })
  }
}
