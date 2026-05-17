import { NextResponse } from "next/server";
import { scanBuffer } from "@/lib/clamav";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data with file field" }, { status: 400 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const result = await scanBuffer(buf);
  const status = result.status === "error" ? 502 : 200;
  return NextResponse.json(result, { status });
}
