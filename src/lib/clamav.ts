/**
 * ClamAV integration helper.
 *
 * This repo does not include the Go ClamAV server; instead, this module
 * provides a safe adapter to call an external service when configured
 * via environment variables. It is deliberately conservative and
 * no-ops when not configured so the frontend remains functional.
 */

export type ClamAVHealth = {
  configured: boolean;
  mode: 'external-go-server' | 'disabled';
  details?: string;
};

function env(name: string): string {
  try {
    return process.env[name]?.trim() || '';
  } catch {
    return '';
  }
}

export function getClamAVConfig() {
  // External Go server base URL (e.g., http://clamav-go:8080)
  const baseURL = env('GO_CLAMAV_URL') || env('CLAMAV_SERVER_URL');
  const apiKey = env('GO_CLAMAV_API_KEY') || env('CLAMAV_API_KEY');
  const timeoutMs = Number(env('CLAMAV_TIMEOUT_MS') || '6000');
  return { baseURL, apiKey, timeoutMs };
}

export function health(): ClamAVHealth {
  const { baseURL } = getClamAVConfig();
  if (!baseURL) {
    return { configured: false, mode: 'disabled', details: 'No GO_CLAMAV_URL configured' };
  }
  return { configured: true, mode: 'external-go-server' };
}

export async function scanByURL(fileURL: string): Promise<{ ok: boolean; infected: boolean; reason?: string; signature?: string }>{
  const { baseURL, apiKey, timeoutMs } = getClamAVConfig();
  if (!baseURL) {
    return { ok: false, infected: false, reason: 'clamav_not_configured' };
  }
  // Minimal external call contract: POST /scan-url { url }
  // The actual Go service should implement this endpoint.
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  try {
    const res = await fetch(, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { 'authorization':  } : {}),
      },
      body: JSON.stringify({ url: fileURL }),
      signal: controller.signal,
      // Next.js route fetch on the server is allowed; on the client this should not be used.
      cache: 'no-store',
    } as RequestInit);
    clearTimeout(id);
    if (!res.ok) {
      return { ok: false, infected: false, reason:  };
    }
    const data = await res.json().catch(() => ({}));
    const infected = Boolean((data && (data.infected ?? data.malware)) || false);
    const signature = typeof data?.signature === 'string' ? data.signature : undefined;
    return { ok: true, infected, signature };
  } catch (err: any) {
    clearTimeout(id);
    const reason = err?.name === 'AbortError' ? 'timeout' : (err?.message || 'network_error');
    return { ok: false, infected: false, reason };
  }
}
