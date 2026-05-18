# Security Scanning (ClamAV)

This repo includes a small, dependency-free ClamAV client optimized for streaming scans and caching.

- Library: 
- API route:  with  returns .
- Env: ,  (3310), , , , .
- Behavior: If  is unset, scans return .
- Optimization: Content-hash LRU cache avoids rescanning identical payloads; INSTREAM protocol streams to clamd.

E2E:  validates the API contract and skips if  is not set.
