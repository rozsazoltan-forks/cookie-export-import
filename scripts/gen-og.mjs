// Open Graph card generator — 1200x630 social preview images for bokal.dev.
//
// The site previously pointed og:image at icon-128.png. At 128px most platforms
// (X, LinkedIn, Slack, Facebook) render no card at all, so every shared link
// posted bare. These are the replacements.
//
//   node scripts/gen-og.mjs      -> site/og/*.png
//
// Deliberately lives at the repo root, NOT under apps/cookie-manager/scripts,
// so generating marketing assets never touches the extension package.

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// @playwright/test is a devDependency of the extension workspace, not the root. Resolve it from
// there rather than adding a root dependency — this script must not modify apps/cookie-manager.
const here = dirname(fileURLToPath(import.meta.url));
const req = createRequire(join(here, '..', 'apps', 'cookie-manager', 'package.json'));
const { chromium } = req('@playwright/test');

const outDir = join(here, '..', 'site', 'og');
mkdirSync(outDir, { recursive: true });

const GRAPHITE = '#1E2226';
const CARD = '#24282C';
const DEEP = '#191C1F';
const AMBER = '#E9A83E';
const CHIP = '#B67A22';
const FG = '#EDECE8';
const MUTED = '#A9AFB5';

const mark = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="${CARD}"/>
  <circle cx="64" cy="64" r="45" fill="${AMBER}"/>
  <rect x="18" y="99" width="92" height="16" fill="${CARD}"/>
  <g fill="${CHIP}">
    <rect x="40" y="40" width="9" height="9" rx="2"/><rect x="70" y="40" width="9" height="9" rx="2"/>
    <rect x="55" y="58" width="9" height="9" rx="2"/><rect x="80" y="62" width="9" height="9" rx="2"/>
    <rect x="46" y="74" width="9" height="9" rx="2"/><rect x="68" y="80" width="9" height="9" rx="2"/>
  </g>
</svg>`;

const card = ({ eyebrow, title, sub, chips }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; background: ${GRAPHITE}; color: ${FG};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px 72px; position: relative; overflow: hidden;
  }
  .glow { position: absolute; top: -280px; right: -220px; width: 720px; height: 720px;
          background: radial-gradient(circle, rgba(233,168,62,0.16) 0%, rgba(233,168,62,0) 68%); }
  .top { display: flex; align-items: center; gap: 16px; position: relative; }
  .top .name { font-size: 30px; font-weight: 650; letter-spacing: -0.01em; }
  .eyebrow { color: ${AMBER}; font-size: 20px; font-weight: 650;
             text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 18px; }
  .mid { position: relative; }
  h1 { font-size: 62px; line-height: 1.08; letter-spacing: -0.025em; max-width: 940px; }
  .sub { color: ${MUTED}; font-size: 27px; line-height: 1.4; margin-top: 22px; max-width: 900px; }
  .bottom { display: flex; align-items: center; justify-content: space-between; position: relative; }
  .chips { display: flex; gap: 12px; flex-wrap: wrap; }
  .chip { background: ${CARD}; border: 1px solid #33383D; border-radius: 999px;
          padding: 9px 20px; font-size: 20px; color: ${FG}; }
  .url { color: ${MUTED}; font-size: 23px; }
  .rule { height: 5px; width: 132px; background: ${AMBER}; border-radius: 3px; margin-bottom: 30px; position: relative; }
</style></head><body>
  <div class="glow"></div>
  <div class="top">${mark(52)}<span class="name">Bokal</span></div>
  <div class="mid">
    <div class="rule"></div>
    ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
    <h1>${title}</h1>
    ${sub ? `<div class="sub">${sub}</div>` : ''}
  </div>
  <div class="bottom">
    <div class="chips">${(chips || []).map((c) => `<span class="chip">${c}</span>`).join('')}</div>
    <span class="url">bokal.dev</span>
  </div>
</body></html>`;

const cards = [
  ['og-default', {
    title: 'Every cookie, under your control.',
    sub: 'An open-source cookie manager for Chrome. Nothing leaves your device.',
    chips: ['No <b style="color:#E9A83E">tabs</b> permission', 'No telemetry', 'GPL-3.0'],
  }],
  ['og-editthiscookie', {
    eyebrow: 'EditThisCookie alternative',
    title: 'The open-source successor.',
    sub: 'EditThisCookie was delisted in 2024 and a copycat stole its name. Bokal reads its JSON exports.',
    chips: ['Manifest V3', 'Imports your old JSON', 'GPL-3.0'],
  }],
  ['og-cookie-editor', {
    eyebrow: 'Bokal vs Cookie-Editor',
    title: 'An honest comparison.',
    sub: 'Both are GPL-3.0. Both are MV3. Here is what actually differs — and where Cookie-Editor wins.',
    chips: ['No browsing-history warning', 'CHIPS inspector', 'Playwright export'],
  }],
  ['og-httponly', {
    eyebrow: 'How-to',
    title: 'Edit <span style="color:#E9A83E">HttpOnly</span> cookies in Chrome.',
    sub: 'JavaScript cannot see them. DevTools can, awkwardly. Here is the fast way.',
    chips: ['HttpOnly', 'Secure', 'SameSite'],
  }],
  ['og-cookies-txt', {
    eyebrow: 'How-to',
    title: 'Export <span style="color:#E9A83E">cookies.txt</span> from Chrome.',
    sub: 'Netscape format for curl, wget and yt-dlp — straight out of the browser.',
    chips: ['Netscape format', 'curl --cookie', 'yt-dlp'],
  }],
  ['og-playwright', {
    eyebrow: 'How-to',
    title: 'Export cookies as Playwright <span style="color:#E9A83E">storageState</span>.',
    sub: 'Log in once by hand. Reuse the session in your suite. Skip scripting the login flow.',
    chips: ['storageState', 'addCookies', 'Puppeteer setCookie'],
  }],
];

// Prefer the system Chrome so this works without a `playwright install` browser download.
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch {
  browser = await chromium.launch(); // falls back to Playwright's bundled chromium if present
}
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [name, spec] of cards) {
  await page.setContent(card(spec), { waitUntil: 'load' });
  await page.screenshot({ path: join(outDir, `${name}.png`) });
  console.log(`  ${name}.png  1200x630`);
}
await browser.close();
console.log('OG cards written to site/og/');
