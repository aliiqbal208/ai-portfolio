# Use Cases

- ClamAV logic shim endpoint at `/api/clamav-scan` supports:
  - POST raw bytes (ArrayBuffer) or JSON `{ text: string }` or `{ data: base64 }`
  - Optional query `maxBytes` to enforce a byte limit (defaults 10MB)
  - Returns: `{ status: clean|infected|skipped, bytesScanned, signature?, reason? }`

This endpoint is designed for deterministic tests using the EICAR signature, not for production malware scanning.
