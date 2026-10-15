import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { putProfile, getAllProfiles, deleteProfileDb, insertProfile } from './db';
import type { Profile } from './types';

function p(id: string): Profile {
  return { id, name: `p-${id}`, createdAt: 1, encrypted: false, cookies: [] };
}

describe('profiles db', () => {
  it('put + getAll round-trips', async () => {
    await putProfile(p('a'));
    await putProfile(p('b'));
    const all = await getAllProfiles();
    expect(all.map((x) => x.id).sort()).toEqual(['a', 'b']);
  });
  it('delete removes a profile', async () => {
    await putProfile(p('c'));
    await deleteProfileDb('a');
    const all = await getAllProfiles();
    expect(all.some((x) => x.id === 'a')).toBe(false);
  });
});

describe('insertProfile (count and write in one transaction)', () => {
  it('refuses when the store already holds `limit` profiles', async () => {
    for (const x of await getAllProfiles()) await deleteProfileDb(x.id);
    expect(await insertProfile(p('one'), 1)).toBe(true);
    expect(await insertProfile(p('two'), 1)).toBe(false);
    expect((await getAllProfiles()).map((x) => x.id)).toEqual(['one']);
  });

  it('lets exactly one of two concurrent inserts through at the limit', async () => {
    for (const x of await getAllProfiles()) await deleteProfileDb(x.id);
    const results = await Promise.all([insertProfile(p('x'), 1), insertProfile(p('y'), 1)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await getAllProfiles()).toHaveLength(1);
  });

  it('has no limit when none is given', async () => {
    for (const x of await getAllProfiles()) await deleteProfileDb(x.id);
    for (const id of ['a', 'b', 'c']) expect(await insertProfile(p(id))).toBe(true);
    expect(await getAllProfiles()).toHaveLength(3);
  });
});
