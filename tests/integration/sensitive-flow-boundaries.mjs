import assert from 'node:assert/strict';

const base = (process.env.API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');
const token = process.env.TEST_USER_TOKEN;

if (!token) {
  console.log('sensitive-flow boundaries: SKIPPED (TEST_USER_TOKEN is required)');
  process.exit(0);
}

async function request(path, body) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

// AI generation is a cost-sensitive flow. The API must reject obviously abusive payloads.
const huge = 'x'.repeat(250_000);
const res = await request('/ai/study', { question: huge });
assert.ok([400, 413, 429].includes(res.status), `oversized AI request returned ${res.status}`);

console.log('sensitive-flow boundaries: PASS');
