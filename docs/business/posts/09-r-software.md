# r/software — +2 (Wed Sep 2)

> **Gate / rules (YELLOW — this sub permanently bans self-promo that misses the conditions):**
> - **Rule 3: promoting your own software = permanent ban UNLESS** it is open source (GPL-3.0 ✓), shared **on a Wednesday** (hence the date — do not post any other day), with the right flair, and adding value beyond a bare link.
> - **Must be fully usable without payment.** Bokal qualifies — say so explicitly and early.
> - **Secret automod karma threshold.** If the post vanishes silently it was automod, not a mod decision. **Modmail politely for manual approval — do not repost.**
> - Flair: "Releases" (or the closest equivalent the sub offers).

> Verified against source and against Cookie-Editor's published manifest, 2026-08-26. Do NOT claim Edge availability. Do NOT claim Netscape *import* (export only).

---

### r/software

**Flair:** Releases

**Title:** Bokal 1.0.2 — free, open-source cookie manager for Chrome, built after the EditThisCookie delisting left a gap

**Body:**

Rule 3 first, so nobody has to dig: this is my own project, it's **open source (GPL-3.0)**, and it is **fully usable without paying** — the entire cookie manager is free, permanently, with no trial, no account, no ads and no telemetry. There's an optional paid extra at the end which I've kept out of the way.

**The context, for anyone who missed it.** EditThisCookie was one of the standard cookie editors on Chrome, reportedly ~3M users. It vanished from the Chrome Web Store around December 2024 — Google never said why, and the likeliest explanation is that it never made the Manifest V3 migration. Then a copycat took the name, reached 50,000+ users, and was caught harvesting login credentials and session tokens.

That left a lot of people needing a replacement for a category of tool where "can I trust this?" is the whole question, since a cookie editor by definition can read and write your session cookies.

**What Bokal is.** A Manifest V3 cookie manager for Chrome and Chromium browsers. Everything below is in the free tier:

- View, add, edit and delete cookies, **including `HttpOnly`** cookies that `document.cookie`-based tools cannot touch
- Search and filter; per-site or across all sites
- Protect / pin / block rules, and whitelist cleanup — keep chosen sites, clear the rest, manually or on a daily sweep
- Audit hints for missing `SameSite`, unpartitioned cross-site cookies and oversized cookies
- A CHIPS partitioned-cookie inspector
- A DevTools panel, dark mode, and virtualized lists that stay fast across thousands of cookies
- **Export** to JSON, Netscape `cookies.txt`, cookie-header string, Playwright `storageState`, Playwright `addCookies` and Puppeteer `setCookie`
- **Import** from JSON — including Cookie-Editor and EditThisCookie exports — and from header strings. *(Netscape is export-only; it does not import `cookies.txt`.)*

**The design decision worth mentioning here** is the permission model, since that's what the whole thing was a reaction to. The full published manifest:

    permissions: ['cookies', 'storage', 'sidePanel', 'unlimitedStorage', 'alarms', 'activeTab']
    optional_host_permissions: ['<all_urls>']
    // no host_permissions

No `tabs` permission, which is what makes Chrome show *"Read your browsing history"* when you install something. No site access granted at install — `<all_urls>` is only declared as an *optional* permission, and by default Bokal asks for just the one origin you opened it on. There's no server and no account; free users make zero network calls, and you can confirm that in DevTools → Network.

**An honest note on alternatives,** because "added value" shouldn't mean pretending I'm the only option: [Cookie-Editor](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm) has ~2M users at 4.4★, is *also* free and open source under GPL-3.0, is also MV3, and has also used optional host permissions since 2023 — plus it supports Firefox, Safari and Opera, which Bokal doesn't. It requests `tabs` where Bokal doesn't, and it has no CHIPS or Playwright/Puppeteer support. Those are the actual differences; pick on that basis rather than on which post you read.

**Links**

- Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
- Source (GPL-3.0): https://github.com/yuvibabbar-dev/bokal
- Site: https://bokal.dev

**The optional paid part,** disclosed rather than pitched: one feature, named local cookie profiles — snapshot a site's cookies and restore a saved set into the live session in one click, useful for juggling test accounts. Stored locally with optional AES-GCM passphrase encryption. It's GPL as well, so the licence check is forkable; it exists to fund maintenance, not to gate the tool. Nothing above depends on it.

Happy to answer anything about the permission model or the MV3 migration.
