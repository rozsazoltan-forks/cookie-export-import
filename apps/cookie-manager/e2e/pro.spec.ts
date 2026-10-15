import { test, expect } from './fixtures';
import type { BrowserContext } from '@playwright/test';
import { createServer, type Server } from 'node:http';

// End-to-end for the paid tier, in a real browser, through the REAL ExtPayBilling adapter.
//
// We do not fake entitlement by writing the cache — that would skip the very code we need to trust.
// Instead we mock the extensionpay.com BACKEND and let the real adapter do its real work: create an
// API key, open the payment page, poll for the purchase, parse `paid`, write the cache, and unlock.
// That is the same sequence a live Stripe checkout produces, so this exercises the M12 billing
// integration end-to-end without needing a registered ExtPay app or a real card.
//
// It also pins down two invariants that only a real browser run can show:
//   1. The profiles chunk is genuinely lazy — fetched only once the user is entitled or opens
//      Profiles (1.2.0 gives free users one profile).
//   2. A WRONG PASSPHRASE CANNOT DESTROY COOKIES. apply() decrypts before it removes anything, so a
//      failed decrypt must leave the cookie jar untouched (the invariant behind the M9 Critical).

const PORT = 39519;
const ORIGIN = `http://localhost:${PORT}`;
const PASS = 'correct horse battery staple';

let server: Server;

