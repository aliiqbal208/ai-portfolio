import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      status: 'not_implemented',
      message: 'ClamAV scan endpoint is not implemented in this repository.'
    },
    { status: 501 }
  );
}
