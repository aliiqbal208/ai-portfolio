# ClamAV usage for Go services

This repo has no Go server or ClamAV code. If you run a separate Go service, improve utilization by streaming to clamd using the INSTREAM protocol, enforcing timeouts and size limits, and failing closed on scanner errors. Keep connections short lived, bound concurrency, and add health checks and metrics.\n