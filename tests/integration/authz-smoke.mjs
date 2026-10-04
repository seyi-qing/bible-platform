import assert from 'node:assert/strict';

const base = (process.env.API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const userA = { email: `a-${suffix}@example.test`, password: 'TestPassword!123', name: 'Test A' };
const userB = { email: `b-${suffix}@example.test`, password: 'TestPassword!123', name: 'Test B' };

async function json(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { res, body };
}

async function register(user) {
  const { res, body } = await json('/auth/register', { method: 'POST', body: JSON.stringify(user) });
  assert.equal(res.status, 201, JSON.stringify(body));
  return body;
}

const a = await register(userA);
const b = await register(userB);
assert.ok(a.accessToken && a.refreshToken);
assert.ok(b.accessToken && b.refreshToken);

const adminOverviewAnonymous = await fetch(`${base}/admin/overview`);
assert.equal(adminOverviewAnonymous.status, 401);

const plan = await json('/plans', {
  method: 'POST',
  headers: { authorization: `Bearer ${a.accessToken}` },
  body: JSON.stringify({ title: `Private plan ${suffix}`, totalDays: 3, isPublic: false }),
});
assert.equal(plan.res.status, 201, JSON.stringify(plan.body));

const foreign = await json(`/plans/${plan.body.id}`, {
  method: 'GET',
  headers: { authorization: `Bearer ${b.accessToken}` },
});
assert.ok([403, 404].includes(foreign.res.status), `unexpected status ${foreign.res.status}`);

const refresh = await json('/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: a.refreshToken }),
});
assert.equal(refresh.res.status, 200, JSON.stringify(refresh.body));

const rotatedReuse = await json('/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: a.refreshToken }),
});
assert.ok([401, 403].includes(rotatedReuse.res.status), `refresh reuse status ${rotatedReuse.res.status}`);

console.log('integration authorization smoke: PASS');
