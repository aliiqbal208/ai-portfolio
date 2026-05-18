export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { detectConfig, ping } from "@/lib/clamav";

export async function GET(_req: NextRequest) {
  const detected = detectConfig();
  if (!detected.configured) {
    return Response.json({ status: "unconfigured", reason: detected.reason }, { status: 200 });
  }
  try {
    const res = await ping(detected.config!);
    return Response.json({ status: res.ok ? "ok" : "error", raw: res.raw }, { status: res.ok ? 200 : 503 });
  } catch (err: any) {
    return Response.json({ status: "error", error: String(err?.message || err) }, { status: 503 });
  }
}
