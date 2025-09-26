export async function GET(_req: Request) {
  const res = await fetch('https://api.github.com/repos/aliiqbal208/ai-portfolio', {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    return new Response('Failed to fetch stars', { status: res.status });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ stars: data.stargazers_count }), {
    headers: { 'Content-Type': 'application/json' },
  });
}