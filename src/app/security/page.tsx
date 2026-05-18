import Link from "next/link";

export const metadata = {
  title: "Security & Malware Scanning",
  description: "Project security notes and planned ClamAV scanning logic.",
};

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-neutral dark:prose-invert">
      <h1>Security & Malware Scanning</h1>
      <h2 id="clamav-strategy">Planned ClamAV Scanning Strategy</h2>
      <p>Note: This page is informational only.</p>
      <p><Link className="underline" href="/">Back to home</Link></p>
    </main>
  );
}
