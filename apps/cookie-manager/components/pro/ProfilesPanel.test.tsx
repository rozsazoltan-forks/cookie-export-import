import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';

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
