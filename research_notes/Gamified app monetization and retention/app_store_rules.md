# App Store and Google Play Rules for a Paid Blackjack-Strategy and Card-Counting Education App (Capacitor iOS/Android + Web)

Research date: 2026-11-24. Apple App Review Guidelines page shows "Last Updated: October 16, 2026". Several fee/legal items are still moving (Supreme Court argument in Apple v. Epic is set for Jan 11, 2027), so re-check them before launch.

## 1. In-app purchase rules, anti-steering, commissions

### Takeaway
On both stores, the default is that subscriptions and consumables (hearts/energy refills, gems) must use Apple IAP or Google Play Billing. In the US storefront, though, apps may now also include buttons and links to web checkout such as Stripe. On iOS-US, Apple currently charges **0% commission on linked-out purchases**, pending a district-court decision on a fee (Apple has proposed 15%, or 5% for small businesses). On Google Play-US, enrolled developers have paid service fees on alternative billing and external links since Oct 1, 2026. Outside the US, steering rules mostly still apply, except under EU DMA terms.

### Cited Findings
**Apple: IAP requirement**
- Guideline 3.1.1, verbatim: "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase." Purchased credits or in-game currencies "may not expire", and a restore mechanism is required for restorable purchases. — [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 3.1.1(a): link entitlements "are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps." The rule is different elsewhere: "In all other storefronts, except for the United States storefront... apps and their metadata may not include buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than in-app purchase." — [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 3.1.3: apps in the "other purchase methods" categories cannot encourage non-IAP purchasing "except for apps on the United States storefront". — [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 3.1.3(a) reader apps cover only "magazines, newspapers, books, audio, music, and video". The guideline also says the reader entitlement "is not required for developers to include buttons, external links, or other calls to action in their United States storefront apps." — [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

**Apple: Epic v. Apple timeline**
- April 30, 2025: the district court held Apple in civil contempt and barred commissions on linked-out purchases. Apple's earlier (Jan 2024) link-out program had charged 12-27%. — [Tech-Insider](https://tech-insider.org/apple-epic-supreme-court-2026/)
- Dec 11, 2025: the Ninth Circuit affirmed contempt but reversed the zero-commission ban in part. Apple may eventually charge a fee based on "the costs that are genuinely and reasonably necessary for its coordination of external links." The court found 27% prohibitive, and Apple may stop developers from making their links more prominent than Apple's own. — [Justia, 9th Cir. No. 25-2935](https://law.justia.com/cases/federal/appellate-courts/ca9/25-2935/25-2935-2025-12-11.html); [Fenwick](https://www.fenwick.com/insights/publications/ninth-circuit-largely-upholds-ruling-in-epic-v-apple); [SCL LLP](https://scl-llp.com/ninth-circuit-upholds-apple-contempt-finding-but-narrows-scope-of-remedial-relief/)
- June 30, 2026: the Supreme Court granted review, limited to the contempt-notice question. Argument is set for Jan 11, 2027. Justice Kagan issued an administrative stay on Aug 12, 2026, and the stay was denied on Aug 13, 2026. — [Tech-Insider](https://tech-insider.org/apple-epic-supreme-court-2026/); [Oyez](https://www.oyez.org/cases/2026/25-1311)
- August 2026: Apple proposed a tiered link-out fee to Judge Gonzalez Rogers. The standard rate would be 15%, with 10% for subscription renewals and partner programs and 5% for Small Business Program apps. Until the court approves a fee, developers pay **nothing** on linked-out purchases. On Nov 13, 2026, Epic filed a discovery motion over Apple's fee rationale. — [Mac Observer](https://www.macobserver.com/news/apple-epic-link-out-commission-proposal-15-percent/); [iClarified](https://www.iclarified.com/101778/apple-seeks-court-approval-for-15-commission-on-external-app-purchases); [MLQ](https://mlq.ai/news/epic-says-apple-is-withholding-122000-documents-on-its-proposed-app-store-link-out-fee-and-asks-for-daily-fines) (secondary news sources; not verified against the docket)

**Apple: IAP commission**
- The Small Business Program charges 15% on paid apps and IAP for developers under $1M in prior-year proceeds. Above that threshold, the standard rate applies for the rest of the year. — [Apple Small Business Program](https://developer-mdn.apple.com/app-store/small-business-program/); [RevenueCat](https://www.revenuecat.com/blog/growth/enroll-app-store-small-business-program/)
- After a subscriber completes 12 paid months, the rate on that subscription drops to 15%. Under the EU alternative terms, Apple offers 10% for small business and for post-year-one subscriptions. — [RevenueCat](https://www.revenuecat.com/blog/growth/enroll-app-store-small-business-program/); [Apple SBP page](https://developer.apple.com/app-store/small-business-program/?page=2)

**Google Play**
- Payments policy: apps must use Google Play Billing for in-app digital purchases, including "virtual currencies, extra lives, additional playtime". The exceptions are Section 3 (physical goods, etc.), Section 8 (alternative billing programs) and Section 9 (external offers/links programs). Section 4 bars steering outside those programs. — [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738)
- US changes, effective Oct 29, 2025 (after the Ninth Circuit upheld the Epic v. Google injunction on Sept 12, 2025): Google will not require Play Billing for US users, and will not bar links or communication about outside pricing. Alternative billing and external content links programs launched Dec 9, 2025. Enrolled developers must report transactions and pay service fees from Oct 1, 2026. Download-based fees for external links were deferred to Feb 1, 2027 (announced Oct 21, 2026). The Mar 4, 2026 Epic settlement asked for a revised injunction. — [Google Play Console Help: US policy update](https://support.google.com/googleplay/android-developer/answer/15582165?hl=en)
- Reported fee levels (secondary sources, which conflict):
  - 10% on auto-renewing subscriptions, and 20% on other digital goods (or 15% in some tiers).
  - A 5% billing fee applies only when Play Billing processes the payment.
  - External-link fees apply to purchases completed within 24 hours of the link, and there may be per-install fees.
  - Sources: [RefundHalt](https://refundhalt.com/blog/google-play-us-alternative-billing-refunds); [Android Newswire](https://androidnewswire.com/news/google-play-store-external-billing-june-30-2026-fee-structure-developers); [Neonpay](https://www.neonpay.com/blog/google-plays-new-u.s.-billing-linking-policies-what-game-developers-need-to-know). One source claims the settlement was withdrawn July 15, 2026 — [Tech-Insider](https://tech-insider.org/epic-google-play-store-changes-2026/) — but this is unverified.
- Official program enrollment pages: [External content links (US)](https://support.google.com/googleplay/android-developer/answer/16470497?hl=en-GB&ref_topic=15819563); [Billing choice program](https://support.google.com/googleplay/android-developer/answer/17161464?hl=en)

### Inferences
- A card-counting trainer is not a reader app; it falls under 3.1.1. Recommended iOS setup: offer IAP for everyone, and add a "Subscribe on web (save X%)" Stripe link for US users only. Geo-gate that link so it is hidden in non-US storefronts.
- With US link-outs on iOS at 0% for now, web checkout is financially attractive. Plan for a possible 5-15% Apple fee later, and for disclosure or prominence rules that the court may approve.
- On Android-US, an external link is not free: the service fee still applies and only the 5% billing component is saved. The margin advantage over Play Billing is small. For a small developer, plain Play Billing (15% on subscriptions) may be simpler.
- The web version is outside both stores. Users who buy on the web can log in to the mobile apps. Purchases made outside the app being used in the app is allowed under 3.1.3(b) multiplatform services, but only if the item is also offered via IAP (see Gaps).
- Consumables such as hearts or gems bought via IAP must not expire. Design energy refills so that purchased refills persist.

### Gaps
- Exact current Google US fee schedule: I could not open the official program pages' fee tables. Secondary sources disagree.
- Exact text of Apple 3.1.3(b) multiplatform services was not captured in this fetch. From prior knowledge, it allows content purchased elsewhere if it is also available as IAP. Verify this.
- EU DMA details (Apple Core Technology Commission and Store Services fees, and the EU StoreKit External Purchase entitlement) were not researched in depth this session. The only finding is that a 10% rate exists for small business under the EU alternative terms.
- The remand fee decision is pending, with no date found.

## 2. Subscription requirements

### Takeaway
Both stores require clear disclosures of price, billing period, renewal and trial conversion before purchase. Both require easy cancellation and a way to manage the subscription. Apple requires a restore mechanism and in-app account deletion. Google requires an account-deletion web link in the Data safety form.

### Cited Findings
- Apple 3.1.2(a): subscriptions must "provide ongoing value", and periods must be "at least seven days and be available across all of the user's devices." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple 3.1.2(c): "Before asking a customer to subscribe, you should clearly describe what the user will get for the price... Ensure you clearly communicate the requirements described in Schedule 2 of the Apple Developer Program License Agreement." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple 3.1.1: "make sure you have a restore mechanism for any restorable in-app purchases." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple 5.1.1(v): "If your app supports account creation, you must also offer account deletion within the app." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Google Play Subscriptions policy:
  - Developers must be transparent about offer terms, cost, billing frequency and renewal, and "Users should not have to perform any additional action to review the information."
  - Subscriptions must give "sustained or recurring value".
  - Prohibited flows include monthly pricing that obscures annual charges, and subscribe buttons users could tap by accident.
  - Trials must state duration, price and included content, and "let your users know how and when a free trial will convert to a paid subscription", including how to cancel before conversion.
  - Apps must offer an easy online cancellation method, such as a link to the Play Subscription Center.
  - New: from Jan 27, 2027, eligibility-based discounts (e.g., student plans) must disclose criteria, verification and post-eligibility pricing.
  - Source: [Google Play Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533)
- Google account deletion:
  - Apps with account creation must provide a web link where users can request account and data deletion without reinstalling the app. The link goes in the Data safety form and must name the app or developer.
  - Source: [Play Console Help 13327111](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-GB); [Android Developers Blog, Apr 2023](https://android-developers.googleblog.com/2023/04/giving-people-more-control-over-their-data.html)

### Inferences
- Paywall checklist:
  - Show price per period and the total billed amount, with the billed amount most prominent.
  - Show trial length and the date or amount it converts to.
  - Show auto-renew wording and how to cancel.
  - Add Terms and Privacy links.
  - Add a "Restore Purchases" button.
  - Add a "Manage subscription" link (Apple's showManageSubscriptions / App Store settings; Play's Subscription Center deep link).
  - Add in-app account deletion on iOS and a public web deletion URL for Google. The web version's account page can serve both.
- Users who subscribed on the web via Stripe need cancel and manage links to the Stripe portal, because the store subscription UIs will not show those subscriptions.

### Gaps
- Full Schedule 2 disclosure wording (title, length, price per unit, etc.) was not fetched. Apple reviewers commonly enforce it, but it is not quoted here.

## 3. Gambling and simulated gambling policies; card-counting apps

### Takeaway
**This is the biggest risk.** Apple 5.3.4 says, verbatim: "Illegal gambling aids, including card counters, are not permitted on the App Store." Even so, many card-counting **trainers** are live on the US App Store, including the long-running Blackjack Apprenticeship apps (rated 17+). In practice Apple appears to read "card counters" as devices or apps used *during* real casino play, not education or practice tools. The app should be positioned and built strictly as a training simulator. Google's policy bans real-money wagering and links to real casinos. Simulated casinos are allowed but cannot carry gambling ads.

### Cited Findings
- Apple 5.3 intro: gambling is "one of the most regulated offerings"; developers should be "prepared for extra time during the review process." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 5.3.3: "Apps may not use in-app purchase to purchase credit or currency for use in conjunction with real money gaming of any kind." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 5.3.4: real-money gaming must be licensed, geo-restricted and free. "Illegal gambling aids, including card counters, are not permitted on the App Store." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Card-counting trainer apps currently listed on the App Store:
  - [Blackjack & Card Counting Pro 17+](https://apps.apple.com/us/app/id388857410) (Blackjack Apprenticeship, app id from ~2010)
  - [Blackjack Card Counting Trainer Free 17+](https://apps.apple.com/us/app/id582187547)
  - [Blackjack Apprenticeship BJ 21](https://apps.apple.com/us/app/-/id6717589612)
  - [Expert Card Counting](https://apps.apple.com/us/app/-/id6444629083)
  - [Card Counting Coach](https://apps.apple.com/app/id1546423936)
  - [Reckon: Blackjack Trainer](https://apps.apple.com/us/app/-/id6768187788) (Hi-Lo lessons, "no betting", $99.99 lifetime)
  - [High Count: Blackjack Trainer](https://apps.apple.com/app/id6780065723)
- A forum case: a developer flagged under 5.3.4 proposed making the app free, UK-only and with "no illegal aids". The outcome is unknown. — [Apple Developer Forums 116814](https://developer.apple.com/forums/thread/116814)
- Google Play Real-Money Gambling, Games and Contests policy:
  - "we don't allow content or services that enable or facilitate users' ability to wager" unless the app meets the licensed-gambling requirements.
  - Example violation: "A simulated casino game that promotes or directs users to real money casinos."
  - Apps showing gambling ads must not "provide simulated gambling content", must not "provide gambling or real money game... support or companion functionality", and must not show gambling ads to known under-18 users.
  - The policy does not mention card counting or education.
  - Source: [Google Play policy 9877032](https://support.google.com/googleplay/android-developer/answer/9877032)
- I found no documented case of a card-counting education app being rejected or removed under 5.3.4. — searched forums and rejection guides ([Shopapper 5.3 guide](https://shopapper.com/fix-apple-gambling-app-rejection-guideline-5-3/))

### Inferences
- Rejection risk factors:
  - Any feature that works as a live in-casino aid: a real-time count tracker meant for use at a table, camera or card-scanning input, discreet modes, Apple Watch "count at the table" features, or bet-sizing prompts tied to a live game.
  - Real-money links, casino affiliate links or casino ads.
  - Marketing copy like "beat the casino", "win money" or "use at the tables".
- Safer framing:
  - "Training and education. Practice only; uses play chips with no cash value."
  - Drills run on in-app simulated shoes only.
  - Include a responsible-gambling disclaimer and a note that card counting is legal but casinos may refuse play.
  - In review notes, cite similar approved trainers and say explicitly that the app is not an in-casino device.
- On Google Play, avoid every gambling or casino ad network and any links to real-money operators. A simulated-gambling app cannot run gambling ads at all.
- Practice-bankroll chips must never be cashable, transferable or redeemable for prizes. Otherwise the app becomes real-money gambling, or sweepstakes under 5.3.1-5.3.2.

### Gaps
- No official Apple statement defining "card counters" was found, and no published rejection case either. The interpretation above is inferred from live listings.
- The Google Play "simulated gambling" Families/ads sub-rules were only partly captured, because the page was truncated.

## 4. Age ratings

### Takeaway
Under Apple's July 2025 overhaul (tiers 4+/9+/13+/16+/18+; 12+ and 17+ removed), **frequent simulated gambling means 18+** and infrequent means 13+. A blackjack trainer is effectively frequent simulated gambling, so expect **18+ on iOS**. On Google Play, the IARC questionnaire will likely give Mature 17+ (ESRB) / PEGI 18 or similar.

### Cited Findings
- Apple announced the updated age ratings on July 24, 2025, adding 13+, 16+ and 18+. The new questionnaire answers were required by Jan 31, 2026. — [Apple Developer News](https://developer.apple.com/news/?id=ks775ehf); [ptkd.com](https://ptkd.com/journal/app-store-age-ratings-2025-update)
- Apple defines Simulated Gambling as "Betting or wagering without using real money or in-game currency that can be exchanged for real money."
  - Infrequent means 13+ and frequent means 18+.
  - Australia: infrequent means R 18+. Brazil: A12.
  - Gambling (real) means 18+.
  - Loot boxes mean 9+ (16+ in Australia).
  - Frequent contests (leaderboards, competitions) mean 13+.
  - Source: [Apple age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions)
- Ratings are per country or region and can be stricter regionally. — [Apple Developer News](https://developer.apple.com/news/?id=ks775ehf)
- Existing trainers carry legacy "17+" labels, for example [Blackjack & Card Counting Pro 17+](https://apps.apple.com/us/app/id388857410).

### Inferences
- An 18+ rating fits the intended adult audience. It limits Screen Time and Family-managed discovery, but that is not a problem for this market.
- On Google, the IARC "Simulated Gambling" descriptor would apply. Do not target children in the Play target-audience settings, because Families policy and simulated gambling conflict.

### Gaps
- I did not fetch Google's IARC rating mapping for simulated gambling, so the exact ESRB/PEGI outcomes are not confirmed. From prior knowledge, PEGI typically gives 12+ or higher for simulated gambling (18 under newer PEGI rules) and ESRB gives T or M with a "Simulated Gambling" descriptor. Verify this.

## 5. Virtual currency, gems in a simulated bankroll, loot boxes

### Takeaway
Gems may be sold via IAP or Play Billing. They must not expire on iOS, and they must have no real-world cash-out value. Using purchased currency to top up a play-chip bankroll is legally sensitive ("social casino" territory). It is allowed on both stores but pushes the app firmly into simulated-gambling 18+ territory. Any randomized paid reward requires odds disclosure before purchase on both stores.

### Cited Findings
- Apple 3.1.1: in-game currencies must use IAP, and IAP currency "may not expire". Loot boxes "must disclose the odds of receiving each type of item to customers prior to purchase." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple 5.3.3: no IAP currency "in conjunction with real money gaming of any kind." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple's simulated-gambling definition excludes currency that "can be exchanged for real money". Exchangeable currency turns the app into Gambling (18+, with licensing required). — [Apple age ratings](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions)
- Google Payments policy Section 7: randomized items, including "loot boxes", "must clearly disclose the odds of receiving those items in advance of" and "in close and timely proximity to" the purchase. Virtual currencies must use Play Billing (unless the developer is in a US program). — [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738)

### Inferences
- Lower-risk design:
  - Gems buy cosmetic items, extra drills or energy refills.
  - Chip-bankroll resets are free or earned.
  - If chips can be bought, chips buy nothing of value and cannot be cashed out, traded or gifted.
  - Avoid paid random rewards. If mystery chests are used, show odds on the purchase screen.
- Selling chips for a "casino bankroll" makes the app look like a social casino, which raises review scrutiny and some US state-law exposure (social-casino litigation). Selling training value (lessons, drills, analytics) fits the education positioning better.

### Gaps
- US state social-casino case law was not researched this session.

## 6. Capacitor and Guideline 4.2 (minimum functionality)

### Takeaway
Apple rejects apps that feel like "a repackaged website". Capacitor itself is not the problem. The problem is an app that behaves like the website, which is a real risk here because a web version exists. Reviewers have rejected apps even when they had push, location and share integrations.

### Cited Findings
- Apple 4.2: apps should "elevate it beyond a repackaged website... If your App doesn't provide some sort of lasting entertainment value or adequate utility, it may not be accepted." 4.2.2: apps shouldn't be primarily "web clippings, content aggregators, or a collection of links." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Apple 4.7: HTML5/JS mini apps and games not embedded in the binary are the developer's responsibility to keep compliant. — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Developer reports:
  - Using Capacitor or Cordova "to just load a website" gets apps rejected.
  - Reviewers have said push, Core Location and sharing "do not provide a robust enough experience".
  - Linking out to Safari counts against an app.
  - Suggested fixes: more native UI, an onboarding screen (reviewers spend about 5 minutes), and an explanation of features in the Resolution Center.
  - Sources: [Ionic Forum 200908](https://forum.ionicframework.com/t/app-store-rejection-4-2-design-minimum-functionality-my-first-after-2-years-of-ionic/200908); [Ionic Forum 189688](https://forum.ionicframework.com/t/apple-4-2-minimum-functionality/189688); [Apple Dev Forums 94920](https://developer.apple.com/forums/thread/94920); [Apple Dev Forums 126359](https://developer.apple.com/forums/thread/126359)

### Inferences
- Mitigations:
  - Bundle all web assets locally rather than loading a remote URL.
  - Work fully offline (drills, simulator, progress).
  - Use haptics on correct and incorrect answers, native StoreKit/Play Billing purchase sheets, local notifications for streak reminders, widgets or Live Activities if feasible, Sign in with Apple, Game Center leaderboards and achievements, and iCloud or native storage sync.
  - Use smooth native-feeling gestures and safe-area handling, and keep links to Safari minimal.
  - Provide a demo account and clear review notes describing interactive features.
- A substantial interactive trainer with a card simulator is far stronger than content-only lesson pages. Lead the reviewer straight into the interactive drills.

### Gaps
- No official Capacitor-specific guidance from Apple was found. All evidence is anecdotal from forums.

## 7. Push notifications

### Takeaway
Apple prohibits marketing or promotional pushes without explicit in-app opt-in consent and an in-app opt-out. The app must not require push to function.

### Cited Findings
- Apple 4.5.4: "Push Notifications must not be required for the app to function... should not be used for promotions or direct marketing purposes unless customers have explicitly opted in to receive them via consent language displayed in your app's UI, and you provide a method in your app for a user to opt out from receiving such messages." — [Apple Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Inferences
- Use a separate in-app toggle, such as "Offers and promotions", distinct from the OS permission and from transactional or streak reminders.
- Treat streak and "your hearts are refilled" pushes as functional, but keep them non-promotional. Never push discounts without the marketing opt-in.
- Android 13+ requires the POST_NOTIFICATIONS runtime permission (prior knowledge; not sourced this session).

### Gaps
- Google Play's specific push or notification-spam policy text was not fetched.
