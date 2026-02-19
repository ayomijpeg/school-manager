import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from './rateLimit';

function mockRequest(ip = '192.168.1.1'): Request {
  return new Request('http://localhost/api/auth/login', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('rateLimit', () => {
  beforeEach(() => {
    // Rate limit store is in-memory; rapid successive tests may share state.
    // We use a unique IP per test to avoid cross-test limits.
  });

  it('allows first request', () => {
    const res = checkRateLimit(mockRequest('10.0.0.1'));
    expect(res.ok).toBe(true);
  });

  it('allows requests under the limit', () => {
    const req = mockRequest('10.0.0.2');
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(req);
      expect(res.ok).toBe(true);
    }
  });
});
