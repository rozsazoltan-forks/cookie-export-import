import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.hoisted(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { id: 'bokal-test-suite' },
    storage: {
      local: { get: async () => ({}), set: async () => {} },
      onChanged: { addListener: () => {} },
    },
  };
});

import { ProfilesSection } from './ProfilesSection';
import { entitlementStore } from '../stores/entitlement-store';

beforeEach(() => {
  cleanup();
  entitlementStore.setState({ entitled: false, loading: false, upgradeError: null });
});

describe('ProfilesSection (what a free user sees of Pro)', () => {
  it('says what profiles are before asking for anything', () => {
    const { container } = render(<ProfilesSection open={false} onOpen={() => {}} />);
    expect(container.textContent).toMatch(/switch between/i);
    expect(container.textContent).toMatch(/HttpOnly/);
  });

  // The old paywall showed no price until the user had left for an external checkout page.
  it('shows the free allowance and the price before any click', () => {
    const { container } = render(<ProfilesSection open={false} onOpen={() => {}} />);
    expect(container.textContent).toContain('1 profile free');
    expect(container.textContent).toContain('$29.99 once');
  });

  it('opens the profiles panel when asked', () => {
    const onOpen = vi.fn();
    const { getByRole } = render(<ProfilesSection open={false} onOpen={onOpen} />);
    getByRole('button', { name: /open profiles/i }).click();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('renders the panel in place of the teaser once open', () => {
    const { getByText, queryByRole } = render(
      <ProfilesSection open onOpen={() => {}}><div>the panel</div></ProfilesSection>,
    );
    expect(getByText('the panel')).toBeTruthy();
    expect(queryByRole('button', { name: /open profiles/i })).toBeNull();
  });

  it('keeps the upgrade and restore paths available, open or closed', () => {
    for (const open of [false, true]) {
      cleanup();
      const { getByRole } = render(<ProfilesSection open={open} onOpen={() => {}} />);
      expect(getByRole('button', { name: /unlock pro/i })).toBeTruthy();
      expect(getByRole('button', { name: /restore/i })).toBeTruthy();
    }
  });

  it('is the anchor the header chip scrolls to', () => {
    const { container } = render(<ProfilesSection open={false} onOpen={() => {}} />);
    expect(container.querySelector('#profiles')).not.toBeNull();
  });
});
