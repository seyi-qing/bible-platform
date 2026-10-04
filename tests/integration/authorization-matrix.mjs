import assert from 'node:assert/strict';

const base = (process.env.API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');
const tokenA = process.env.TEST_USER_A_TOKEN;
const tokenB = process.env.TEST_USER_B_TOKEN;
const objectId = process.env.TEST_OBJECT_ID;

if (!tokenA || !tokenB || !objectId) {
  console.log('authorization matrix: SKIPPED (TEST_USER_A_TOKEN, TEST_USER_B_TOKEN and TEST_OBJECT_ID are required)');
  process.exit(0);
}

async function request(path, token, options = {}) {
  return fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
  });
}

// Cross-user access must never succeed for an object owned by user A.
const res = await request(`/notes/${objectId}`, tokenB);
assert.ok([403, 404].includes(res.status), `cross-user note access returned ${res.status}`);

console.log('authorization matrix: PASS');
