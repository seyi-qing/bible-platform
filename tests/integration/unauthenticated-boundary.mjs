import assert from 'node:assert/strict';

const base = (process.env.API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');

const cases = [
  ['GET', '/plans'],
  ['POST', '/plans'],
  ['GET', '/prayer'],
  ['POST', '/prayer'],
  ['GET', '/history'],
  ['POST', '/history'],
  ['GET', '/community/groups'],
  ['POST', '/community/groups'],
  ['POST', '/sync/devices'],
  ['POST', '/sync/push'],
  ['POST', '/sync/pull'],
  ['POST', '/ai/study'],
  ['GET', '/ai/jobs/not-a-real-job'],
  ['GET', '/ai/conversations'],
  ['POST', '/search/index-chapter'],
  ['GET', '/notifications'],
  ['POST', '/notifications/devices'],
  ['GET', '/admin/overview'],
];

for (const [method, path] of cases) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? '{}' : undefined,
  });
  assert.equal(res.status, 401, `${method} ${path} returned ${res.status}, expected 401`);
}

console.log(`unauthenticated boundary: PASS (${cases.length} protected routes)`);
