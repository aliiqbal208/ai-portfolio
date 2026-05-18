# ClamAV Utilization – Improvement Plan

This repo contains a Next.js frontend only; no Go/ClamAV code was found on 2026-05-18.
Issue #12 likely targets a separate Go service. Below captures the intended interface and improvements.

Goals:
- Scan uploads via a Go service that talks to clamd
- Stream files, enforce size/MIME limits, apply timeouts
- Return minimal JSON: clean/infected with signature, engine info

Next steps:
- Implement in the Go service repo
- Expose POST /scan and wire this frontend before accepting uploads
