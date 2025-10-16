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
  const headers: Record<string, string> = {
    // Avoid JSON accept for binary zip; GitHub ignores or redirects
    'User-Agent': 'node-hopper/1.0',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(endpoint, { headers, redirect: 'follow' });
  if (!res.ok) {
    // Fallback: get default branch and pull from codeload
    try {
      const repoMetaRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
      if (repoMetaRes.ok) {
        const meta = await repoMetaRes.json();
        const defaultBranch: string | undefined = meta?.default_branch;
        if (defaultBranch) {
          const codeloadUrl = `https://codeload.github.com/${repo}/zip/refs/heads/${defaultBranch}`;
          const cdRes = await fetch(codeloadUrl, { headers, redirect: 'follow' });
          if (cdRes.ok) {
            setHeaders({ 'content-type': 'application/zip', 'cache-control': 'no-store' });
            return new Response(cdRes.body, { status: 200 });
          }
        }
      }
    } catch (e) {
      // ignore and fall through to error response
    }
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


