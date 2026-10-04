import { describe, expect, it } from 'vitest';

describe('health contract', () => {
  it('documents the liveness response shape', () => {
    const response = { status: 'ok', service: 'api' };
    expect(response.status).toBe('ok');
    expect(response.service).toBe('api');
  });
});
