// Remembers that the user opened Cookie profiles, so a free user's saved profile is on screen the
// next time the panel opens instead of behind another click. Opening loads the profiles chunk
// (IndexedDB, Web Crypto) — local only; it makes no network calls.
const KEY = 'bokal:profilesOpen';

export async function getProfilesOpen(): Promise<boolean> {
  const r = await chrome.storage.local.get(KEY);
  return r[KEY] === true;
}

export async function setProfilesOpen(): Promise<void> {
  await chrome.storage.local.set({ [KEY]: true });
}
