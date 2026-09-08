# r/coolgithubprojects — Day 5 (Mon Aug 31)

> **Gate / rules (GREEN, but there is a hard formatting gate):**
> - **Title MUST be `[Language] Name — short description`** and the post must carry the matching **language flair**. Automod removes malformed posts silently.
> - Bokal is TypeScript. **Check the flair list first:** if `TypeScript` is offered, use `[TypeScript]`; if the sub only offers `JavaScript`, use `[JavaScript]`. Title tag and flair must agree.
> - **Lead with the GitHub link, not the store listing, and not pricing.** This sub is a repo-share room.
> - Keep it short. Long marketing posts do badly here.

> Verified against source and against Cookie-Editor's published manifest, 2026-08-26. Do NOT claim Edge availability.

---

### r/coolgithubprojects

**Flair:** TypeScript (or JavaScript — must match the title tag)

**Title:** `[TypeScript] Bokal — MV3 cookie manager that never asks for site access at install`

**Body:**

https://github.com/yuvibabbar-dev/bokal

GPL-3.0 Chrome extension for viewing, editing and exporting cookies, including `HttpOnly` ones. Built after EditThisCookie was delisted and a copycat took its name and got caught stealing session tokens.

The manifest is the interesting part:

    permissions: ['cookies', 'storage', 'sidePanel', 'unlimitedStorage', 'alarms', 'activeTab']
    optional_host_permissions: ['<all_urls>']
    // no host_permissions

No `tabs`, so no *"Read your browsing history"* on the install screen. Site access is requested at runtime for one origin at a time, via `activeTab` to resolve the current URL.

Bits that might interest this sub specifically:

- **CHIPS partitioned-cookie inspector** — partition keys change what "the same cookie" even means, and most tools ignore them entirely.
- **Exports straight to Playwright `storageState` / `addCookies` and Puppeteer `setCookie`** — log in by hand once, drop the session into your test suite, skip scripting the login.
- **Code-split paywall** — the Pro UI is a lazy chunk that's never fetched for free users, and CI has a bundle-guard script that fails the build if that regresses.
- **A test asserts free users make zero network calls.** Writing marketing that stays literally true against the code turned out to be a real constraint.

Stack: TypeScript, React, WXT, zustand, vitest, Playwright. 27 test files, CI runs type-check + unit + E2E against two build variants on every push.

Fair warning so nobody wastes a click: [Cookie-Editor](https://github.com/Moustachauve/cookie-editor) is the 2M-user incumbent, it's also GPL-3.0 and also MV3, and it also uses optional host permissions. The real deltas are the `tabs` permission, CHIPS, and the automation export. If you don't need those, it's the more battle-tested pick.
