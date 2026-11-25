# UX Best Practices for In-App Cosmetic Shops (web + mobile)

Context: 18+ blackjack education app; earned (soft) currency; cosmetics (card backs, table felts, mascot skins), power-ups, and a subscription. Research date: 2026-11-24. Tool budget was about 15 calls, so several sources are secondary summaries. Where a claim comes from a search-result summary rather than a full-page read, it is marked "(summary)".

## Layout patterns (tabs vs sections, hero, rotating picks, bundles, sets, owned/equipped, badges, sort/filter)

### Takeaway
Industry guidance converges on a **small, sectioned shop**. That means a few clear categories (tabs or anchored sections), roughly 4–7 items in focus per view, offers or featured items first, honest badges used sparingly, and themed sets or bundles. No source gives one "gold standard" layout. Supercell-style minimalism is the trust-building choice; maximalist pop-ups and timers are the aggressive one.

### Cited Findings
- **Items in focus per category:** keep about 5 items (plus or minus 2) in focus per category. Top games show about 6 without scrolling, and too many choices make players leave without buying. Add categories only as the game requires. (devtodev, 2019; older than the preferred window but widely cited) — [devtodev](https://www.devtodev.com/resources/articles/how-to-improve-a-free-to-play-in-game-store)
- **Clash Royale's historic shop** showed at most 6 items on screen (summary) — [Gamigion, Evolution of in-game shops](https://www.gamigion.com/evolution-of-in%e2%80%91game-shops-in-mobile-f2p-games/)
- **Clash Royale Dec 2023 redesign:** the shop got distinct sections (Offers, Market, Cosmetics, Currency). The Collection tab got subsections (Tower Troops/cards, Emotes, Magic Items, Tower Skins). In other words, buying (shop) and owning/equipping (collection) are separate surfaces, each split by category (summary) — [RoyaleAPI, Dec 2023 update](https://royaleapi.com/blog/2023-december-update?lang=en)
- **Clash Royale Nov/Dec 2025:** the Season Shop was removed and "Crystals" were added as a currency for buying emotes and cosmetics in the Shop (summary) — [RoyaleAPI Q4 2025](https://royaleapi.com/blog/2025-q4-update-november-2025); [Supercell Dec 2025 notes](https://supercell.com/en/games/clashroyale/blog/release-notes/december-update-2025)
- **Minimal vs maximalist shops:** some developers chose maximalist shops with pop-ups and timers, while Supercell kept shops minimal to build long-term player trust (summary; blog/book-excerpt source, not independently verified) — [Gamigion](https://www.gamigion.com/evolution-of-in%e2%80%91game-shops-in-mobile-f2p-games/)
- **Ordering example:** a Rummy Fun shop teardown praises putting offers first, then coin packs, with red badges marking valuable deals (summary) — [Gamigion](https://www.gamigion.com/?p=21294)
- **Shop as a destination:** Roblox's creator docs recommend designing the shop "as a place to linger and browse" that is integrated into the experience and easy to find (summary) — [Roblox Monetization foundations](https://create.roblox.com/docs/production/game-design/monetization-foundations)
- **Check discoverability first:** if few players open the store, simplify navigation before optimizing sales — [devtodev](https://www.devtodev.com/resources/articles/how-to-improve-a-free-to-play-in-game-store)
- **Layout conventions:** use full-screen shops on mobile, keep currency counters always visible, and let featured bundles span 2 or 4 grid slots (summary; vendor source) — [Fungies](https://fungies.io/category/mobile-game-web-shop-design)
- **Tabs for midcore:** an ironSource-published MVP store wireframe suggests a "simple, tabbed store" for midcore games, with tabs as clear compartments. Layout libraries offer page-swipe vs vertical-scroll variants (summary) — [ironSource LevelUp / Turbine Games](https://medium.com/ironsource-levelup/iap-merchandising-iap-design-stack-turbine-games-consulting-64dee257a5fe); [Shop Plumbus](https://i-n-f.itch.io/shop-plumbus)
- **Badge guidance** (Balancy book *Best Practices for In-Game Shops*, excerpt on Game Developer, Aug 2, 2024):
  - "Best Value" works best where it can be checked with simple math.
  - "Most Popular" must be accurate, because players verify it.
  - "Limited" should pair with a real-time counter, and the scarcity must be real.
  - Keep discount math consistent and round honestly; don't claim 50% off when the real discount is about 40%.
  - Don't overload items with badges.
  - Source: [Game Developer / Balancy excerpt](https://www.gamedeveloper.com/production/best-practices-for-in-game-shops-chapter-3-working-on-conversion)
- **Bundle guidance (same source):**
  - Pair one high-demand or exclusive "main" item with relevant fillers, and keep a common theme.
  - If players have to calculate the value, the bundle is too complex.
  - Bundles should feel better than buying the items separately, with diminishing returns from extra filler.
  - Source: [Game Developer / Balancy](https://www.gamedeveloper.com/production/best-practices-for-in-game-shops-chapter-3-working-on-conversion)
- **Avoid padded bundles:** don't sell bundles where most of the price goes to items the player doesn't need, e.g. a $20 pack with $5 of useful currency (2019) — [devtodev](https://www.devtodev.com/resources/articles/how-to-improve-a-free-to-play-in-game-store)
- **Themed sets:** release cosmetics in themed sets tied to narrative or marketing beats. Progression-gated cosmetics (COD Mobile camos for completing the battle pass; Free Fire/PUBG weapon skins that evolve with level) are a proven pattern (Naavik, June 2022) — [Naavik, Selling Cosmetics pt 1](https://naavik.co/deep-dives/selling-cosmetics-part1/)
- **Fortnite (April 2024):**
  - Epic removed cosmetic rarity tiers and names from the shop.
  - From late May 2024, each item's detail page shows the planned date it rotates out (summary; the official page redirected to login and could not be read).
  - A later redesign (v26.20) added a right-side preview panel that enlarges the item on hover.
  - Sources: [VideoGamer](https://www.videogamer.com/news/fortnite-item-shop-changes-announcement); [Epic news URL](https://www.fortnite.com/news/new-and-upcoming-fortnite-shop-and-locker-changes); [DBLTap v26.20](https://dbltap.com/posts/all-fortnite-item-shop-changes-in-update-v26-20-01hb93k31mms)
- **Locker backlash:** Fortnite's Chapter 5 Locker (owned/equip UI) redesign drew heavy criticism, and Epic publicly acknowledged it. A bad owned/equip UX is a real pain point even when the shop is good (summary) — [Sportskeeda](https://www.sportskeeda.com/fortnite/epic-games-working-fix-fortnite-s-locker-ui)
- **Waiting for discounts:** some Fortnite players wait for items to come back on sale rather than buy at full price, so rotation and discounts train waiting behaviour (2022) — [Naavik](https://naavik.co/deep-dives/selling-cosmetics-part1/)
- **Prevalence:** time-limited offers appear in almost all top-grossing US mobile games, and battle-pass variants in about 60% (GameRefinery report, summary, date not confirmed) — [Mobidictum / GameRefinery](https://mobidictum.com/?p=36936)

### Inferences
- **Recommended structure** for this app:
  - A sticky top bar with the coin balance.
  - A "Featured" hero (one rotating set, e.g. a matching card back, felt and mascot).
  - A "Daily picks" row of 3–4 items with an honest reset timer.
  - Category tabs or chips: Card Backs / Felts / Mascots / Power-ups / Membership.
  - Each tab is a grid of about 6 items above the fold.
- **Two separate surfaces, like Clash Royale and Fortnite:** a Shop for buying and a Collection/Locker for owned items and equipping. Owned items in the shop should show an "Owned" or "Equipped" state rather than disappear, and should deep-link to equip.
- **Set progress bars** (e.g. "Vegas Neon set 2/3") fit the themed-set guidance from Naavik and Balancy. For a soft currency they are a low-pressure motivator.
- **Badges:** cap at one per tile. Use "New" (true for X days), "Limited" only with a real end date, and "Best value" only where the math is simple.

### Gaps
- No public A/B results were found that compare category tabs with long scrolling sections in game shops.
- Deconstructor of Fun, GameRefinery and mobilefreetoplay.com pieces specifically on shop layout did not appear in search. Their analyses are mostly in podcasts and paid reports.
- Baymard's detailed grid guidelines are paywalled (see the next section).

## Previews (try-on / live preview) and evidence they raise conversion

### Takeaway
Leading cosmetic shops let users see an item in context before buying: Fortnite's hover/preview panel and locker-style previews, and Clash Royale's tower-skin and emote previews. Direct game A/B data is not public, but e-commerce data consistently shows that 3D/AR and "view in context" features raise add-to-cart and purchase rates. Those figures are vendor-reported and not from controlled tests.

### Cited Findings
- **Fortnite v26.20 shop:** hovering over an item shows it full-size in a right-hand preview panel (summary) — [DBLTap](https://dbltap.com/posts/all-fortnite-item-shop-changes-in-update-v26-20-01hb93k31mms)
- **Rebecca Minkoff (via Shopify):** shoppers who viewed a product as a 3D model were 44% more likely to add it to cart. Those who viewed it in AR were 65% more likely to buy. Vendor-reported — [Shopify, AR shopping](https://www.shopify.com/blog/ar-shopping)
- **Gunner Kennels (Shopify case study):** +40% order conversion and -5% returns after adding 3D/AR. This was a before/after comparison against the previous quarter, not a controlled test — [Shopify case study](https://www.shopify.com/case-studies/gunner-kennels)
- **Amazon (via Shopify):** customers were about 2x as likely to buy after using AR Virtual Try-On or View in 3D. Vendor-reported — [Shopify, 3D ecommerce](https://www.shopify.com/ie/blog/3d-ecommerce)
- **AR browsing (via Shopify):** AR users browsed about 20% longer and viewed 1.28x more products. The original study was not identified — [Shopify](https://www.shopify.com/blog/ar-shopping)
- **Baymard on thumbnails** (visually driven products):
  - List items without thumbnails were often ignored.
  - Give access to at least 3 thumbnails per list item so users can evaluate without opening the item.
  - 78% of mobile sites score "poor" to "mediocre" on product-list UX (2025).
  - Sources: [Baymard current state of product lists](https://baymard.com/research-articles/current-state-product-list-and-filtering); [Baymard secondary hover info](https://baymard.com/research-articles/secondary-hover-information)
- **Quick views:** Baymard has research on quick views (an overlay preview from the list) on mobile and desktop; the details are paywalled — [Baymard quick views](https://baymard.com/research-articles/mobile-desktop-quick-views)

### Inferences
- **Live preview is the highest-value feature for this app.** Tapping a card back, felt or mascot should open a preview of the user's own blackjack table with that item applied (dealt hand, mascot pose). A "Try it for one hand" free trial is an extension.
- **Show the set together:** let users preview the whole set at once (card back + felt + mascot), since the sets/bundles guidance favours themed combinations.
- **Tile imagery:** show the item in use, not as an isolated icon, per Baymard's findings for visually driven products.
- **Treat vendor numbers as directional only:** 44%, 65% and 2x are vendor figures for physical goods.

### Gaps
- No public A/B data was found on previews in game cosmetic shops (Fortnite, Chess.com themes, Clash Royale).
- Chess.com's board and piece theme preview could not be confirmed with a source in this pass.

## Pricing presentation, affordability cues, and dark patterns to avoid

### Takeaway
Show prices and the balance clearly, frame discounts honestly, and make any real-money amount explicit. Regulators (FTC 2022–2025, EU CPC 2025) treat confusing virtual currencies, fake scarcity and odds, and frictionless accidental purchases as dark patterns. EU principles apply mainly to currency bought with real money, so a purely earned currency is lower-risk. Any real-money item (subscription, coin packs if ever added) must show the real price.

### Cited Findings
- **FTC report:** *Bringing Dark Patterns to Light* (FTC staff report, Sept 14, 2022) covers design that obscures, subverts or impairs choice. Commentary on it notes that requiring virtual currency can mask the real dollar cost — [FTC report PDF](https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf); [Arnold & Porter summary](https://www.arnoldporter.com/en/perspectives/advisories/2022/09/ftc-shines-a-little-light-on-dark-patterns)
- **FTC v. Epic Games (Dec 2022):** $520M total, of which $245M was refunds for dark patterns and billing.
  - Alleged: one-button purchases without cardholder consent (accidental skin buys from a stray button press) and no PIN or password requirement.
  - The order bans charging through dark patterns or without affirmative consent.
  - First refund round in Dec 2024: $72M across 629,344 payments, average $114.
  - Sources: [PBS](https://www.pbs.org/newshour/nation/fortnite-maker-epic-games-to-settle-ftc-case-pay-520-million-in-penalties-and-refunds); [FTC press release Dec 2024](https://ftc.gov/news-events/news/press-releases/2024/12/ftc-sends-refund-payments-consumers-impacted-epic-games-unlawful-billing-practices); [The Register](https://www.theregister.com/2024/12/12/bilked_by_epic_games_check/)
- **FTC v. HoYoverse (Genshin Impact, Jan 17, 2025):**
  - Alleged confusing multi-step virtual-currency exchange and misrepresented loot-box odds. Players "racked up hundreds of dollars."
  - Settlement: $20M penalty, and loot boxes must also be purchasable directly in USD.
  - Source: [FTC business blog](https://ftc.gov/business-guidance/blog/2025/01/level-tips-businesses-ftcs-settlement-genshin-impact-developer-hoyoverse)
- **EU CPC Network Key Principles on in-game virtual currencies (Mar 21, 2025):**
  - Items bought with virtual currency should also show the real-world money price.
  - Avoid obscuring costs, mixing currencies or forcing exchanges, and pressuring players to buy more currency than they need.
  - These are soft law. They reportedly do not apply to currency earned only through gameplay ("soft VC").
  - Sources: [Reed Smith Q&A](https://www.reedsmith.com/articles/qas-on-the-eu-consumer-protection-authorities-joint-guidance-paper/); [Linklaters](https://techinsights.linklaters.com/post/102k6t4/game-changer-eu-introduces-consumer-protection-guidance-for-in-game-virtual-curr); [principles PDF](https://esportslegal.news/wp-content/uploads/2025/03/Key-principles-on-in-game-virtual-currencies.pdf)
- **Balancy book (2024):**
  - Scarcity must be real; "Limited" means a real counter or a real end date.
  - Round discounts honestly; don't call about 40% "50% off".
  - Keep "Most Popular" accurate.
  - Source: [Game Developer / Balancy](https://www.gamedeveloper.com/production/best-practices-for-in-game-shops-chapter-3-working-on-conversion)
- **Pricing tactics from devtodev (2019; persuasion tactics, judge for fit):**
  - Show savings as an absolute amount rather than a small percentage.
  - Test ascending vs descending price order by audience.
  - Bonus framing ("x2") works for high payers.
  - Source: [devtodev](https://www.devtodev.com/resources/articles/how-to-improve-a-free-to-play-in-game-store)
- **Earn pacing:** price early items so they can be earned within a few minutes of play (older gamedev guidance) — [Game Developer, 4 keys](https://www.gamedeveloper.com/game-platforms/building-an-in-game-store-for-the-first-time-here-are-the-4-keys-to-success)
- **Spending preference:** "players are 3 times more likely to consider spending on cosmetics rather than on power" (Qutee survey, via Naavik 2022) — [Naavik](https://naavik.co/deep-dives/selling-cosmetics-part1/)

### Inferences
- **Do:**
  - Keep the coin balance always visible.
  - Give a clear "Affordable" state on tiles (full colour, price in normal weight) vs an "X more coins" state with a small progress bar ("120 / 300 coins").
  - Add a "Ways to earn" link from unaffordable items to quests or lessons. This reinforces the education loop instead of pushing purchases.
  - Use a confirm step for every spend (FTC Epic: affirmative consent).
  - Show the full real-money price, billing period and renewal terms for the subscription. Avoid pre-checked add-ons.
  - Keep any discount math transparent ("was 400, now 300").
- **Avoid:**
  - Fake countdowns, or timers that silently reset.
  - "Only 3 left" on unlimited digital items.
  - Multiple currencies or forced exchange ratios.
  - Odd bundle sizes that leave unusable leftovers ("buy more than needed", per EU CPC).
  - Fake "Most popular" labels.
  - Loot boxes or randomized cosmetics. They are especially risky in a blackjack/gambling-education context, and FTC v. HoYoverse covers misstated odds.
- **Keep the currency earned-only:** that keeps the app outside most "virtual currency bought with real money" rules. If coin packs are ever sold, show the real-money equivalent next to coin prices, as the EU CPC 2025 principles expect.
- **Brand fit:** an 18+ blackjack *education* brand should probably lean toward Supercell-style minimalism rather than casino-style urgency, for trust and positioning.

### Gaps
- No quantitative data was found on how "you can afford" or "progress to next item" cues affect conversion; this is practitioner convention only.
- The full FTC report text on virtual currency was not read directly; that claim relies on law-firm summaries.

## Mobile ergonomics and accessibility

### Takeaway
Use card grids with large in-context thumbnails, sticky currency, and a detail view as a short bottom sheet or full page. Don't assume "bottom = reachable": NN/g found the middle of the screen is easiest to tap. Meet WCAG 2.2 target-size and contrast minimums, and never rely on colour alone for affordable or owned states.

### Cited Findings
- **NN/g on bottom sheets** (Laubheimer, June 11, 2023):
  - Support Back to dismiss, and include a visible Close button.
  - Don't stack sheets, and don't use sheets in place of full product-detail pages.
  - Use them only for short interactions.
  - The reachability rationale is "common (but largely incorrect)", since users hold phones many ways and the middle of the screen is easiest to tap.
  - Source: [NN/g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)
- **Material Design:** tall bottom sheets should not open full-screen, because the top content ends up out of reach (summary). **eBay's design system** advises not launching other modals from a bottom sheet — [Material sheets](https://material.io/components/sheets-bottom); [eBay Playbook](https://playbook.ebay.com/design-system/components/bottom-sheet)
- **Hoober grip study (about 2013):** more than 1,300 people observed, using three basic grips. The "thumb zone" concept dates from 2011. A 2020 Osmani article argues the rigid thumb-zone model is outdated, and a 2024 academic paper builds on it with ML reachability models — [Smashing, Thumb Zone](https://smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users); [Addy Osmani](https://addyosmani.com/blog/touch-friendly-design/); [PolyU 2024 paper](https://ira.lib.polyu.edu.hk/bitstream/10397/116791/1/Lee_Perceived_User_Reachability.pdf)
- **Baymard on grid vs list:** grid view suits visually driven products and list view suits spec-heavy ones. Cosmetics are visual, so use a grid; power-ups with effects text may suit a list or wider card (summary) — [Baymard grid layout guideline](https://baymard.com/guidelines/2272-grid-layout-for-visually-driven-products)
- **WCAG 2.2 standards** (standard references; not re-fetched this session):
  - Target Size Minimum (SC 2.5.8): 24×24 CSS px.
  - Contrast Minimum (SC 1.4.3): 4.5:1 for body text.
  - Use of Color (SC 1.4.1): don't use colour as the only way to convey information.
  - Sources: [W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); [W3C 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); [W3C 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- **Platform target sizes:** Apple HIG recommends at least 44×44 pt; Material recommends 48×48 dp (standard platform guidance, not re-fetched) — [Apple HIG accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility); [Material accessibility](https://m3.material.io/foundations/designing/structure)

### Inferences
- **Grid sizing:** 2 columns on phones (3 on large phones or tablets, 4–6 on desktop web), with square or 3:4 tiles showing the item in context.
- **Each tile carries:** name, price with coin icon, and a state chip (Owned / Equipped / New / Limited, ending date). States should use an icon plus text, not just colour or greyed-out styling.
- **Detail view:** tapping a tile opens a short bottom sheet with a preview, description and a Buy/Equip button. Per NN/g, include a Close button and Back support, and don't stack sheets. On desktop, use a side panel (like Fortnite's preview panel) or a modal.
- **Primary action placement:** a full-width CTA at the bottom of the sheet is conventional. Don't rely on "bottom = reachable" alone; also make targets large (44–48 px).
- **Category chips:** horizontally scrollable chips at the top, or a segmented control. Keep the coin balance sticky.
- **Dark-themed felt/casino palettes:** check gold-on-green and white-on-felt text against the 4.5:1 contrast ratio, and respect OS text scaling.

### Gaps
- No game-specific accessibility audits of shop UIs were found. The Game UI Database was not consulted in this pass (no search hits returned).

## Evidence and case studies (A/B tests, analyst write-ups)

### Takeaway
Public, quantified shop-redesign A/B results are scarce. Most practitioner guidance (Balancy 2024, devtodev 2019, Naavik 2022) is qualitative, and hard numbers come mainly from e-commerce vendors (Shopify, Baymard) or regulators.

### Cited Findings
- **Balancy book excerpt (Aug 2024):** contains no A/B statistics, only heuristics and game examples (Love&Pies "Best Value" on the largest pack; Fablewood x2 first-purchase bonus; Family Tree "No Ads" as a bundle's main item) — [Game Developer](https://www.gamedeveloper.com/production/best-practices-for-in-game-shops-chapter-3-working-on-conversion)
- **devtodev's six-tier price ladder** ($0.99–$49.99) with tiers 5–6 claimed to yield 51%+ of store profit. This is an estimate with no study cited (2019) — [devtodev](https://www.devtodev.com/resources/articles/how-to-improve-a-free-to-play-in-game-store)
- **Cosmetics prevalence:** decorative skins are in 44% of the top 20% grossing US mobile games and 77% in China (GameRefinery 2021, via Naavik). In the US, 39% of gamers aged 13–45 have paid for skins (Newzoo 2020) — [Naavik](https://naavik.co/deep-dives/selling-cosmetics-part1/)
- **Mobile product-list UX:** 78% of mobile e-commerce sites are "poor" to "mediocre" (Baymard 2025) — [Baymard](https://baymard.com/research-articles/current-state-product-list-and-filtering)
- **3D/AR preview lifts:** +44% add-to-cart and +65% purchase (Rebecca Minkoff via Shopify; vendor-reported) — [Shopify](https://www.shopify.com/blog/ar-shopping)

### Inferences
- For the report: present shop-layout recommendations as **convention plus regulatory guardrails**, not as A/B-proven. Cite e-commerce preview data as directional support for live previews.
- **Instrumentation to propose:** shop open rate, preview-to-purchase rate, equip rate after purchase, and the effect of "X coins to go" cues on quest engagement.

### Gaps
- No Deconstructor of Fun, GameRefinery or Liquid & Grit article with quantified shop-redesign results was found; most of that material is in podcasts or behind paywalls.
- No GDC talk on shop UX was located in this pass.
- No Appcues data on in-app stores was found.
