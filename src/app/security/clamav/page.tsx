
import React from 'react';
import { detectClamAV } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export default async function ClamAVStatusPage() {
  const status = await detectClamAV();
  const available = Boolean(status.available);
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Security · Antivirus</h1>
      <p data-testid="clamav-status" className="text-sm">
        Antivirus: <span className={available ? 'text-green-600' : 'text-amber-600'}>{available ? 'Available' : 'Unavailable'}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        This page checks for ClamAV presence at runtime and falls back gracefully if not installed.
      </p>
    </div>
  );
}
