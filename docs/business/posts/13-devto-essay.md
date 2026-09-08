# dev.to / Hashnode / personal blog — the long-form essay

> **Notes:** Publish on dev.to with `canonical_url` pointing at your own copy if you cross-post, so you don't split ranking with yourself. Suggested tags: `webdev`, `chrome`, `security`, `opensource` (dev.to allows four).
>
> This is evergreen, unlike the launch posts — it keeps earning traffic and links long after launch week. It is also the safest asset to reuse: no sub rules, no day gates, no karma thresholds.

> Verified against source 2026-08-26. No Edge claims.

---

# What EditThisCookie's delisting taught me about browser trust

In December 2024, EditThisCookie disappeared from the Chrome Web Store. If you wrote web software in the last decade you probably used it — a cookie editor with millions of users (reportedly around 3M, [per gHacks](https://www.ghacks.net/2024/12/31/google-chrome-legit-editthiscookie-extension-removed-instead-of-malicious-copycat/)) and a permanent spot in the QA and web-dev toolbox. Then it was gone. Google never gave an official reason, but the most plausible story is mundane: it never migrated to Manifest V3, and the old platform stopped being allowed.

What happened next is the part that stuck with me. A [copycat](https://cybersecuritynews.com/malicious-editthiscookie-chrome-extension/) showed up using the same name — "EditThisCookie®" — and rode the recognition of the original straight into people's browsers. It was caught harvesting credentials and session tokens and running phishing flows, and it reached 50k+ users before it was pulled. People installed it because they trusted a name, and the name had been hollowed out.

I kept coming back to one uncomfortable fact: a cookie editor is a near-perfect vehicle for that kind of attack. To do its job at all, it has to read cookies — and cookies are how you stay logged in. Your session cookie *is* your logged-in self. An extension that can read the cookies on your bank, your email, your company's admin panel doesn't need to guess your password; it can just borrow the session. The tool that helps you debug auth is, structurally, the tool best positioned to steal it. So "just trust the developer" is not a real answer. The trust has to be built into what the extension is *able* to do.

That's the constraint I built Bokal around.

## Permissions are the actual trust surface

Most extensions ask for broad access at install time — `<all_urls>` host permissions, the `tabs` permission — and users click through because the alternative is the extension not working. But that up-front grant is exactly the thing you can't verify. You're trusting that the code which *can* read every site you visit *won't*.

Bokal doesn't take that grant. Concretely:

- **No `tabs` permission at all.** It has no business enumerating your open tabs, so it can't.
- **No install-time host permissions.** It does not request `<all_urls>` up front. `<all_urls>` appears in the manifest only as an *optional* grant — the set Bokal may ask for — while it actually requests, by default, just the origin of the tab you opened it on (`activeTab` reads that one URL, then it asks Chrome for that single site). A granted per-site permission persists until you revoke it in `chrome://extensions`; that's the honest lifecycle, and it's still scoped to the one site you chose, not a standing key to everything.
- **No remote code.** The Content Security Policy is `script-src 'self'`; everything is bundled in the package you install. There is no path where Bokal fetches and runs code after review — closing off the after-the-fact behavior change that turns a trusted extension into a dangerous one.
- **Open source, GPL-3.0.** The repo is public. You don't have to take my word for any of the above; you can read it, inspect the published build against the source, and fork it if I ever do something you dislike.
- **Local-first.** No server, no account, no telemetry, no analytics, no ads. Free users make zero network calls (open DevTools → Network and confirm it), and your cookie data never leaves your device.

None of this is exotic. It's just declining capabilities a cookie editor doesn't strictly need — and the delisting-plus-copycat story is a good argument for why declining them matters. To be clear about what "minimal" means here: it means *narrow* — one site at a time, nothing at install — not *weak*. Within a site you've granted, Bokal has full read/write over its cookies, because that's the job. That access is inherently sensitive, which is precisely why the build is open and checkable.

The rest is the boring feature work you'd expect: full cookie CRUD including HttpOnly cookies (which UI-only, `document.cookie`-based tools can't touch), search and filtering, export across JSON, Netscape, cookie-header, and Playwright/Puppeteer formats (import covers all of them, Netscape included), protect/pin/block rules, a CHIPS partitioned-cookie inspector, a DevTools panel, dark mode. It also reads Cookie-Editor and EditThisCookie JSON, so moving over costs you nothing. And to be fair to the alternatives: Cookie-Editor is free, widely used, GPL-3.0 like Bokal, and has used optional host permissions since 2023 — so neither "open source" nor "no install-time host access" tells the two apart. What does: it requests `tabs` (the "read your browsing history" warning) where Bokal uses `activeTab`, and it has no partitioned-cookie or Playwright/Puppeteer support. That's a narrower case than I'd have liked to make, but it's the true one.

## The honest part about money

All of the above is free, and it stays free. I want to be upfront about the one thing that isn't, because finding a paywall by surprise is its own small betrayal of trust.

There is a paid tier, **Bokal Pro**, and it does exactly one thing: named local cookie profiles. You snapshot a site's cookies as a profile and switch between saved sets in one click — three test accounts, say, without logging in and out all day. The part that earns the price over the free export/import is that "switch" restores a saved set *into the live session in place*, across HttpOnly and partitioned cookies — not download-a-file-then-reimport-it. Profiles are stored locally in IndexedDB, with optional AES-GCM passphrase encryption (256-bit, PBKDF2 600k iterations). It's $4.99/mo, $19.99/yr, or a $29.99 one-time lifetime license.

Two fair questions. First: it's GPL, so what stops someone forking out the license check and shipping the profile switcher for free? Nothing — and that's fine. I'm not relying on license lock-in; the honest reason to pay is to fund the work and not rebuild the profile system yourself. Second: what happens to a *local-only* lifetime license if I stop working on it? The reassuring answer. Because profiles live on your machine and Pro isn't a cloud service, there's no server that can go dark and take your data with it. License checks talk to the payment provider (ExtensionPay) only if you open the upgrade page; free users never make a network call. And it's GPL — if I vanish, the code doesn't.

The lesson from the EditThisCookie mess wasn't "some developers are bad." It was that a browser extension should be trustworthy by construction, not by reputation — because reputation, as that story showed, is exactly the thing an attacker can steal. Bokal is my attempt to build the cookie editor that way. It's live on the Chrome Web Store now.

If that resonates, the code is open — read it before you trust it. That's the whole point.

---
