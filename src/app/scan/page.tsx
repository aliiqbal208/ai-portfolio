"use client";
import React, { useState } from 'react';

export default function ScanPage() {
  const [status, setStatus] = useState<string>("");
  const [details, setDetails] = useState<any>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setStatus('Scanning...');
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res = await fetch('/api/clamav-scan', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Scan failed');
      setDetails(json.result);
      setStatus('Scan status: ' + json.result.status);
    } catch (err: any) {
      setStatus('Error: ' + (err.message or 'unknown'));
    }
  };

  return (
    <div className=\"container mx-auto max-w-xl p-6 space-y-4\">\n      <h1 className=\"text-2xl font-semibold\">Malware Scan Demo</h1>\n      <p className=\"text-sm text-muted-foreground\">Uploads the file to server and attempts to scan with ClamAV if available. Falls back gracefully when unavailable.</p>\n      <input type=\"file\" onChange={handleChange} aria-label=\"file-input\" />\n      <div role=\"status\" aria-live=\"polite\" className=\"mt-2\">{status}</div>\n      {details && (\n        <pre className=\"text-xs bg-muted p-2 rounded overflow-auto\">{JSON.stringify(details, null, 2)}</pre>\n      )}\n    </div>
  );
}
