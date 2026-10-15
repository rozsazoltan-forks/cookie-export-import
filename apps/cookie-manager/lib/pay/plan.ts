// What the free tier includes and what Pro costs — the one place the panel learns either.
//
// The prices are shown BEFORE any click, so they cannot come from ExtPay: free users make no
// network calls. They must match the live plans at
// https://extensionpay.com/extension/bokal-test/api/v2/current-plans — change both together.

/** Saved cookie profiles a free user may hold. The second profile is the upgrade moment. */
export const FREE_PROFILE_LIMIT = 1;

export const PRICES = { lifetime: '$29.99', monthly: '$4.99', yearly: '$19.99' } as const;

/** Whether one more profile may be saved. Lapsed-Pro users keep what they have but cannot add. */
export function canSaveProfile(count: number, entitled: boolean): boolean {
  return entitled || count < FREE_PROFILE_LIMIT;
}

export function priceLine(): string {
  return `${FREE_PROFILE_LIMIT} profile free. Unlimited with Pro — ${PRICES.lifetime} once, or ${PRICES.monthly}/month.`;
}
