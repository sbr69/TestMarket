export type CheckoutIntentState = {
  id?: string;
  confirmedAt?: Date | null;
  expiresAt?: Date | null;
} | null | undefined;

export function validateCheckoutConfirmation(intent: CheckoutIntentState, { isSimulatedPayment, now = new Date() }: { isSimulatedPayment: boolean; now?: Date } = { isSimulatedPayment: false }) {
  if (!intent || intent.confirmedAt) return { ok: false, code: 'INVALID_CHECKOUT' as const };
  // A real payment is independently verified before this policy runs. It must
  // settle exactly once even if the API callback arrives after quote expiry.
  if (isSimulatedPayment && intent.expiresAt && intent.expiresAt < now) return { ok: false, code: 'INVALID_CHECKOUT' as const };
  return { ok: true as const };
}

export function assertCheckoutClaimed(count: number) {
  if (count !== 1) throw new Error('INVALID_CHECKOUT');
}

