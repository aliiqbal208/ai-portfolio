import { NextResponse } from 'next/server';
import { scanBuffer } from '@/lib/clamav';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function readBodyAsBuffer(req: Request): Promise<Buffer>{ const ct = req.headers.get('content-type')||''; if(ct.includes('application/json')){ try{ const data = await req.json() as any; if(data && typeof data.content==='string'){ return Buffer.from(data.content,'utf8'); } }catch{} } const t = await req.text(); return Buffer.from(t||'','utf8'); }
export async function POST(req: Request){ try{ const buf = await readBodyAsBuffer(req); const result = await scanBuffer(buf); return NextResponse.json({ ok: true, ...result }); } catch(err: any){ return NextResponse.json({ ok:false, error: String(err?.message||err) }, { status: 400 }); } }
