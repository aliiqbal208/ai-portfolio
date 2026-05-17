import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      service: 'clamav',
      status: 'not_implemented',
      message: 'ClamAV backend is not implemented in this repository.'
    },
    { status: 501 }
  );
}
