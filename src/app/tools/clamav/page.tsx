import { detectClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ClamAVPage() {
  const det = await detectClamAV();
  return (
    <main className='mx-auto max-w-2xl px-6 py-12'>
      <h1 className='text-2xl font-semibold mb-4'>ClamAV Scanner</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        This page reports whether ClamAV is available on the server runtime.
      </p>
      <div data-testid='clamav-status' className='rounded-md border p-4'>
        <div><span className='font-mono'>Available:</span> {String(det.available)}</div>
        <div><span className='font-mono'>Engine:</span> {det.engine ?? 'n/a'}</div>
        <div><span className='font-mono'>Version:</span> {det.version ?? 'n/a'}</div>
        {det.error && (
          <div className='text-amber-600 mt-2'>Note: {det.error}</div>
        )}
      </div>
    </main>
  );
}
