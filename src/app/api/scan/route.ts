import type { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(JSON.stringify({ status: "scanner_unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: NextRequest) {
  try {
    const ab = await req.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf || buf.length === 0) {
      return new Response(JSON.stringify({ error: "empty_body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ status: "scanner_unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "unexpected_error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
