# Security Notes: ClamAV / Go Backend

The GitHub issue requests improving Go server ClamAV logic. This repository currently contains a Next.js frontend only and no Go backend or ClamAV integration. If ClamAV scanning is needed in this project, consider integrating with a separate scanning service (e.g., a REST API backed by ) and call it from Next.js API routes using environment-configured endpoints and timeouts. Avoid hardcoding credentials; use platform secrets.
