import assert from 'node:assert/strict';
import test from 'node:test';
import { assertCheckoutClaimed, validateCheckoutConfirmation } from '../server/agentCheckoutPolicy';

test('a real verified Stellar settlement can be confirmed after callback delay', () => {
  const result = validateCheckoutConfirmation({
    id: 'checkout-1',
    expiresAt: new Date('2026-01-01T00:00:00.000Z'),
    confirmedAt: null,
  }, { isSimulatedPayment: false, now: new Date('2026-01-01T00:20:00.000Z') });
  assert.deepEqual(result, { ok: true });
});

test('expired simulated payments and duplicate checkout claims are rejected', () => {
  const expired = validateCheckoutConfirmation({
    id: 'checkout-1',
    expiresAt: new Date('2026-01-01T00:00:00.000Z'),
    confirmedAt: null,
  }, { isSimulatedPayment: true, now: new Date('2026-01-01T00:20:00.000Z') });
  assert.deepEqual(expired, { ok: false, code: 'INVALID_CHECKOUT' });
  assert.deepEqual(validateCheckoutConfirmation({ id: 'checkout-1', confirmedAt: new Date() }, { isSimulatedPayment: false }), { ok: false, code: 'INVALID_CHECKOUT' });
  assert.throws(() => assertCheckoutClaimed(0), /INVALID_CHECKOUT/);
  assert.doesNotThrow(() => assertCheckoutClaimed(1));
});

