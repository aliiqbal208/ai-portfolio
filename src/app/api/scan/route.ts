import { NextRequest } from 'next/server'
import { scanBufferWithClamAV, isClamAVConfigured } from '@/lib/clamav'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  return Response.json({ ok: true, clamavConfigured: isClamAVConfigured() })
}

function parseMode(req: NextRequest): 'simulate_clean' | 'simulate_infected' | '' {
  const h = (name: string) => req.headers.get(name) || ''
  const q = req.nextUrl.searchParams.get('mode') || ''
  const m = (h('x-clamav-mode') || q).toLowerCase()
  if (m === 'simulate_clean' || m === 'simulate-infected' || m === 'simulate_infected') {
    return m.replace('-', '_') as any
  }
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let buffer: Buffer | null = null

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (!file) {
        return new Response('Missing file field', { status: 400 })
      }
      const ab = await file.arrayBuffer()
      buffer = Buffer.from(ab)
    } else {
      const ab = await req.arrayBuffer()
      buffer = Buffer.from(ab)
    }

    if (!buffer || buffer.length === 0) {
      return new Response('Empty payload', { status: 400 })
    }

    // Size guard: 10 MB
    if (buffer.length > 10 * 1024 * 1024) {
      return new Response('File too large', { status: 413 })
    }

    const mode = parseMode(req)
    const result = await scanBufferWithClamAV(buffer, { mode })

    return Response.json({ ok: true, ...result })
  } catch (err: any) {
    return Response.json({ ok: false, error: String(err?.message || err || 'unknown') }, { status: 500 })
  }
}
