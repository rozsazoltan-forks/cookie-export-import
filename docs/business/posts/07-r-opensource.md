# r/opensource — Day 4 (Sun Aug 30)

> **Gate / rules (YELLOW — real conditions, meet all of them):**
> - **Rule 7: apply the "Promotional" post flair.** Required for project shares. Without it the post gets removed.
> - **Rule 3: OSI license required** — GPL-3.0 ✓.
> - **Rule 2: keep self-promo under 10% of your activity**, engage in the comments, and **no AI-generated content** — so read this through and put it in your own words before posting. Do not paste it verbatim.
> - This community is **touchy about ad-like and open-core framing.** Pro gets exactly one sustainability line, at the bottom, and is never the pitch.

> Verified against source and against Cookie-Editor's published manifest, 2026-08-26. Do NOT claim Edge availability. Do NOT claim Netscape *import* (export only).

---

### r/opensource

**Flair:** Promotional

**Title:** Bokal — a GPL-3.0 cookie manager for Chrome, written after a closed-source copycat of EditThisCookie was caught stealing credentials

**Body:**

The case for open source here isn't ideological, it's practical, and I want to lay it out before the link.

In December 2024 EditThisCookie — a cookie editor with something like 3 million users — was delisted from the Chrome Web Store. No official reason from Google; most likely it just never migrated to Manifest V2's replacement. What happened next is the part that matters: a copycat extension took the *EditThisCookie* name, grew past 50,000 users, and was caught harvesting login credentials and session tokens and pushing phishing content.

Think about what a cookie editor actually is. It reads and writes your session cookies, including `HttpOnly` ones. That is session-hijack-grade access to whatever site you point it at. Users had no way to tell the impostor from the original, because with a closed-source binary blob in a store listing, **there is nothing to check.** Reputation was the only signal, and reputation is exactly the thing the attacker stole.

So I wrote a replacement and put the whole thing under GPL-3.0.

**Source:** https://github.com/yuvibabbar-dev/bokal

**What being open source actually buys you here** — I want to be precise, because "it's open source" gets waved around as a trust argument more often than it earns it:

- You can read the permission code and the network code. Those are the two things that matter for this class of tool, and they're small enough to audit in an afternoon.
- The claims are falsifiable. I assert that a free user makes **zero network calls**; there's a test that enforces it (`lib/pay/paid-flow.test.ts`), and you can also just open DevTools → Network and try to prove me wrong.
- Another: cookie values are never logged and render as text nodes only, locked by a redaction/XSS regression test in CI.

**What it does *not* buy you, and I'd rather say this myself:** I am **not** claiming a reproducible build. The store package is a minified production bundle, and I can't hand you a byte-for-byte proof that it corresponds to the tag. What you can do is build from source and load it unpacked, which is documented in the README. If you ever find daylight between the published extension and this repo, that's the issue I most want filed.

**On the permission model,** since it's the reason the project exists. The full published manifest:

    permissions: ['cookies', 'storage', 'sidePanel', 'unlimitedStorage', 'alarms', 'activeTab']
    optional_host_permissions: ['<all_urls>']
    // no host_permissions

No `tabs` permission, so no *"Read your browsing history"* on the install screen. No site access at install — `<all_urls>` is only the set it may *ask* for, and by default it requests just the origin of the tab you opened it on.

**Credit where it's due:** the incumbent alternative, [Cookie-Editor](https://github.com/Moustachauve/cookie-editor), is *also* GPL-3.0, also MV3, and has also used optional host permissions since 2023. I'm not offering you an open-source upgrade over a proprietary tool — that comparison would be dishonest and this sub would rightly call it out. The real differences are narrow: it requests `tabs` where I use `activeTab`, and it has no partitioned-cookie (CHIPS) or Playwright/Puppeteer support. If neither matters to you, use Cookie-Editor; it's good software.

**Stack,** for anyone curious: TypeScript, React, WXT, zustand, vitest, Playwright. GPL-3.0-or-later — which is forced rather than chosen: it bundles ExtPay, which is AGPL, so a permissive license wouldn't be compliant. The reasoning is written up in `docs/licensing-notes.md` in case it's useful to anyone else navigating that.

**Sustainability, one line as promised:** the cookie manager is complete and free forever; there's an optional paid tier for named local cookie profiles that funds the work, and it's GPL too, so you could fork the check out — I'm not relying on license lock-in.

Happy to talk about the MV3 migration, the `activeTab` → per-site permission flow, or the licensing analysis. Criticism of the trust claims is the most useful thing you could give me.
