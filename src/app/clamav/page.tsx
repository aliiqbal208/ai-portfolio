import { isEnabled } from '@/lib/clamav';

export default async function ClamavStatusPage() {
  const enabled = isEnabled();
  const text = enabled ? 'enabled' : 'disabled (not configured)';
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">ClamAV Status</h1>
      <p data-testid="clamav-status" className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">\n        {text}\n      </p>
      <p className="mt-4 text-xs text-neutral-500">\n        This page reflects configuration only. Connectivity is checked at /api/clamav/health.\n      </p>
    </div>
  );
}
