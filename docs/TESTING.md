# Testing Notes

This repository currently has no file-upload or antivirus (ClamAV) logic. The e2e test `tests/e2e/clamav-scan.spec.ts` is a placeholder that is skipped. When an upload + scan flow is added, replace that test with a real flow that:
- navigates to the upload UI,
- uploads a benign file and verifies it succeeds,
- uploads an EICAR test file and verifies the UI blocks it with a clear error,
- asserts any server-side scan status indicators change appropriately.
