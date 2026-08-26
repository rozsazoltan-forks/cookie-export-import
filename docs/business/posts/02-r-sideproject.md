# r/SideProject — Day 2, builder narrative

> **Gate / rules:** No karma/age/flair gate. Must show a *working* product (Bokal is live on the CWS ✓). No affiliate links ✓. Commercial products are explicitly fine here **if framed as a story, not a sales pitch** — so this post leads with the build and the failure, not the features.

> Written 2026-08-23, numbers refreshed 2026-08-25 (the launch kit had no r/SideProject body). **Re-check the live user count before posting — it is moving.** Verified against source. Do NOT claim Edge availability. Do NOT claim Netscape *import* (export only).

---

### r/SideProject

**Title:** I spent months building a cookie manager "properly," shipped it, then told literally nobody — 51 users, $0

**Body:**

Posting this as much for the postmortem as the product, because the interesting part isn't the build — it's how thoroughly I fumbled the last 5%.

**The why.** In December 2024 EditThisCookie — a cookie editor a lot of us had used for years, reportedly ~3M users — vanished from the Chrome Web Store. Google never gave an official reason; the most plausible one is it never migrated to Manifest V3. Then a copycat grabbed the "EditThisCookie" name and got caught harvesting login credentials and tokens, growing past 50k users first. For a tool whose entire job is handling your session cookies, that's about the worst possible outcome, and it bothered me enough to build a replacement.

**What I actually optimized for.** Not features — the permission model. The published manifest is the whole pitch:

    permissions: ['cookies', 'storage', 'sidePanel', 'unlimitedStorage', 'alarms', 'activeTab']
    optional_host_permissions: ['<all_urls>']
    // no host_permissions

No `tabs` permission. No host permissions at install. `<all_urls>` exists only as an *optional* grant — the set it's allowed to ask for. By default it requests access to just the origin of the tab you opened it on, and all-sites is a separate explicit opt-in. It's GPL-3.0, so none of that is a claim you have to take on faith.

**The parts that were genuinely hard:**

- **The activeTab → per-site permission dance.** Getting host access for exactly one origin, triggered by a toolbar click, without the `tabs` permission and without an install-time warning, took far longer to get right than the entire cookie CRUD layer.
- **MV3 service workers dying mid-operation.** Everything stateful had to survive being killed at an arbitrary moment.
- **CHIPS / partitioned cookies.** The partition key changes what "the same cookie" even means, and most tools quietly ignore it.
- **Restoring a cookie set *into a live session in place*** — across HttpOnly and partitioned cookies — rather than the export-a-file-then-reimport-it thing. That's the one paid feature, and it was by far the fiddliest code in the project.
- **Not lying in the copy.** I have a test that asserts a free user makes zero network calls, and another that asserts cookie values are never logged. Writing marketing that stays literally true against the code turned out to be a real engineering constraint, and a good one. (Case in point: I caught myself last week claiming "Netscape import" in a draft of this very post. Bokal exports Netscape; it doesn't import it. Fixed.)

**Now the embarrassing part.** It went live on the Chrome Web Store on July 15. I wrote a whole launch kit on July 16 — Show HN draft, subreddit-by-subreddit rules research, Product Hunt copy, the lot.

And then I posted **none of it.** For five weeks.

Current numbers, honestly: **51 users, 5.0★ from 2 ratings, $0 revenue.** It roughly doubled over the last few days and every one of those installs came from people typing "cookie editor" into the Chrome Web Store and picking mine. Zero GitHub stars, because zero people have ever been sent there.

**What I think I got wrong:** I treated "ship it" as the finish line, when shipping is maybe 60% of it. I also think I used polishing as a way to avoid the genuinely uncomfortable part, which is walking into a room and saying "I made this, please look at it." Writing a launch kit *felt* like launching. It isn't. This post is me finally doing the actual thing.

**What I'd like from you:** if you've been through the same "built it, couldn't promote it" wall — what actually broke the logjam? And if you install it, I want the permission model torn apart specifically. If you can make it see more than it should, that's the bug report I most want.

- Chrome Web Store: https://chromewebstore.google.com/detail/bokal-cookie-editor-manag/oidemgbbhocfepdadkmfdlbjgdcjdldd
- Source (GPL-3.0): https://github.com/yuvibabbar-dev/bokal
- Site: https://bokal.dev

Free tier is the whole cookie manager — CRUD including HttpOnly, search, rules, cleanup, CHIPS inspector, DevTools panel, export to JSON/Netscape/cookie-header/Playwright/Puppeteer. One paid feature (named local cookie profiles, $29.99 one-time or $4.99/mo) which I'm mentioning once, here, and not again.
