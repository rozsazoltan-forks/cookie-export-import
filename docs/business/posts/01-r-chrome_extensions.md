# r/chrome_extensions — Day 1, flagship

> **Gate / rules:** No karma/age/flair gate. Only hard rule: don't blast the same post across many subs the same day (Rule 4 -> reported to admins). Highest-fit venue: the room full of displaced EditThisCookie users.

> Paste-ready. Verified against Bokal's source AND Cookie-Editor's published manifest, 2026-08-26. Do NOT claim Edge availability.

---

**Title:** Bokal — an open-source MV3 cookie manager with no install-time host permissions (maker here)

**Body:**

I'm the maker. Bokal is a cookie manager for Chrome, and the reason it exists is the permission model, so I'll lead with that and paste the actual manifest.

Published build:

    permissions: ['cookies', 'storage', 'sidePanel', 'unlimitedStorage', 'alarms', 'activeTab']
    optional_host_permissions: ['<all_urls>']
    // no host_permissions
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" }

What that means, precisely:
- **No `tabs` permission.**
- **No host permissions at install.** `<all_urls>` is present only as an *optional* grant — the set Bokal may request, not something granted on install. By default it requests just the active origin (`activeTab` reads the current URL after your toolbar click, then it asks Chrome for that one site). All-sites is a separate, explicit opt-in.
- **A per-site grant persists** until you revoke it (`chrome://extensions` → Details → Site access), and while granted it's a standing permission for that one origin. I'd rather own that than imply it's more ephemeral than it is.
- **No remote code** — everything runs from the bundled package (`script-src 'self'`).
- The only external service it ever contacts is ExtensionPay, for the Pro license check, and only after you open the upgrade page. The service worker deliberately doesn't start ExtPay on load (`entrypoints/background.ts`), and a test asserts a free user makes zero ExtPay calls (`lib/pay/paid-flow.test.ts`). Verify it yourself in DevTools → Network.
- GPL-3.0, so all of the above is checkable, not just claimed.

**Where this does and doesn't beat Cookie-Editor — because someone will check, and they should.** Cookie-Editor is the ~2M-user incumbent here, it's **also GPL-3.0**, and it's used `optional_host_permissions` since August 2023. So "open source" and "no install-time host access" do *not* separate us; I pulled its manifest before posting rather than let that be the top comment. Three things actually differ:

1. **It requests `tabs`; Bokal uses `activeTab`.** `tabs` is what triggers Chrome's **"Read your browsing history"** line on the install screen. Visible before you install either one.
2. **CHIPS partitioned cookies** — Bokal ships a partition inspector; Cookie-Editor's code has no `partitionKey` handling.
3. **Playwright `storageState` / `addCookies` and Puppeteer `setCookie` export** — Cookie-Editor has none.

If none of those three matter to you, Cookie-Editor is a good tool and I'd honestly rather you keep using it than switch for no reason.

Why I bothered: EditThisCookie was delisted back in Dec 2024 (most plausibly a failed MV3 migration; [gHacks](https://www.ghacks.net/2024/12/31/google-chrome-legit-editthiscookie-extension-removed-instead-of-malicious-copycat/) — no official reason from Google), and a [copycat](https://cybersecuritynews.com/malicious-editthiscookie-chrome-extension/) then took the name and was caught harvesting credentials/tokens and phishing. For a tool that by definition handles your session cookies, I wanted one that's narrow-by-default and fully auditable.

**Feature-wise (all free):** full cookie CRUD including HttpOnly, search/filter, export (JSON, Netscape, cookie-header, Playwright `storageState` / `addCookies`, Puppeteer `setCookie`) and import (JSON — incl. Cookie-Editor / EditThisCookie and Playwright/Puppeteer arrays — plus header strings and Netscape `cookies.txt`), protect/pin/block rules, whitelist cleanup, CHIPS partitioned-cookie inspector, DevTools panel, dark mode, virtualized lists.

**Paywall, disclosed upfront:** one paid feature ("Bokal Pro") — named local cookie profiles (snapshot a site's cookies and restore a saved set into the live session in one click, e.g. test accounts, with optional AES-GCM encryption, 100% local in IndexedDB). $4.99/mo, $19.99/yr, $29.99 one-time. Pro is GPL too — you could fork out the check; I'm not relying on license lock-in.

Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
Source: https://github.com/yuvibabbar-dev/bokal
Site: https://bokal.dev

Happy to get into the manifest, the optional-host-permission flow, or the CHIPS handling — critical feedback welcome.

---
