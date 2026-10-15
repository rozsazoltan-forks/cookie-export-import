import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';

vi.hoisted(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { id: 'bokal-test-suite' },
    storage: {
      local: { get: async () => ({}), set: async () => {} },
      onChanged: { addListener: () => {} },
    },
  };
});

import { ProfilesPanel } from './ProfilesPanel';
import { profilesStore } from '../../stores/profiles-store';
import { putProfile, getAllProfiles, deleteProfileDb } from '../../lib/profiles/db';

beforeEach(async () => {
  cleanup();
  for (const p of await getAllProfiles()) await deleteProfileDb(p.id);
  profilesStore.setState({ profiles: [], busy: false, error: null });
});

const saveButton = (q: ReturnType<typeof render>) => q.getByRole('button', { name: /save current cookies/i }) as HTMLButtonElement;

describe('ProfilesPanel', () => {
  it('shows how much of the free allowance is used', async () => {
    const q = render(<ProfilesPanel limit={1} />);
    await waitFor(() => expect(q.container.textContent).toContain('0 of 1 free'));
  });

  it('at the free limit: disables saving and says why, before the user tries', async () => {
    await putProfile({ id: 'a', name: 'admin', createdAt: 1, encrypted: false, cookies: [] });
    const q = render(<ProfilesPanel limit={1} />);
    await waitFor(() => expect(q.container.textContent).toContain('1 of 1 free'));
    q.getByPlaceholderText('Profile name');
    expect(saveButton(q).disabled).toBe(true);
    expect(q.container.textContent).toMatch(/unlock pro/i);
  });

  it('keeps existing profiles usable at the limit (apply and delete)', async () => {
    await putProfile({ id: 'a', name: 'admin', createdAt: 1, encrypted: false, cookies: [] });
    const q = render(<ProfilesPanel limit={1} />);
    await waitFor(() => q.getByText('admin'));
    expect((q.getByRole('button', { name: /^apply$/i }) as HTMLButtonElement).disabled).toBe(false);
    expect(q.getByRole('button', { name: '✕' })).toBeTruthy();
  });

  // A lapsed Pro user can hold more than the allowance; "1 of 1 free" beside three rows would lie.
  it('above the limit, counts what is saved rather than capping the number', async () => {
    for (const id of ['a', 'b', 'c']) await putProfile({ id, name: id, createdAt: 1, encrypted: false, cookies: [] });
    const q = render(<ProfilesPanel limit={1} />);
    await waitFor(() => expect(q.container.textContent).toContain('3 saved · 1 free'));
    expect(q.container.textContent).not.toContain('1 of 1 free');
  });

  it('keeps what the user typed when a save is refused', async () => {
    await putProfile({ id: 'a', name: 'admin', createdAt: 1, encrypted: false, cookies: [] });
    const saveSpy = vi.spyOn(profilesStore.getState(), 'save').mockResolvedValue(false);
    const q = render(<ProfilesPanel />);
    await waitFor(() => q.getByText('admin'));
    const input = q.getByPlaceholderText('Profile name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test-user-2' } });
    fireEvent.click(saveButton(q));
    await waitFor(() => expect(saveSpy).toHaveBeenCalled());
    expect(input.value).toBe('test-user-2');
    saveSpy.mockRestore();
  });

  it('has no limit and no counter for Pro', async () => {
    await putProfile({ id: 'a', name: 'admin', createdAt: 1, encrypted: false, cookies: [] });
    const q = render(<ProfilesPanel />);
    await waitFor(() => q.getByText('admin'));
    expect(q.container.textContent).not.toMatch(/free/);
    // The save button is gated only on a name being typed.
    expect(saveButton(q).disabled).toBe(true);
    expect(q.container.textContent).not.toMatch(/unlock pro/i);
  });
});
