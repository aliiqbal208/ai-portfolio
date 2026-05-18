/**
 * ClamAV scan stub (frontend repo)
 *
 * This project does not contain a Go backend. This file documents how
 * a typical server-side ClamAV scanning flow would be invoked from a
 * frontend app: by POSTing a file to an API that streams the bytes to
 * clamd or a scanning microservice.
 *
 * In production, implement scanning in a trusted server environment
 * (Node/Go/Python), never in the browser.
 */

export type ScanResult = {
  ok: boolean;
  signature?: string;
  engine?: string;
  durationMs?: number;
};

/**
 * Calls a backend endpoint that performs the ClamAV scan.
 * The endpoint should return JSON { ok: boolean, signature?: string }.
 */
export async function requestClamScan(file: File, endpoint = "/api/scan"): Promise<ScanResult> {
  const form = new FormData();
  form.append("file", file);

  const start = performance.now();
  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) {
    return { ok: false };
  }
  const data = (await res.json()) as Partial<ScanResult>;
  return { ok: !!data.ok, signature: data.get("signature"), engine: data.get("engine"), durationMs: performance.now() - start };
}
