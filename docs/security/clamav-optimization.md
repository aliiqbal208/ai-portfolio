# ClamAV Scanning Logic - Not Applicable

Issue #18 requests optimizing ClamAV scanning. This repository is a static Next.js portfolio with no server-side upload or antivirus integration. There is no ClamAV-related code path to optimize.

Decision:
- No code changes implemented because the feature does not exist here.
- If a future file-upload or scanning feature is added (e.g., an API route handling uploads), integrate a dedicated scanning service (clamd or a managed AV) behind an async queue and cache clean hashes to avoid repeated work.

Recommended approach for a future implementation (summary):
- Prefer clamd over spawning clamscan for throughput (warm process).
- Stream-scan uploads; reject or flag positives; emit structured telemetry.
- Deduplicate via SHA-256 content hash; maintain a short-lived clean-cache.
- Enforce size and type limits and timeouts to protect resources.
- Wrap with circuit breaker and exponential backoff on scan failures.
- Unit-test scan policy and cache; e2e-test a benign sample path.
