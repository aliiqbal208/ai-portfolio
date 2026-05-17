'use client';
import { useEffect, useState } from 'react';

export default function ClamAVStatusPage() {
  const [state, setState] = useState<any>({ loading: true });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/clamav/health', { cache: 'no-store' });
        const data = await res.json();
        if (active) setState({ loading: false, data });
      } catch (err: any) {
        if (active) setState({ loading: false, error: err?.message || 'failed' });
      }
    })();
    return () => { active = false; };
  }, []);

  if (state.loading) return <div className="p-6"><h1 className="text-xl font-semibold">ClamAV Status</h1><p>Loading…</p></div>;

  const d = state.data || {};
  const configured = !!d.configured;
  const reachable = !!d.reachable;
  const ok = !!d.ok;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">ClamAV Status</h1>
      {!configured && (
        <p data-testid="clamav-status" className="text-amber-600">ClamAV not configured. Set <code>CLAMAV_ENABLED=true</code> to enable.</p>
      )}
      {configured && !reachable && (
        <p data-testid="clamav-status" className="text-red-600">ClamAV configured but unreachable at {d.host}:{d.port} ({d.reason || 'unknown'}).</p>
      )}
      {ok && (
        <p data-testid="clamav-status" className="text-green-700">ClamAV healthy at {d.host}:{d.port} — {d.version || 'version unknown'}</p>
      )}
      {typeof d.latencyMs === 'number' && (
        <p className="text-sm text-muted-foreground">Latency: {d.latencyMs} ms</p>
      )}
    </div>
  );
}
