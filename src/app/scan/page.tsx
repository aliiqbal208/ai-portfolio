
'use client';

import React, { useMemo, useState } from 'react';
import { AvScanner, AvScanResult } from '@/lib/av-scan';

export default function ScanDemoPage() {
  const scanner = useMemo(() => new AvScanner(), []);
  const [result, setResult] = useState<AvScanResult | null>(null);
  const [scans, setScans] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await scanner.scan(file);
    setResult(res);
    setScans(scanner.scans);
    setCacheHits(scanner.cacheHits);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Client Pre-Scan Demo</h1>
      <p>Uploads are not sent; this simulates client hashing + cache before server-side AV.</p>

      <input data-testid=file-input type=file onChange={onChange} />

      <div style={{ marginTop: 16 }}>
        <div data-testid=scan-count>scans: {scans}</div>
        <div data-testid=cache-count>cache hits: {cacheHits}</div>
      </div>

      {result && (
        <div style={{ marginTop: 16 }} data-testid=scan-result>
          <div>status: {result.status}</div>
          {result.reason && <div>reason: {result.reason}</div>}
          <div>hash: {result.hash.slice(0, 12)}…</div>
        </div>
      )}
    </div>
  );
}
