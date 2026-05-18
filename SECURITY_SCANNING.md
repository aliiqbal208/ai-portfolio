# ClamAV Scanning (Optimized)

This repo includes a tiny  client at  optimized for production use without extra deps.

Key behaviors:
- Connection reuse via a lazy singleton to avoid repeated TCP handshakes.
- Streaming  protocol with chunking (default 16 KiB) to keep memory steady.
- Size guard (, default 50 MiB) to cap scan payloads.
- Timeouts (, default 10s) to prevent stuck requests.
- Fail-open by default () so outages don’t block uploads; set  to fail closed.
- Socket or TCP supported:  or /.

Environment flags:
-  (default: false)
-  or (, )
- , , , 

API helper:
-  returns JSON status without requiring a live scanner when disabled.

Usage example (server action / route):

