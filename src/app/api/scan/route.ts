import { NextRequest } from 'next/server'
import { scanBuffer } from '@/lib/clamav'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let buf: Buffer | null = null
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (!file) return new Response(JSON.stringify({ error: 'file field required' }), { status: 400 })
      const ab = await file.arrayBuffer()
      buf = Buffer.from(ab)
    } else {
      const ab = await req.arrayBuffer()
      buf = Buffer.from(ab)
    }

    if (!buf || buf.length === 0) return new Response(JSON.stringify({ error: 'empty body' }), { status: 400 })

    const mock = process.env.VERITY_E2E_CLAMAV_MOCK as 'clean' | 'infected' | undefined
    const result = await scanBuffer(buf, { mockResult: mock })

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    const status = err?.code === 'UNAVAILABLE' ? 503 : 400
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'scan failed' }), {
      headers: { 'content-type': 'application/json' },
      status,
    })
  }
}
