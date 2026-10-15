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

const reads = vi.hoisted(() => ({
  site: [] as unknown[],
  partitioned: [] as unknown[],
}));
vi.mock('../lib/cookies/read', () => ({
  getCookiesForUrl: async () => reads.site,
  getPartitionedCookiesForUrl: async () => reads.partitioned,
  getAllCookies: async () => [],
  getActiveTabUrl: async () => 'https://example.com/',
  setInspectedTab: () => {},
  fromChrome: (c: unknown) => c,
}));

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
  cookiesStore.setState({ cookies: [COOKIE], activeUrl: 'https://example.com/', scope: 'site', showPartitioned: false });
  reads.site = [COOKIE];
  reads.partitioned = [];
});

const PARTITIONED = { ...COOKIE, name: '__Host-auth', partitionKey: { topLevelSite: 'https://example.com' } };
const OTHER_SITE = { ...COOKIE, name: 'tracker', domain: 'other.example' };

describe('profiles store — what a profile captures', () => {
  // A login can live in a partitioned (CHIPS) cookie. Restoring "the site" must include it, whether
  // or not the user happened to tick "Show partitioned" in the list.
  it("captures the site's partitioned cookies even when the list is not showing them", async () => {
    reads.partitioned = [PARTITIONED];
    await profilesStore.getState().save('admin');
    const [p] = await getAllProfiles();
    expect(p!.cookies!.map((c) => c.name).sort()).toEqual(['__Host-auth', 'sid']);
  });

  // "Save this site's cookies" — not the whole browser, even from the All-cookies view.
  it("captures only the active site's cookies when the list is showing all sites", async () => {
    cookiesStore.setState({ scope: 'all', cookies: [COOKIE, OTHER_SITE] });
    await profilesStore.getState().save('admin');
    const [p] = await getAllProfiles();
    expect(p!.cookies!.map((c) => c.name)).toEqual(['sid']);
  });

  it('refuses to save with no active site, and writes nothing', async () => {
    cookiesStore.setState({ activeUrl: null });
    expect(await profilesStore.getState().save('admin')).toBe(false);
    expect(await getAllProfiles()).toHaveLength(0);
    expect(profilesStore.getState().error).toMatch(/site/i);
  });
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
    expect(await profilesStore.getState().save('admin')).toBe(true);
    expect(await profilesStore.getState().save('test-user-2')).toBe(false);
    expect((await getAllProfiles()).map((p) => p.name)).toEqual(['admin']);
    expect(profilesStore.getState().error).toMatch(/pro/i);
  });

  // The side panel and the DevTools panel share one IndexedDB: two saves at once must not both fit.
  it('admits only one of two simultaneous saves at the free limit', async () => {
    await Promise.all([profilesStore.getState().save('a'), profilesStore.getState().save('b')]);
    expect(await getAllProfiles()).toHaveLength(1);
  });

  // A refusal caused by a profile saved elsewhere must also bring this panel's list up to date.
  it('reloads the list when it refuses, so a stale panel shows what is really stored', async () => {
    await putProfile({ id: 'x', name: 'saved-elsewhere', createdAt: 1, encrypted: false, cookies: [] });
    await profilesStore.getState().save('another');
    expect(profilesStore.getState().profiles.map((p) => p.name)).toEqual(['saved-elsewhere']);
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

  // If Pro lapses, the user keeps their data: existing profiles can still be removed (apply is
  // covered by the panel test — its Apply button stays enabled above the limit).
  it('still lets a lapsed Pro user delete profiles above the free limit', async () => {
    const mk = (id: string): Profile => ({ id, name: id, createdAt: 1, encrypted: false, cookies: [] });
    await putProfile(mk('a')); await putProfile(mk('b')); await putProfile(mk('c'));
    await profilesStore.getState().load();
    await profilesStore.getState().remove('b');
    expect((await getAllProfiles()).map((p) => p.id).sort()).toEqual(['a', 'c']);
  });
});
