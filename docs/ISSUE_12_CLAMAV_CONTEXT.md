# Issue #12: Go server ClamAV logic — repository context note

This repository (aliiqbal208/ai-portfolio) is a Next.js-based frontend portfolio. There is no Go code, no , and no ClamAV integration under , , or elsewhere.

To implement or improve Go server ClamAV utilization logic here, a backend (or new backend directory) containing the Go service and its ClamAV client would be required. Until such code exists, no direct change is possible. A skipped Playwright spec has been added at  to document this mismatch.

If/when a Go backend is added, please provide:
- Path to the Go module (e.g., ).
- ClamAV integration approach (clamd TCP/Unix socket or ).
- Expected API contract between frontend and backend for file scanning.

After that, e2e coverage can exercise an upload/scan flow against a running or mocked backend.
