# r/QualityAssurance / r/softwaretesting

> **Gate / rules:** Automation/test-account angle. Pro is relevant here (juggling test-account sessions) but keep it a disclosed footnote, not the lead.

> Paste-ready. Verified against source 2026-08-23. Do NOT claim Edge availability.

---

**Title:** Cookie manager with named local profiles for juggling test accounts + Playwright storageState export (open source, maker here)

**Body:**

I'm the maker of Bokal, a Chrome cookie manager. Posting here specifically because the paid feature was built for a QA problem: **switching between multiple test accounts on the same site without constantly logging in and out.**

The workflow it's meant for:
- Log in as test-account A, snapshot that site's cookies into a named profile
- Do the same for B, C, admin, guest, whatever
- Switch between saved sets in one click — and "switch" restores that cookie set into the *live session in place* (across HttpOnly and partitioned cookies), so no re-login, no incognito juggling, no clearing storage between runs
- Optional AES-GCM passphrase encryption on the stored profiles, all in local IndexedDB (no server, no account)

The other half that's relevant to automation: it exports cookies to **Playwright `storageState`**, Playwright `addCookies`, and Puppeteer `setCookie` (also JSON / Netscape / cookie-header). So you can set up a session by hand in the browser and export it straight into your suite instead of scripting the login flow — or the reverse, import a session your framework produced to debug what the browser actually sees.

Everything else is free: full cookie CRUD including HttpOnly cookies (which UI-only tools can't edit), search/filter, protect/pin/block rules, a CHIPS partitioned-cookie inspector, a DevTools panel. It also reads Cookie-Editor / EditThisCookie JSON if you're coming from those.

**Honest paywall disclosure:** the named cookie profiles are the only paid feature ("Bokal Pro") — $4.99/mo, $19.99/yr, or $29.99 one-time. Everything else is free, and free users make zero network calls (verify in DevTools → Network); your cookie data never leaves your device on any tier. It's open source (GPL-3.0), no telemetry, and it requests access only to the site you're on when you open it — no install-time host permissions.

Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
Source: https://github.com/yuvibabbar-dev/bokal

If you manage a stack of test accounts, I'd genuinely like to hear whether the profiles workflow matches how you actually work — or where it falls short.

---
