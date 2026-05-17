# Issue 12: ClamAV (Go) Mismatch

This repository (Next.js frontend) contains no Go server or existing ClamAV logic.
Therefore, no direct Go-side changes are possible here.

Proposed next steps:
- Confirm the intended repo for the Go server.
- If this frontend must call a Go scanning API, share its contract so we can integrate a client.

In this PR we only add a minimal e2e scaffold and keep CI green without altering runtime features.
