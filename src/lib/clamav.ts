// Minimal, dependency-free virus scanning helpers (client-safe)
// Note: This does not invoke ClamAV; it provides a predictable EICAR check
// and size limits so logic can be exercised in the app and e2e tests.

export type ScanResult =
  | { status: 'clean'; bytesScanned: number }
  | { status: 'infected'; bytesScanned: number; signature: string }
  | { status: 'skipped'; bytesScanned: number; reason: string };

export type ScanOptions = {
  maxBytes?: number; // default 10MB
};

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB

// ASCII EICAR signature (escaped backslash)
const EICAR =
  'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*';

function containsEICAR(ascii: string): boolean {
  // Common variants may include trailing newline; scan normalized slice
  return ascii.includes(EICAR) || ascii.includes(EICAR + '
');
}

export async function scanBytes(
  data: Uint8Array | ArrayBuffer,
  opts: ScanOptions = {}
): Promise<ScanResult> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const maxBytes = Math.max(1, opts.maxBytes ?? DEFAULT_MAX_BYTES);

  if (bytes.byteLength > maxBytes) {
    return {
      status: 'skipped',
      bytesScanned: 0,
      reason: ,
    };
  }

  // Cheap ASCII decode for signature match; safe for binary
  const ascii = new TextDecoder('ascii', { fatal: false }).decode(bytes);
  if (containsEICAR(ascii)) {
    return { status: 'infected', bytesScanned: bytes.byteLength, signature: 'EICAR-TEST' };
  }

  return { status: 'clean', bytesScanned: bytes.byteLength };
}
