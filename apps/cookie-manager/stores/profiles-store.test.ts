import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// entitlement-store (read by save) pulls in extpay → webextension-polyfill, which refuses to load
// outside an extension unless chrome.runtime.id exists. Fake just enough, before the hoisted imports.
vi.hoisted(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { id: 'bokal-test-suite' },
    storage: {
      local: { get: async () => ({}), set: async () => {} },
      onChanged: { addListener: () => {} },
    },
  };
});

import { profilesStore } from './profiles-store';
import { entitlementStore } from './entitlement-store';
import { cookiesStore } from './cookies-store';
import { getAllProfiles, deleteProfileDb, putProfile } from '../lib/profiles/db';
import type { Profile } from '../lib/profiles/types';

const COOKIE = { name: 'sid', value: 'abc', domain: 'example.com', path: '/', secure: true, httpOnly: true, sameSite: 'lax' as const, hostOnly: true };

beforeEach(async () => {
  for (const p of await getAllProfiles()) await deleteProfileDb(p.id);
  profilesStore.setState({ profiles: [], busy: false, error: null });
  entitlementStore.setState({ entitled: false, loading: false, upgradeError: null });
  cookiesStore.setState({ cookies: [COOKIE], activeUrl: 'https://example.com/' });
});

describe('profiles store — the free allowance is enforced where profiles are written', () => {
  it('lets a free user save their first profile', async () => {
    await profilesStore.getState().save('admin');
    expect((await getAllProfiles()).map((p) => p.name)).toEqual(['admin']);
    expect(profilesStore.getState().error).toBeNull();
  });

  it('lets a free user encrypt that profile — the safer option is not a paid feature', async () => {
    await profilesStore.getState().save('admin', 'a passphrase');
    const [p] = await getAllProfiles();
    expect(p!.encrypted).toBe(true);
  });

  it('refuses a second profile for a free user, writes nothing, and says why', async () => {
    await profilesStore.getState().save('admin');
    await profilesStore.getState().save('test-user-2');
    expect((await getAllProfiles()).map((p) => p.name)).toEqual(['admin']);
    expect(profilesStore.getState().error).toMatch(/pro/i);
  });

  // Counts what is actually stored, not the in-memory list, so a panel that never called load()
  // cannot slip a second profile past the limit.
  it('counts stored profiles even when the in-memory list is stale', async () => {
    await putProfile({ id: 'x', name: 'existing', createdAt: 1, encrypted: false, cookies: [] });
    profilesStore.setState({ profiles: [] });
    await profilesStore.getState().save('another');
    expect((await getAllProfiles()).map((p) => p.name)).toEqual(['existing']);
  });

  it('never limits a Pro user', async () => {
    entitlementStore.setState({ entitled: true });
    await profilesStore.getState().save('admin');
    await profilesStore.getState().save('test-user-2');
    await profilesStore.getState().save('test-user-3');
    expect(await getAllProfiles()).toHaveLength(3);
  });

  // If Pro lapses, the user keeps their data: existing profiles can still be removed (and applied).
  it('still lets a lapsed Pro user delete profiles above the free limit', async () => {
    const mk = (id: string): Profile => ({ id, name: id, createdAt: 1, encrypted: false, cookies: [] });
    await putProfile(mk('a')); await putProfile(mk('b')); await putProfile(mk('c'));
    await profilesStore.getState().load();
    await profilesStore.getState().remove('b');
    expect((await getAllProfiles()).map((p) => p.id).sort()).toEqual(['a', 'c']);
  });
});
