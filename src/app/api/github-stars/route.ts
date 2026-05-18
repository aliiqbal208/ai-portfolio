import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest) {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    'User-Agent': 'ai-portfolio-stars-fetch',
    'Accept': 'application/vnd.github+json',
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  try {
    const res = await fetch('https://api.github.com/repos/aliiqbal208/ai-portfolio', {
      headers,
      // Leverage Next.js fetch caching on the server
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!res.ok) {
      return new Response('Failed to fetch stars', { status: res.status });
    }

    const data = await res.json();
    const stars = Number((data as any)?.stargazers_count ?? 0);

    return new Response(JSON.stringify({ stars }), {
      headers: {
        'Content-Type': 'application/json',
        // Client/proxy cache hint (safe; stars need not be realtime)
        'Cache-Control': 'public, max-age=300, s-maxage=900',
      },
    });
  } catch (err) {
    // Avoid leaking internals; return stable failure shape
    return new Response(JSON.stringify({ stars: 0, error: 'unavailable' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
