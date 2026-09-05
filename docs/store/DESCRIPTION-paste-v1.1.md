# CWS detailed description — v1.1.0 — PASTE WITH THE 1.1.0 ZIP

> **Use this one ONLY in the same dashboard session where you upload
> `bokalcookie-manager-1.1.0-chrome.zip`.** It claims Netscape *import*, which is true of 1.1.0
> and FALSE of the 1.0.2 build that is live today. If you update the description without the zip,
> the listing lies until review finishes. `DESCRIPTION-paste.md` remains the correct text for 1.0.2.
>
> Dashboard → your item → Store listing → Description → replace all → Save draft. Then Package →
> Upload new package → the 1.1.0 zip → Submit for review. Both go through together.

---

Bokal is an open-source cookie editor and cookie manager for developers, QA
engineers, and privacy-minded users. View, edit, add, and delete cookies —
including HttpOnly cookies that UI-only tools cannot touch — search and filter
them, inspect CHIPS partitioned cookies, import or export Netscape cookies.txt,
and export a logged-in session straight to Playwright storageState or Puppeteer
setCookie for your test suite.

Free and open source (GPL-3.0), with no account, no telemetry, and no site
access requested at install.

WHY BOKAL IS SAFE
Trust is the whole point of Bokal:
• Minimal permissions — no "tabs" permission at all. Bokal asks for access to a
  site only at the moment you choose to manage it, never to all sites up front.
• No remote code — everything Bokal runs is in the published package.
• No telemetry, no analytics, no ads, no tracking of any kind.
• Local-first — your cookies never leave your device: no Bokal server, no cloud,
  no account. (The only network activity is the optional Pro license check via
  ExtensionPay/Stripe, and only if you buy Pro.)
• Open source — every line is published so you (or anyone) can verify these
  claims for yourself.

FEATURES
• Full cookie control: view, add, edit, and delete cookies, including HttpOnly
  cookies that UI-only tools can't touch.
• Search and filter; view cookies for the current site or across all sites.
• Protect cookies from deletion, pin important ones to the top, and block
  cookies from specific domains (reactive cleanup).
• Automatic cleanup: keep a list of sites to preserve, then clear everything
  else with one click or a daily sweep (protected cookies are always kept).
• Cookie audit hints: flags missing SameSite, unpartitioned cross-site cookies,
  and oversized cookies right in the list.
• Export to JSON, Netscape (cookies.txt), and cookie-header formats — no
  "downloads" permission needed.
• Export for test automation: Playwright storageState, Playwright addCookies,
  and Puppeteer setCookie — log in once by hand, reuse the session in your tests.
• Import from JSON (Cookie-Editor / EditThisCookie compatible), Netscape
  cookies.txt (including curl's #HttpOnly_ marker), cookie-header strings, and
  Playwright/Puppeteer files.
• CHIPS partition inspector for modern partitioned cookies.
• DevTools panel: inspect and edit the current tab's cookies inside DevTools.
• Dark mode and fast, virtualized lists across thousands of cookies.

WHO IT'S FOR
• Web developers debugging sessions and authentication.
• QA engineers testing multiple accounts and login states.
• Privacy-conscious users who want to see and control what sites store.

PERMISSIONS, IN PLAIN ENGLISH
• cookies — the core function: read, create, edit, and delete cookies for the
  site you're managing.
• storage — saves your local preferences (dark mode) and cookie rules
  (protect/pin/block) on your device.
• sidePanel — renders Bokal's side-panel interface next to the page.
• unlimitedStorage — lets Pro cookie profiles grow past the default quota;
  everything stays on your device.
• alarms — schedules two periodic tasks: a re-check of your Pro license (which contacts
  ExtensionPay to verify your license, and only if you've bought Pro — free users make no such
  request), and the optional daily cookie-cleanup sweep (fully local). No cookies or browsing
  data are ever sent.
• activeTab — reads the current tab's address (only when you open Bokal) so it
  can request access to just that one site. Not the "tabs" permission.
• Host access — required by Chrome's cookies API to read/write cookies for a
  domain. Bokal requests it at runtime for the specific site you're on, never
  for all sites up front and nothing at install. It asks for all-sites access
  only when you open the all-cookies view, export all sites, or run cleanup.

COMPATIBILITY
Bokal imports Cookie-Editor and EditThisCookie JSON exports, so switching over
takes seconds.

BOKAL PRO (OPTIONAL — EVERYTHING ABOVE IS FREE)
Named local cookie profiles — snapshot a site's cookies and switch between saved
sets (for example, different test accounts) in one click, with optional
passphrase encryption (AES-GCM). Fully local, like everything else in Bokal:
your profiles never leave your device.

• $4.99 / month
• $19.99 / year
• $29.99 one-time — pay once, own it forever

Already bought Pro? Open Bokal and click "Restore purchase".
