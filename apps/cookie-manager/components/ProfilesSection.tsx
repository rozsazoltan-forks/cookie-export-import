import type { ReactNode } from 'react';
import { UpgradeButton } from './UpgradeButton';
import { priceLine } from '../lib/pay/plan';

// What a free user sees of Pro. It explains the feature and states the price up front, and it ships
// in the always-loaded bundle — so it must never import lib/profiles (IndexedDB, Web Crypto): the
// panel itself is the lazily loaded `children`, fetched only once the user opens it.
export function ProfilesSection({ open, onOpen, children }: { open: boolean; onOpen: () => void; children?: ReactNode }) {
  return (
    <section id="profiles" style={{ padding: '8px 12px', borderTop: '1px solid var(--bokal-border)' }}>
      {open ? (
        children
      ) : (
        <>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Cookie profiles</div>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--bokal-muted)' }}>
            Save this site&apos;s cookies under a name — &ldquo;admin&rdquo;, &ldquo;test-user-2&rdquo; — and switch between
            logins in one click. Restores HttpOnly and partitioned cookies in place. Stays on this device.
          </p>
          <button type="button" onClick={onOpen} style={{ marginBottom: 8 }}>Open profiles</button>
        </>
      )}
      <div style={{ fontSize: 12, color: 'var(--bokal-muted)', margin: '8px 0 6px' }}>{priceLine()}</div>
      <UpgradeButton />
    </section>
  );
}