test.beforeAll(async () => {
  server = createServer((_req, res) => {
    res.setHeader('Set-Cookie', 'e2e_session=abc123; Path=/; SameSite=Lax');
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><meta charset="utf-8"><title>Bokal E2E</title><h1>bokal e2e fixture</h1>');
  });
  await new Promise<void>((resolve) => server.listen(PORT, '127.0.0.1', resolve));
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

/** Stand in for the extensionpay.com backend. `state.paid` flips when the "purchase" completes. */
async function mockExtPay(context: BrowserContext, state: { paid: boolean }): Promise<void> {
  await context.route(/extensionpay\.com/, async (route) => {
    const url = route.request().url();
    const json = (body: unknown): Promise<void> =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

    if (url.includes('/api/new-key')) return json('e2e-api-key');
    if (url.includes('/api/v2/user')) {
      const now = new Date().toISOString();
      return json({
        paid: state.paid,
        paidAt: state.paid ? now : null,
        installedAt: now,
        trialStartedAt: null,
      });
    }
    // The checkout page ExtPay opens in a tab (stands in for Stripe's hosted form).
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>mock checkout</h1>' });
  });
}

test('Pro: the real purchase flow unlocks Pro and lazily loads the Pro chunk', async ({ context, extensionId }) => {
  test.skip(!process.env.BOKAL_E2E, 'needs the granted build (build:e2e + BOKAL_E2E=1)');

  const billing = { paid: false };
  await mockExtPay(context, billing);

  const panel = await context.newPage();
  // Resource Timing never lists extension modules, but Playwright's request events do.
  const profilesChunkFetches: string[] = [];
  panel.on('request', (r) => { if (r.url().includes('/chunks/ProfilesPanel-')) profilesChunkFetches.push(r.url()); });
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  // Free state: the Profiles section explains the feature and shows the price before any click,
  // and the profiles panel is NOT in the DOM (chunk not fetched until the user opens it).
  await expect(panel.getByRole('button', { name: /unlock pro/i })).toBeVisible({ timeout: 15_000 });
  await expect(panel.locator('#profiles')).toContainText('$29.99 once');
  await expect(panel.getByPlaceholder('Profile name')).toHaveCount(0);
  expect(profilesChunkFetches, 'profiles chunk fetched before purchase').toEqual([]);

  // The user clicks Unlock Pro → engagement is recorded, a key is minted, checkout opens, polling starts.
  await panel.getByRole('button', { name: /unlock pro/i }).click();

  // …the purchase completes on the (mocked) payment page.
  billing.paid = true;

  // The bounded poll must notice and unlock without the user reopening the panel — the unlimited
  // panel (no free counter) replaces the Profiles section.
  await expect(panel.getByPlaceholder('Profile name')).toBeVisible({ timeout: 25_000 });
  await expect(panel.getByText(/of 1 free/)).toHaveCount(0);
  await expect(panel.getByRole('button', { name: /unlock pro/i })).toHaveCount(0);
  expect(profilesChunkFetches).toHaveLength(1);
});

test('Pro: encrypted profile snapshots and restores cookies; a wrong passphrase destroys nothing', async ({
  context,
  extensionId,
}) => {
  test.skip(!process.env.BOKAL_E2E, 'needs the granted build (build:e2e + BOKAL_E2E=1)');

  await mockExtPay(context, { paid: true });

  const site = await context.newPage();
  await site.goto(ORIGIN);

  const [sw] = context.serviceWorkers();
  const names = async (): Promise<string[]> =>
    sw!.evaluate(async (url) => (await chrome.cookies.getAll({ url })).map((c) => c.name), ORIGIN);

  // A user who has already bought Pro: engaged, and holding the ExtPay API key that a completed
  // checkout mints. Without the key, ExtPay short-circuits to paid:false and never calls the server.
  await sw!.evaluate(() => chrome.storage.local.set({ 'bokal:proEngaged': true }));
  await sw!.evaluate(() => chrome.storage.sync.set({ extensionpay_api_key: 'e2e-api-key' }));

  const panel = await context.newPage();
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await site.bringToFront();

  await expect(panel.getByPlaceholder('Profile name')).toBeVisible({ timeout: 15_000 });
  await expect(panel.getByText('e2e_session')).toBeVisible();

  // ---- SNAPSHOT: save the site's cookies as an encrypted profile ----
  await panel.getByPlaceholder('Profile name').fill('acct-a');
  await panel.getByRole('checkbox', { name: 'Encrypt' }).check();
  await panel.getByPlaceholder('Passphrase').fill(PASS);
  await panel.getByRole('button', { name: /save current cookies/i }).click();

  const row = panel.locator('li').filter({ hasText: 'acct-a' });
  await expect(row).toBeVisible();
  await expect(row).toContainText('🔒'); // encrypted at rest

  // ---- SAFETY: a WRONG passphrase must not remove a single cookie ----
  expect(await names()).toContain('e2e_session');
  await row.getByRole('button', { name: /^apply$/i }).click(); // encrypted → reveals a passphrase field
  await row.getByPlaceholder('Passphrase').fill('totally-wrong-passphrase');
  await row.getByRole('button', { name: /^apply$/i }).click();

  // apply() decrypts BEFORE it removes, so a failed decrypt must leave the jar untouched.
  await expect
    .poll(names, { timeout: 10_000, message: 'a wrong passphrase deleted cookies — decrypt-before-remove is broken' })
    .toContain('e2e_session');

  // ---- RESTORE: delete the cookie, then apply the profile with the RIGHT passphrase ----
  await sw!.evaluate(async (url) => { await chrome.cookies.remove({ url, name: 'e2e_session' }); }, ORIGIN);
  expect(await names()).not.toContain('e2e_session');

  await row.getByRole('button', { name: /^apply$/i }).click();
  await row.getByPlaceholder('Passphrase').fill(PASS);
  await row.getByRole('button', { name: /^apply$/i }).click();

  // Restored from the encrypted blob.
  await expect.poll(names, { timeout: 10_000 }).toContain('e2e_session');
});

test('Free: one profile, saved and restored, with zero billing contact; the second is the upgrade', async ({
  context,
  extensionId,
}) => {
  test.skip(!process.env.BOKAL_E2E, 'needs the granted build (build:e2e + BOKAL_E2E=1)');

  // Same page-level tripwire as crud.spec (see its caveat about service-worker fetches).
  const extpayHits: string[] = [];
  context.on('request', (r) => {
    if (r.url().includes('extensionpay.com')) extpayHits.push(r.url());
  });

  const site = await context.newPage();
  await site.goto(ORIGIN);
  const [sw] = context.serviceWorkers();
  const names = async (): Promise<string[]> =>
    sw!.evaluate(async (url) => (await chrome.cookies.getAll({ url })).map((c) => c.name), ORIGIN);

  const panel = await context.newPage();
  // Resource Timing never lists extension modules, but Playwright's request events do.
  const profilesChunkFetches: string[] = [];
  panel.on('request', (r) => { if (r.url().includes('/chunks/ProfilesPanel-')) profilesChunkFetches.push(r.url()); });
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await site.bringToFront();
  await expect(panel.getByText('e2e_session')).toBeVisible({ timeout: 15_000 });

  // Until the user opens Profiles, the profiles code (IndexedDB, Web Crypto) is not even fetched.
  expect(profilesChunkFetches, 'profiles chunk fetched before the user opened Profiles').toEqual([]);

  // The header chip opens Profiles in place — it no longer jumps straight to a checkout page.
  await panel.getByRole('button', { name: '★ Pro' }).click();
  await expect(panel.getByText('0 of 1 free')).toBeVisible();
  expect(profilesChunkFetches).toHaveLength(1);

  // Save the free profile (unencrypted path; the encrypted path is covered above).
  await panel.getByPlaceholder('Profile name').fill('admin');
  await panel.getByRole('button', { name: /save current cookies/i }).click();
  const row = panel.locator('li').filter({ hasText: 'admin' });
  await expect(row).toBeVisible();
  await expect(panel.getByText('1 of 1 free')).toBeVisible();

  // The second profile is the upgrade moment: saving is disabled, with the reason on screen.
  await panel.getByPlaceholder('Profile name').fill('test-user-2');
  await expect(panel.getByRole('button', { name: /save current cookies/i })).toBeDisabled();
  await expect(panel.getByText(/Free includes 1 profile/)).toBeVisible();

  // The free profile really restores: delete the cookie, apply, and it is back.
  await sw!.evaluate(async (url) => { await chrome.cookies.remove({ url, name: 'e2e_session' }); }, ORIGIN);
  expect(await names()).not.toContain('e2e_session');
  await row.getByRole('button', { name: /^apply$/i }).click();
  await expect.poll(names, { timeout: 10_000 }).toContain('e2e_session');

  // Reopening the panel shows the saved profile without another click.
  const again = await context.newPage();
  await again.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await site.bringToFront();
  await expect(again.locator('li').filter({ hasText: 'admin' })).toBeVisible({ timeout: 15_000 });

  // PRIVACY: using the free profile never contacted billing, and never marked the user as engaged.
  expect(extpayHits, `free profile flow contacted extensionpay.com: ${extpayHits.join(', ')}`).toEqual([]);
  const engaged = await sw!.evaluate(async () => (await chrome.storage.local.get('bokal:proEngaged'))['bokal:proEngaged']);
  expect(engaged).toBeUndefined();
  // …and no ExtPay instance was constructed (that writes to storage.sync without any request).
  expect(await sw!.evaluate(() => chrome.storage.sync.get(null))).toEqual({});
});
