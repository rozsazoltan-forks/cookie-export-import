# Product Hunt — run after HN/Reddit

> **Gate / rules:** Launch at 12:01am PT. Fold in any quotes/feedback earned on HN and Reddit first.

> Paste-ready. Verified against source 2026-08-23. Do NOT claim Edge availability. Do NOT claim Netscape *import* (export only).

---

### Tagline (57 chars)
**Open-source cookie manager — no host permissions at install**

*Alternates (all ≤60):*
- Open-source, local-first cookie manager for Chrome (50)
- Cookie manager that keeps your cookies on your device (54)

### Short description
Bokal is an open-source (GPL-3.0) Manifest V3 cookie manager for Chrome. Full cookie CRUD including HttpOnly, search/filter, protect/pin/block rules, and export across JSON, Netscape, cookie-header, and Playwright/Puppeteer formats (import covers all of those except Netscape) — plus a CHIPS partitioned-cookie inspector and a DevTools panel. No `<all_urls>` at install, no "tabs" permission, no telemetry, no remote code. Free users make zero network calls and your cookie data never leaves your device. Everything's free; the one paid feature (Bokal Pro, $29.99 one-time) adds named local cookie profiles with optional passphrase (AES-GCM) encryption.

### First maker comment (founder voice)

> Hey Product Hunt 👋 — maker of Bokal here.
>
> **Why I built this.** Back in December 2024, EditThisCookie — a cookie editor a lot of us debugged with for years (reportedly ~3M users, [per gHacks](https://www.ghacks.net/2024/12/31/google-chrome-legit-editthiscookie-extension-removed-instead-of-malicious-copycat/)) — quietly vanished from the Chrome Web Store. Google never gave an official reason; the most plausible story is it never migrated to Manifest V3. Then it got worse: a [copycat](https://cybersecuritynews.com/malicious-editthiscookie-chrome-extension/) grabbed the "EditThisCookie" name, grew to tens of thousands of users, and was caught harvesting login **credentials/tokens** and phishing people. That's about the worst outcome for a tool you hand cookie access to.
>
> So I built Bokal to be the version you can actually verify. The backstory is the *why* — not a reason to trust me. These are:
>
> **Trust is the whole product:**
> - Open-source, GPL-3.0 — read every line.
> - No "tabs" permission, and **no host permissions at install**. `<all_urls>` exists only as an optional grant; by default it requests just the site you're on, when you open it. A per-site grant persists until you revoke it in `chrome://extensions`.
> - No telemetry, no analytics, no ads, no remote code (everything bundled, `script-src 'self'`).
> - Local-first: no server, no account. **Free users make zero network calls** (check it in DevTools → Network), and your cookie data never leaves your device.
>
> **Free (all of it):**
> - Full cookie CRUD including **HttpOnly** cookies (UI-only tools can't touch those)
> - Search/filter, protect/pin/block rules, whitelist cleanup
> - Export: JSON, Netscape, cookie-header, Playwright `storageState`/`addCookies`, Puppeteer `setCookie` · Import: all of those except Netscape
> - CHIPS partitioned-cookie inspector, DevTools panel, dark mode, virtualized lists
> - Reads Cookie-Editor / EditThisCookie JSON — switching costs nothing
>
> **The only paid feature — Bokal Pro:**
> - Named local cookie profiles: snapshot a site's cookies and restore a saved set into the live session in one click (e.g. test accounts), with optional AES-GCM passphrase encryption. 100% local (IndexedDB).
> - $4.99/mo · $19.99/yr · $29.99 one-time. Pro is GPL too — I'm not relying on license lock-in; the honest reason to pay is to fund the work.
>
> Live on the Chrome Web Store today.
>
> I'd genuinely love feedback — especially from devs and QA folks juggling sessions and multiple test accounts. Please tear into the permissions model. Thanks for taking a look.
>
> — [your name]
>
> Site: https://bokal.dev · Code: https://github.com/yuvibabbar-dev/bokal · Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd

### Topics / tags
Developer Tools · Chrome Extensions · Privacy · Open Source · Productivity

---
