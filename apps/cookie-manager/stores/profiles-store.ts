import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Profile } from '../lib/profiles/types';
import { insertProfile, getAllProfiles, deleteProfileDb } from '../lib/profiles/db';
import { encryptJson, decryptJson } from '../lib/profiles/crypto';
import { setCookie, removeCookie } from '../lib/cookies/write';
import { cookieUrl, cookieId } from '../lib/cookies/keys';
import { getCookiesForUrl, getPartitionedCookiesForUrl } from '../lib/cookies/read';
import { loadRules, isProtected } from '../lib/rules/rules';
import { cookiesStore } from './cookies-store';
import { entitlementStore } from './entitlement-store';
import { canSaveProfile, FREE_PROFILE_LIMIT } from '../lib/pay/plan';
import type { CookieAttrs } from '../lib/cookie-types';

interface ProfilesState {
  profiles: Profile[];
  busy: boolean;
  error: string | null;
  load: () => Promise<void>;
  /** Resolves true if the profile was written; false if refused (free limit, no site) or failed. */
  save: (name: string, passphrase?: string) => Promise<boolean>;
  apply: (id: string, opts?: { passphrase?: string; replace?: boolean }) => Promise<{ applied: number; failed: number; removed: number }>;
  remove: (id: string) => Promise<void>;
}

async function cookiesOf(profile: Profile, passphrase?: string): Promise<CookieAttrs[]> {
  if (!profile.encrypted) return profile.cookies ?? [];
  if (!profile.blob) return [];
  if (!passphrase) throw new Error('This profile is encrypted — a passphrase is required.');
  return decryptJson<CookieAttrs[]>(profile.blob, passphrase);
}

export const profilesStore = createStore<ProfilesState>((set, get) => ({
  profiles: [],
  busy: false,
  error: null,
  load: async () => {
    try {
      const profiles = await getAllProfiles();
      profiles.sort((a, b) => b.createdAt - a.createdAt);
      set({ profiles });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },
  save: async (name, passphrase) => {
    set({ busy: true, error: null });
    const refuse = async (): Promise<false> => {
      set({ error: `Free includes ${FREE_PROFILE_LIMIT} profile. Unlock Pro to save more and switch between them.` });
      await get().load(); // the refusal may be due to a profile saved in another panel — show it
      return false;
    };
    try {
      const { activeUrl } = cookiesStore.getState();
      if (!activeUrl) {
        set({ error: 'Open Bokal on a site to save its cookies.' });
        return false;
      }
      const entitled = entitlementStore.getState().entitled;
      // Early check, so a free user at the limit hears at once rather than after ~1s of key
      // derivation. The binding check is insertProfile's, which is atomic across panels.
      if (!canSaveProfile((await getAllProfiles()).length, entitled)) return await refuse();
      // Capture what is on the site, not what the list happens to show: partitioned (CHIPS) cookies
      // are included even when the list hides them, and the All-cookies view never turns a profile
      // into a copy of the whole browser.
      const seen = new Set<string>();
      const cookies = [...(await getCookiesForUrl(activeUrl)), ...(await getPartitionedCookiesForUrl(activeUrl))].filter((c) => {
        const id = cookieId(c);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      const base: Profile = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        site: activeUrl,
        encrypted: Boolean(passphrase),
      };
      const profile: Profile = passphrase
        ? { ...base, blob: await encryptJson(cookies, passphrase) }
        : { ...base, cookies };
      if (!(await insertProfile(profile, entitled ? undefined : FREE_PROFILE_LIMIT))) return await refuse();
      await get().load();
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    } finally {
      set({ busy: false });
    }
  },
  apply: async (id, opts) => {
    set({ busy: true, error: null });
    try {
      const profile = get().profiles.find((p) => p.id === id);
      if (!profile) throw new Error('Profile not found');
      const cookies = await cookiesOf(profile, opts?.passphrase);
      let removed = 0;
      if (opts?.replace) {
        // Clear existing cookies for every URL this profile touches, then apply — a true restore.
        // Best-effort: removes existing cookies for the profile's URLs, then sets. A partial set-failure leaves those cookies cleared with no rollback (reported as failed).
        // Protected cookies are never removed, even on a replace (data-layer protect invariant).
        const rules = await loadRules();
        const urls = [...new Set(cookies.map((c) => cookieUrl(c)))];
        for (const url of urls) {
          for (const existing of await getCookiesForUrl(url)) {
            if (isProtected(rules, existing)) continue;
            try {
              await removeCookie(existing);
              removed += 1;
            } catch {
              /* best effort */
            }
          }
        }
      }
      let applied = 0;
      let failed = 0;
      for (const c of cookies) {
        try {
          await setCookie(c);
          applied += 1;
        } catch {
          failed += 1;
        }
      }
      await cookiesStore.getState().refresh();
      return { applied, failed, removed };
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return { applied: 0, failed: 0, removed: 0 };
    } finally {
      set({ busy: false });
    }
  },
  remove: async (id) => {
    try {
      await deleteProfileDb(id);
      await get().load();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },
}));

export function useProfiles<T>(sel: (s: ProfilesState) => T): T {
  return useStore(profilesStore, sel);
}
