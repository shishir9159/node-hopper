import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, fetch, setHeaders }) => {
  const repo = url.searchParams.get('repo'); // expected: owner/repo
  const token = url.searchParams.get('token'); // optional
  if (!repo || !/^\S+\/\S+$/.test(repo)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid repo. Use owner/repo.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const endpoint = `https://api.github.com/repos/${repo}/zipball`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: `GitHub error ${res.status}: ${text}` }), {
      status: res.status,
      headers: { 'content-type': 'application/json' }
    });
  }

  // GitHub returns application/zip stream; forward it with safe CORS for same-origin
  setHeaders({
    'content-type': 'application/zip',
    'cache-control': 'no-store'
  });

  return new Response(res.body, { status: 200 });
};


