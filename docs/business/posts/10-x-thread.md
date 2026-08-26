# X / Twitter thread

> **Gate / notes:** Post from an account with some history. Thread, not a single tweet — the first post carries the hook, the rest carry the proof. Reply to your own thread rather than editing.

> Verified against source 2026-08-26. No Edge claims. Netscape is export-only. Cookie-Editor is also GPL-3.0/MV3 — do not claim those as differentiators.

---

**1/**
EditThisCookie — a cookie editor millions relied on — was delisted from the Chrome Web Store in Dec 2024. Then a copycat grabbed its name and got caught phishing and harvesting login credentials/tokens.

I built Bokal to be the opposite of that. 🧵
(gHacks: https://www.ghacks.net/2024/12/31/google-chrome-legit-editthiscookie-extension-removed-instead-of-malicious-copycat/)

**2/**
Bokal is an open-source (GPL-3.0) Manifest V3 cookie manager for Chrome.

- No "tabs" permission
- No host permissions at install — `<all_urls>` is optional-only; it asks for the site you're on, when you open it
- No telemetry, analytics, or ads
- No remote code (bundled, `script-src 'self'`)

**3/**
Full cookie CRUD, including HttpOnly cookies UI-only tools can't touch. Search/filter, protect/pin/block rules, whitelist cleanup, CHIPS partitioned-cookie inspector, DevTools panel, dark mode, virtualized lists.

Export: JSON, Netscape, cookie-header, Playwright `storageState`/`addCookies`, Puppeteer `setCookie`. Import: the same minus Netscape.

**4/**
Switching is free — it reads Cookie-Editor / EditThisCookie JSON.

Free users make zero network calls (check DevTools → Network); your cookie data never leaves your device. Local-first: no server, no account.

**5/**
One paid feature: Bokal Pro = named local cookie profiles. Snapshot a site's cookies, then restore a saved set into the live session in one click (e.g. test accounts), with optional AES-GCM passphrase encryption. 100% local (IndexedDB).

$4.99/mo · $19.99/yr · $29.99 one-time. Everything else is free.

**6/**
Live on Chrome now.

Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
Code: https://github.com/yuvibabbar-dev/bokal
Site: https://bokal.dev

It's open source — verify it yourself. Feedback welcome.
