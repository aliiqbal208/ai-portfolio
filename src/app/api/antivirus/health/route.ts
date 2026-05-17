import { NextResponse } from "next/server";
import { health } from "@/lib/clamav";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const h = await health();
  return NextResponse.json(h, { status: h.healthy ? 200 : 503 });
}
