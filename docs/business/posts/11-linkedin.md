# LinkedIn post

> **Gate / notes:** Longer-form and less technical than the X thread. LinkedIn suppresses posts with outbound links in the body — consider putting the store link in the first comment instead.

> Verified against source 2026-08-26. No Edge claims. Netscape is export-only. Cookie-Editor is also GPL-3.0/MV3 — do not claim those as differentiators.

---

Back in December 2024, EditThisCookie — a cookie editor used by millions — was quietly delisted from the Chrome Web Store. Shortly after, a copycat extension took its name and was caught phishing users and harvesting their login credentials and tokens.

For developers and QA engineers who live in cookies all day, that left a real trust gap. So I built Bokal: an open-source (GPL-3.0), Manifest V3 cookie manager for Chrome, designed so you don't have to take my word for anything.

How it's built:
• No "tabs" permission, and no install-time host permissions — `<all_urls>` is an optional grant only; Bokal requests access to the specific site you're on, when you open it.
• No telemetry, no analytics, no ads, no remote code — everything is bundled (CSP `script-src 'self'`).
• Local-first: no server, no account. Free users make zero network calls, and your cookie data never leaves your device.

What it does: full cookie CRUD including HttpOnly cookies (which UI-only tools can't edit), search/filter, protect/pin/block rules, whitelist cleanup, a CHIPS partitioned-cookie inspector, a DevTools panel, and export across JSON, Netscape, cookie-header, and Playwright/Puppeteer formats (import covers all but Netscape). It also reads Cookie-Editor and EditThisCookie JSON, so switching costs nothing.

Everything above is free. The only paid tier, Bokal Pro, adds named local cookie profiles — snapshot a site's cookies and restore a saved set into the live session in one click (like different test accounts), with optional AES-GCM passphrase encryption, stored locally in IndexedDB. It's $4.99/mo, $19.99/yr, or $29.99 one-time.

Live on Chrome now.

Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
Source: https://github.com/yuvibabbar-dev/bokal
Site: https://bokal.dev

If you work with sessions, auth, or multiple test accounts, I'd genuinely value your feedback.
