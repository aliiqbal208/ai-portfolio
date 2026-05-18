import { NextResponse } from next/server;
import { ping } from @/lib/clamav;
export async function GET(){ const ok = await ping(); return NextResponse.json({ ok }, { status: ok?200:503 }); }
