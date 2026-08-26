# dev.to / blog — "I read my competitor's manifest and my pitch fell apart"

> **Notes:** This is an *original* piece rather than repackaged launch copy, and it is the strongest content asset in the set. It is a story about being wrong in public, which travels much further than a feature list. Tags: `webdev`, `opensource`, `chrome`, `marketing`.
>
> Also the best possible seed for the Show HN thread: if this is already published, the honest self-correction in the HN post reads as an established position rather than damage control.

> Verified against source and Cookie-Editor's published manifest, 2026-08-26.

---

**Title:** I read my competitor's manifest and most of my pitch fell apart

**Body:**

I spent months building a Chrome cookie manager around one idea: that it would ask for less than everything else. No `tabs` permission. No site access at install. Open source, so every claim could be checked instead of believed.

Then, the morning I was finally going to post about it, I opened the incumbent's `manifest.chrome.json`.

```json
{
  "manifest_version": 3,
  "permissions": ["cookies", "tabs", "storage", "sidePanel"],
  "optional_host_permissions": ["<all_urls>"]
}
```

No `host_permissions`. Optional site access, requested at runtime. The same pattern I had been describing as the thing that made my extension different — shipped by a tool with two million users, since a commit dated **August 2023**. Three years before I wrote a word of my launch copy.

It got worse as I kept reading. It's GPL-3.0, with 1.7k stars. It went Manifest V3 in March 2022. So "open source", "auditable", "MV3" and "no install-time host permissions" — four of the phrases my landing page leaned on — were not differentiators at all. They were table stakes I had mistaken for a moat.

## The part I want to dwell on

I had written, in a draft of a Show HN comment, the sentence: *"The only reasons to look at Bokal are the permission posture and that it's open-source and auditable."*

Imagine posting that to Hacker News. The top comment writes itself. It takes one person thirty seconds with `curl` to make you look either careless or dishonest, and the audience cannot tell those apart from outside. On a project whose entire pitch is *"don't trust me, check the code,"* getting caught not checking someone else's code is about the worst opening available.

I got lucky. The only reason I found it is that I sat down to write a comparison page and thought I should verify the competitor's side before publishing a table about it. That is a low bar. I nearly didn't clear it.

## What was actually left

Once I stopped counting things that weren't differences, three remained:

**One permission.** The incumbent requests `tabs`; I use `activeTab`. `tabs` grants standing read access to the URL and title of every open tab, which is why Chrome shows **"Read your browsing history"** on the install screen. `activeTab` grants a temporary capability for one tab, after a click. That difference is real, it's visible before you install either one, and it's the only permission-line difference between us.

**Partitioned cookies.** CHIPS changes what "the same cookie" means, because the partition key is part of its identity. Their codebase has no `partitionKey` handling anywhere. Mine has an inspector.

**Automation export.** Playwright `storageState`, Playwright `addCookies`, Puppeteer `setCookie`. They have none.

That's it. That's the honest list.

## Two things I learned

**A differentiator you haven't verified is a liability, not an asset.** Every unchecked claim is a landmine you've placed in your own launch thread. The cost of checking is one HTTP request. The cost of not checking is the credibility you were trying to establish in the first place — and you spend it in front of exactly the audience you most wanted to impress.

**The real differentiators were the ones I'd been apologising for.** My copy contained the line *"not a feature war"* — I was actively downplaying the partitioned-cookie support and the automation export, because I'd decided the story was about trust and features felt like a lesser argument. Those turned out to be two of my three genuine advantages. I had correctly identified my strongest hand and then explained why nobody should look at it.

I think this is a common failure. You fall in love with the *narrative* reason your thing exists — mine was a real one, an extension got delisted and a credential-stealing copycat took its name — and you optimise all your messaging for the narrative rather than for what your software actually does better than the nearest alternative. The narrative gets you attention. It does not survive a comparison table.

## What I changed

The comparison page now opens by killing three myths about my own product before it makes a single claim. It has a "where the incumbent is the better choice" section — they support Firefox, Safari and Opera; I don't; they have years of track record; I have weeks. My README carries the same table. The Show HN post says, in as many words, that half of what I first wrote was wrong and that I pulled their manifest before posting.

I expect that to land better than the original would have, and not because honesty is charming. It's that a specific, narrow, verifiable claim — *"we differ on one permission, partitioned cookies, and automation export"* — is simply more useful to a reader than a broad one they have to take on faith. The narrow claim also has the advantage of being true.

If you're about to launch something positioned against an incumbent: go read their manifest, their `package.json`, their changelog, their actual source. Before you write the copy, not after. It takes twenty minutes and it is the cheapest insurance you will ever buy.

---

*Bokal is GPL-3.0 and [on GitHub](https://github.com/yuvibabbar-dev/bokal). The comparison that started this is [here](https://bokal.dev/cookie-editor-alternative.html). The incumbent, which is genuinely good software, is [Cookie-Editor](https://github.com/Moustachauve/cookie-editor).*
