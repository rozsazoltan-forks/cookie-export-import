import { describe, it, expect } from 'vitest';
import { FREE_PROFILE_LIMIT, canSaveProfile, PRICES, priceLine } from './plan';

describe('plan', () => {
  it('gives free users exactly one profile', () => {
    expect(FREE_PROFILE_LIMIT).toBe(1);
  });

  it('lets a free user save their first profile', () => {
    expect(canSaveProfile(0, false)).toBe(true);
  });

  it('stops a free user at the limit — the second profile is the upgrade moment', () => {
    expect(canSaveProfile(1, false)).toBe(false);
  });

  // A lapsed Pro user can keep more than the free allowance; they just cannot add to it.
  it('stops a free user who already holds more than the limit', () => {
    expect(canSaveProfile(3, false)).toBe(false);
  });

  it('never limits an entitled user', () => {
    expect(canSaveProfile(0, true)).toBe(true);
    expect(canSaveProfile(250, true)).toBe(true);
  });

  // These are shown before any click and must match the live ExtPay plans, which the panel cannot
  // fetch (free users make no network calls). Changing a price means changing it in BOTH places.
  it('carries the live ExtPay prices', () => {
    expect(PRICES).toEqual({ lifetime: '$29.99', monthly: '$4.99', yearly: '$19.99' });
  });

  it('states the free allowance and the price in one line', () => {
    expect(priceLine()).toBe('1 profile free. Unlimited with Pro — $29.99 once, or $4.99/month.');
  });
});
