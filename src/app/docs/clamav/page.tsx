
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClamAV Integration Status',
  description: 'Project note about Go/ClamAV integration scope.',
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl py-16 px-6 prose dark:prose-invert">
      <h1>ClamAV Integration Status</h1>
      <p>
        This repository currently contains a Next.js frontend only. There is no Go server
        or ClamAV scanning logic present in this codebase. Issue #12 ("improve Go server ClamAV
        utilising logic") appears to target an external backend that is not part of this repo.
      </p>
      <p>
        If a Go/ClamAV service is introduced here later, the frontend can surface scan results and
        statuses via an API route. Until then, this page serves as an explicit clarification to avoid
        confusion for contributors and reviewers.
      </p>
    </main>
  );
}
