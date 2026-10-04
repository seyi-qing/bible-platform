import assert from 'node:assert/strict';

const base = (process.env.API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { res, body };
}

// Malformed credentials must fail closed.
for (const authorization of ['Bearer', 'Bearer nope', 'Basic abc', 'Bearer a.b.c']) {
  const { res } = await request('/plans', { headers: { authorization } });
  assert.equal(res.status, 401, `malformed authorization ${authorization} returned ${res.status}`);
}

// Validation errors must be client errors, never an accidental 500.
const malformed = await request('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email: 'not-an-email', password: 'x' }),
});
assert.equal(malformed.res.status, 400, `invalid registration returned ${malformed.res.status}`);
assert.equal(malformed.body?.code, 'VALIDATION_ERROR', 'validation response must expose stable error code');

console.log('failure boundaries: PASS');
