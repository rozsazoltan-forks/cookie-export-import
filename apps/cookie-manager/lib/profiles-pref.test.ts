import { describe, it, expect, beforeEach } from 'vitest';
import { getProfilesOpen, setProfilesOpen } from './profiles-pref';

const store: Record<string, unknown> = {};
(globalThis as unknown as { chrome: unknown }).chrome = {
  storage: {
    local: {
      get: async (k: string) => (k in store ? { [k]: store[k] } : {}),
      set: async (o: Record<string, unknown>) => { Object.assign(store, o); },
    },
  },
};

beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

describe('profiles section preference', () => {
  it('starts closed for a new user', async () => {
    expect(await getProfilesOpen()).toBe(false);
  });

  it('remembers that the user opened profiles, so their saved profile is there next time', async () => {
    await setProfilesOpen();
    expect(await getProfilesOpen()).toBe(true);
  });
});
