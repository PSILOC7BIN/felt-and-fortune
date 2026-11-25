# Las Vegas Strip Casino Blackjack Rules (research as of 2026-11-24)

## What are the current rules for each property's main blackjack games?

### Takeaway
The only rule-by-rule, per-table dataset I found for Strip 3:2 games is the Wizard of Vegas survey. Its Strip rows are dated **January 2025**. The page itself was updated 2026-11-20, but that recheck covered only downtown casinos. Vegas Advantage's 2026 Strip survey (updated 2026-05-18) adds qualitative 2026 updates, mainly 6:5 games, H17 changes and minimum-bet ranges. It confirms the general pattern: S17 6-deck 3:2 games are mostly limited to high-limit rooms ($100+). Floor games are H17 3:2 at $25-$100 or 6:5 at $10-$25. 6:5 rows have mostly "unverified" sub-rules because no source gave them.

### Cited Findings
- The Wizard of Vegas survey lists only true 3:2 games: "The following table shows only true 3-2 Blackjack games in the Las Vegas area." House edges assume total-dependent basic strategy and a cut card. The table is labeled January 2025. The "Checked November 21, 2026" note applies only to Ellis Island, El Cortez, Downtown Grand and Golden Nugget, none of which are on the Strip. — [Wizard of Vegas Blackjack Survey](https://wizardofvegas.com/guides/blackjack-survey/)
- Wizard of Vegas legend codes: d10 = double on 10/11 only; ds = DAS; ls = late surrender; rsa = resplit aces; nm = no mid-shoe entry; sc = cut card; shoe = SD/DD dealt from a shoe; notch/pv = penetration set by notch / varies by dealer. According to my fetch, no Strip row carries d10, so double-on-any-two is recorded for every 3:2 row. The survey does not report CSM use or max splits. — [Wizard of Vegas](https://wizardofvegas.com/guides/blackjack-survey/)
- The Vegas Advantage central-Strip page reads "Last Updated on May 18, 2026" and tells readers to assume H17 unless noted. Max bets are not given. Per-property notes are in `rules_update_2026` in the JSON below. — [Vegas Advantage Central Strip](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/)
- Vegas Advantage aggregate counts across the Strip (May 2026):
  - 3:2 S17 double-deck at 7 casinos, $50-$500.
  - 3:2 H17 double-deck at 17 casinos, $15-$200.
  - 3:2 S17 6/8-deck at 20 casinos, $50-$500.
  - 6:5 6/8-deck at 27 casinos, $5-$25.
  - 6:5 Free Bet at 24 properties.
  - Blackjack Switch only at Wynn and Encore.
  - Double Down Madness (3:2, no splits) at nine properties.
  
  — [Vegas Advantage](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/)
- Resorts World's 6:5 games use a CSM. This is the only explicit CSM statement in any source. — [Vegas Advantage](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/)
- Circus Circus has no 3:2 games, live or video, and a typical $10 minimum. Slots A Fun deals a 6:5 game with a $5 minimum. — [Vegas Advantage](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/); [Vegas Advantage 2026 hub (updated 2026-05-26)](https://vegasadvantage.com/las-vegas-blackjack/)
- Source conflicts to flag:
  - **Horseshoe:** Wizard of Vegas (Jan 2025) lists a 6-deck S17 game. Vegas Advantage (May 2026) says all Horseshoe games are H17.
  - **MGM Grand:** Wizard of Vegas lists a $50-min 6-deck S17 game. Vegas Advantage says S17 is now only in high limit.
  - **Palazzo:** the Vegas Advantage text both lists games and says "no live dealer games", which contradicts itself.
  
  — [WoV](https://wizardofvegas.com/guides/blackjack-survey/); [VA](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/)
- Coordinates are approximate values from general knowledge of public (Wikipedia/OSM-style) coordinates. They were **not fetched per property in this session**, so verify them before you publish. Addresses are the official street addresses as commonly published. I did not individually re-fetch them either.

### Location table

| Casino | Address | ZIP | Lat | Lng | Website | Status |
|---|---|---|---|---|---|---|
| Bellagio | 3600 S Las Vegas Blvd | 89109 | 36.1129 | -115.1765 | https://bellagio.mgmresorts.com | open |
| Aria | 3730 S Las Vegas Blvd | 89158 | 36.1072 | -115.1766 | https://aria.mgmresorts.com | open |
| Park MGM | 3770 S Las Vegas Blvd | 89109 | 36.103 | -115.176 | https://parkmgm.mgmresorts.com | open |
| Cosmopolitan of Las Vegas | 3708 S Las Vegas Blvd | 89109 | 36.1097 | -115.174 | https://www.cosmopolitanlasvegas.com | open |
| Wynn Las Vegas | 3131 S Las Vegas Blvd | 89109 | 36.1265 | -115.1657 | https://www.wynnlasvegas.com | open |
| Encore Las Vegas | 3121 S Las Vegas Blvd | 89109 | 36.129 | -115.165 | https://www.wynnlasvegas.com/encore | open |
| Venetian | 3355 S Las Vegas Blvd | 89109 | 36.1212 | -115.1697 | https://www.venetianlasvegas.com | open |
| Palazzo (at The Venetian Resort) | 3325 S Las Vegas Blvd | 89109 | 36.124 | -115.168 | https://www.venetianlasvegas.com | open |
| Caesars Palace | 3570 S Las Vegas Blvd | 89109 | 36.1162 | -115.1745 | https://www.caesars.com/caesars-palace | open |
| MGM Grand | 3799 S Las Vegas Blvd | 89109 | 36.1025 | -115.17 | https://mgmgrand.mgmresorts.com | open |
| Mandalay Bay | 3950 S Las Vegas Blvd | 89119 | 36.0909 | -115.1762 | https://mandalaybay.mgmresorts.com | open |
| Luxor | 3900 S Las Vegas Blvd | 89119 | 36.0955 | -115.1761 | https://luxor.mgmresorts.com | open |
| Excalibur | 3850 S Las Vegas Blvd | 89109 | 36.0986 | -115.1754 | https://excalibur.mgmresorts.com | open |
| New York-New York | 3790 S Las Vegas Blvd | 89109 | 36.1023 | -115.1746 | https://newyorknewyork.mgmresorts.com | open |
| Resorts World Las Vegas | 3000 S Las Vegas Blvd | 89109 | 36.1343 | -115.1658 | https://www.rwlasvegas.com | open |
| Fontainebleau Las Vegas | 2777 S Las Vegas Blvd | 89109 | 36.1376 | -115.1608 | https://www.fontainebleaulasvegas.com | open |
| Treasure Island | 3300 S Las Vegas Blvd | 89109 | 36.1247 | -115.1721 | https://treasureisland.com | open |
| Flamingo | 3555 S Las Vegas Blvd | 89109 | 36.1162 | -115.1709 | https://www.caesars.com/flamingo-las-vegas | open |
| Harrah's Las Vegas | 3475 S Las Vegas Blvd | 89109 | 36.1193 | -115.1716 | https://www.caesars.com/harrahs-las-vegas | open |
| The LINQ | 3535 S Las Vegas Blvd | 89109 | 36.1177 | -115.1706 | https://www.caesars.com/linq | open |
| Paris Las Vegas | 3655 S Las Vegas Blvd | 89109 | 36.1125 | -115.1707 | https://www.caesars.com/paris-las-vegas | open |
| Horseshoe Las Vegas (formerly Bally's) | 3645 S Las Vegas Blvd | 89109 | 36.1144 | -115.1695 | https://www.caesars.com/horseshoe-las-vegas | open (renamed from Bally's Dec 2022) |
| Planet Hollywood | 3667 S Las Vegas Blvd | 89109 | 36.11 | -115.172 | https://www.caesars.com/planet-hollywood | open |
| SAHARA Las Vegas | 2535 S Las Vegas Blvd | 89109 | 36.1424 | -115.1567 | https://www.saharalasvegas.com | open |
| The STRAT | 2000 S Las Vegas Blvd | 89104 | 36.1475 | -115.1566 | https://thestrat.com | open |
| Circus Circus | 2880 S Las Vegas Blvd | 89109 | 36.1377 | -115.1652 | https://www.circuscircus.com | open |
| The Vanderpump Hotel (formerly The Cromwell) | 3595 S Las Vegas Blvd | 89109 | 36.1153 | -115.1721 | https://www.caesars.com/vanderpump-hotel | open (rebranded from The Cromwell, stays from May 2026) |
| The Mirage (closed; site becoming Hard Rock Las Vegas) | 3400 S Las Vegas Blvd | 89109 | 36.1212 | -115.1741 | https://www.hardrock.com | closed 2024-07-17; Hard Rock Las Vegas targeting Q4 2027 opening |
| Tropicana Las Vegas (demolished) | 3801 S Las Vegas Blvd | 89109 | 36.0998 | -115.1712 |  | closed 2024-04-02; imploded 2024-10-09; site of Athletics ballpark (target 2028) |

### Blackjack game table (3:2 rows = Wizard of Vegas Jan 2025; 6:5 rows = Vegas Advantage May 2026)

| Casino | Status | Game | Decks | BJ | S17/H17 | DAS | Surr | RSA | Min | Max | CSM | Edge |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bellagio | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $300 | $10000 | unverified | 0.19% |
| Bellagio | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Bellagio | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $50 | $10000 | unverified | 0.46% |
| Bellagio | open | 8-deck shoe 6:5 | 8 | 6:5 | unverified | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Aria | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $500 | $10000 | unverified | 0.19% |
| Aria | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Aria | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $100 | $10000 | unverified | 0.46% |
| Aria | open | 6-deck shoe 6:5 | 6 | 6:5 | unverified | Y | late | Y | $25 (VA May 2026) | unverified | unverified | unverified |
| Park MGM | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $100 | $10000 | unverified | 0.19% |
| Park MGM | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Park MGM | open | 8-deck shoe (payout per VA: floor game; Free Bet 6:5) | 8 | 6:5 | unverified | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Cosmopolitan of Las Vegas | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $200 | $10000 | unverified | 0.19% |
| Cosmopolitan of Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $200 | $10000 | unverified | 0.26% |
| Cosmopolitan of Las Vegas | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | late | 1 | $50 | $5000 | unverified | 0.49% |
| Cosmopolitan of Las Vegas | open | 8-deck shoe 6:5 | 8 | 6:5 | unverified | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Wynn Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $200 | $10000 | unverified | 0.4% |
| Wynn Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $500 | $10000 | unverified | 0.26% |
| Wynn Las Vegas | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $100 | $10000 | unverified | 0.46% |
| Encore Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $100 | $10000 | unverified | 0.4% |
| Encore Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $500 | $10000 | unverified | 0.26% |
| Encore Las Vegas | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $100 | $10000 | unverified | 0.46% |
| Encore Las Vegas | open | 6-deck shoe 6:5 | 6 | 6:5 | unverified | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Venetian | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $300 | $10000 | unverified | 0.4% |
| Venetian | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $300 | $10000 | unverified | 0.26% |
| Venetian | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | none | 1 | $100 | $10000 | unverified | 0.59% |
| Venetian | open | 6:5 shoe tables (decks NS) | unverified | 6:5 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |
| Palazzo (at The Venetian Resort) | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Palazzo (at The Venetian Resort) | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $200 | $10000 | unverified | 0.4% |
| Palazzo (at The Venetian Resort) | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | none | 1 | $100 | $10000 | unverified | 0.59% |
| Caesars Palace | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $200 | $10000 | unverified | 0.4% |
| Caesars Palace | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $200 | $10000 | unverified | 0.26% |
| Caesars Palace | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 0 | $50 | $5000 | unverified | 0.54% |
| MGM Grand | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $500 | $10000 | unverified | 0.19% |
| MGM Grand | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $50 | $10000 | unverified | 0.26% |
| MGM Grand | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $25 | $10000 | unverified | 0.46% |
| Mandalay Bay | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $100 | $10000 | unverified | 0.19% |
| Mandalay Bay | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Mandalay Bay | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | none | 1 | $25 | $5000 | unverified | 0.59% |
| Luxor | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $50 | $5000 | unverified | 0.4% |
| Luxor | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $50 | $5000 | unverified | 0.46% |
| Luxor | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | late | 1 | $25 | $5000 | unverified | 0.49% |
| Luxor | open | 8-deck shoe 6:5 | 8 | 6:5 | H17 | unverified | unverified | unverified | unverified | unverified | unverified | unverified |
| Excalibur | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $50 | $5000 | unverified | 0.46% |
| Excalibur | open | 6:5 tables (decks NS) | unverified | 6:5 | unverified | unverified | unverified | unverified | $15-$25 typical; two $5 tables (VA May 2026) | unverified | unverified | unverified |
| New York-New York | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $200 | $5000 | unverified | 0.4% |
| New York-New York | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $100 | $5000 | unverified | 0.46% |
| New York-New York | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | late | 1 | $50 | $5000 | unverified | 0.49% |
| Resorts World Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Resorts World Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $100 | $10000 | unverified | 0.4% |
| Resorts World Las Vegas | open | 6:5 tables (decks NS) | unverified | 6:5 | unverified | unverified | unverified | unverified | unverified | unverified | yes (CSM per VA May 2026) | unverified |
| Fontainebleau Las Vegas | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $300 | $10000 | unverified | 0.19% |
| Fontainebleau Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Fontainebleau Las Vegas | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $50 | $5000 | unverified | 0.46% |
| Treasure Island | open | Double-deck 3:2 S17 | 2 | 3:2 | S17 | 1 | none | 0 | $50 | $5000 | unverified | 0.19% |
| Treasure Island | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $15 | $2000 | unverified | 0.4% |
| Treasure Island | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $50 | $5000 | unverified | 0.26% |
| Treasure Island | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $15 | $2000 | unverified | 0.46% |
| Treasure Island | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | late | 1 | $15 | $2000 | unverified | 0.49% |
| Flamingo | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $100 | $5000 | unverified | 0.53% |
| Flamingo | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 0 | $100 | $10000 | unverified | 0.33% |
| Flamingo | open | 8-deck shoe 6:5 | 8 | 6:5 | H17 | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Harrah's Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $100 | $5000 | unverified | 0.53% |
| Harrah's Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 0 | $100 | $10000 | unverified | 0.33% |
| Harrah's Las Vegas | open | 6:5 tables (decks NS) | unverified | 6:5 | H17 | unverified | unverified | unverified | unverified | unverified | unverified | unverified |
| The LINQ | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $50 | $3000 | unverified | 0.53% |
| The LINQ | open | 8-deck shoe 6:5 | 8 | 6:5 | unverified | unverified | unverified | unverified | $10-$50 range (VA May 2026) | unverified | unverified | unverified |
| Paris Las Vegas | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Paris Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $100 | $5000 | unverified | 0.53% |
| Paris Las Vegas | open | Floor double-deck / 8-deck 6:5 | unverified | 6:5 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |
| Horseshoe Las Vegas (formerly Bally's) | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $100 | $5000 | unverified | 0.53% |
| Horseshoe Las Vegas (formerly Bally's) | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Horseshoe Las Vegas (formerly Bally's) | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | late | 1 | $100 | $10000 | unverified | 0.46% |
| Horseshoe Las Vegas (formerly Bally's) | open | 8-deck shoe 6:5 | 8 | 6:5 | H17 | Y | unverified | unverified | unverified | unverified | unverified | unverified |
| Planet Hollywood | open | 6-deck shoe 3:2 S17 | 6 | 3:2 | S17 | 1 | late | 1 | $100 | $10000 | unverified | 0.26% |
| Planet Hollywood | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 0 | none | 0 | $25 | $5000 | unverified | 0.53% |
| Planet Hollywood | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | late | 0 | $25 | $5000 | unverified | 0.56% |
| SAHARA Las Vegas | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $100 | $3000 | unverified | 0.4% |
| SAHARA Las Vegas | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | none | 0 | $50 | $3000 | unverified | 0.66% |
| SAHARA Las Vegas | open | 8-deck shoe 3:2 H17 | 8 | 3:2 | H17 | 1 | none | 1 | $25 | $2000 | unverified | 0.59% |
| The STRAT | open | Double-deck 3:2 H17 | 2 | 3:2 | H17 | 1 | none | 0 | $25 | $2000 | unverified | 0.4% |
| The STRAT | open | 6-deck shoe 3:2 H17 | 6 | 3:2 | H17 | 1 | none | 1 | $15 | $2000 | unverified | 0.56% |
| Circus Circus | open | Live blackjack (6:5; no 3:2 games) | unverified | 6:5 | unverified | unverified | unverified | unverified | $10 typical (VA May 2026) | unverified | unverified | unverified |
| The Vanderpump Hotel (formerly The Cromwell) | open | Floor tables (most 6:5) | unverified | 6:5 | unverified | unverified | unverified | unverified | $15-$100 range (VA May 2026) | unverified | unverified | unverified |
| The Mirage (closed; site becoming Hard Rock Las Vegas) | closed 2024-07-17; Hard Rock Las Vegas targeting Q4 2027 opening | none | - | - | - | - | - | - | - | - | - | - |
| Tropicana Las Vegas (demolished) | closed 2024-04-02; imploded 2024-10-09; site of Athletics ballpark (target 2028) | none | - | - | - | - | - | - | - | - | - | - |

### JSON dataset

```json
[
 {
  "name": "Bellagio",
  "address": "3600 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1129,
  "lng": -115.1765,
  "website": "https://bellagio.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$300 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "1 table(s) at survey; dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "10 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "8 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet (6:5, VA 2026); video BJ 6:5",
  "rules_update_2026": "VA May 2026: S17 now only in high limit (S17 pit by craps downgraded 2020); mins $15-$500; six-deck 3:2 and double-deck still offered.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Aria",
  "address": "3730 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89158",
  "lat": 36.1072,
  "lng": -115.1766,
  "website": "https://aria.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$500 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "2 table(s) at survey; no mid-shoe entry, penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "2 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "4 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 6:5",
    "decks": 6,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": true,
    "surrender": "late",
    "rsa": true,
    "max_splits": "unverified",
    "min_bet": "$25 (VA May 2026)",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet (6:5, VA 2026); video BJ 6:5",
  "rules_update_2026": "VA May 2026: high-limit games S17; floor min $25.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Park MGM",
  "address": "3770 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.103,
  "lng": -115.176,
  "website": "https://parkmgm.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "2 table(s) at survey; no mid-shoe entry, dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "2 table(s) at survey; no mid-shoe entry; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe (payout per VA: floor game; Free Bet 6:5)",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026 lists 8-deck DAS on floor; payout of 8-deck not explicitly stated - treat 6:5 as unverified"
   }
  ],
  "special_games": "Free Bet 6:5 (VA 2026); video 6:5",
  "rules_update_2026": "VA May 2026: both high-limit games S17 (double-deck DAS; six-deck surrender + RSA); mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Cosmopolitan of Las Vegas",
  "address": "3708 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1097,
  "lng": -115.174,
  "website": "https://www.cosmopolitanlasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "6 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.49%",
    "notes": "6 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; hybrid 6:5 and video BJ (VA 2026)",
  "rules_update_2026": "VA May 2026: high-limit 6-deck and double-deck S17; mins $25-$200.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Wynn Las Vegas",
  "address": "3131 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1265,
  "lng": -115.1657,
  "website": "https://www.wynnlasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "7 table(s) at survey; no mid-shoe entry, dealt from shoe, penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$500 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "6 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "8 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Blackjack Switch; Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: six games, DAS, some surrender/RSA; mins $25-$500.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Encore Las Vegas",
  "address": "3121 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.129,
  "lng": -115.165,
  "website": "https://www.wynnlasvegas.com/encore",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "2 table(s) at survey; no mid-shoe entry, dealt from shoe, penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$500 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "5 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "5 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 6:5",
    "decks": 6,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026; surrender/RSA at most tables"
   }
  ],
  "special_games": "Blackjack Switch; Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: mins $15-$500.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Venetian",
  "address": "3355 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1212,
  "lng": -115.1697,
  "website": "https://www.venetianlasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$300 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "2 table(s) at survey; dealt from shoe, penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$300 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "5 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.59%",
    "notes": "2 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6:5 shoe tables (decks NS)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; Double Down Madness; Spanish 21 discontinued; hybrid/video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: mins $25-$300.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Palazzo (at The Venetian Resort)",
  "address": "3325 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.124,
  "lng": -115.168,
  "website": "https://www.venetianlasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "9 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "5 table(s) at survey; cut card; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.59%",
    "notes": "1 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Double Down Madness; Free Bet (VA 2026)",
  "rules_update_2026": "VA May 2026: double-, six-, eight-deck, 3:2 or 6:5; mins $15-$200. (VA text also says 'no live dealer games' - internally contradictory; flag.)",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Caesars Palace",
  "address": "3570 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1162,
  "lng": -115.1745,
  "website": "https://www.caesars.com/caesars-palace",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "2 table(s) at survey; cut card, penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "8 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.54%",
    "notes": "7 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Free Bet; video/stadium 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: double-deck, 8-deck (DAS), Free Bet on floor; some high-limit S17; mins $25-$200.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "MGM Grand",
  "address": "3799 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1025,
  "lng": -115.17,
  "website": "https://mgmgrand.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$500 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "6 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "5 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Double Down Madness; Free Bet; stadium 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: S17 only in high limit; mins $15-$500 (conflicts with WoV Jan 2025 $50 S17 6-deck - likely changed).",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Mandalay Bay",
  "address": "3950 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89119",
  "lat": 36.0909,
  "lng": -115.1762,
  "website": "https://mandalaybay.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "2 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "6 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.59%",
    "notes": "3 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Double Down Madness; Free Bet; heads-up/stadium 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: S17 games exist; mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Luxor",
  "address": "3900 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89119",
  "lat": 36.0955,
  "lng": -115.1761,
  "website": "https://luxor.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "1 table(s) at survey; no mid-shoe entry, dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "1 table(s) at survey; no mid-shoe entry; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.49%",
    "notes": "1 table(s) at survey; no mid-shoe entry; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026: H17 at all tables"
   }
  ],
  "special_games": "Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: H17 at all tables; high limit peak hours only; mins $5-$500.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Excalibur",
  "address": "3850 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.0986,
  "lng": -115.1754,
  "website": "https://excalibur.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6:5 tables (decks NS)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "$15-$25 typical; two $5 tables (VA May 2026)",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; video 6:5 and even-money (VA 2026)",
  "rules_update_2026": "VA May 2026: DAS, surrender, RSA offered.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "New York-New York",
  "address": "3790 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1023,
  "lng": -115.1746,
  "website": "https://newyorknewyork.mgmresorts.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$200 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "1 table(s) at survey; dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "1 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.49%",
    "notes": "1 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Double Down Madness; Free Bet; stadium/video (VA 2026)",
  "rules_update_2026": "VA May 2026: all H17 incl. high limit (consistent with WoV); high limit = double- and six-deck; mins $7-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Resorts World Las Vegas",
  "address": "3000 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1343,
  "lng": -115.1658,
  "website": "https://www.rwlasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "7 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "1 table(s) at survey; dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6:5 tables (decks NS)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "yes (CSM per VA May 2026)",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: four games; mins $15-$100; 6:5 games on CSM.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Fontainebleau Las Vegas",
  "address": "2777 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1376,
  "lng": -115.1608,
  "website": "https://www.fontainebleaulasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$300 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "2 table(s) at survey; no mid-shoe entry, dealt from shoe, penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "11 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "3 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: six games 3:2 or 6:5; all DAS; most surrender/RSA; mins $25-$300.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Treasure Island",
  "address": "3300 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1247,
  "lng": -115.1721,
  "website": "https://treasureisland.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 S17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.19%",
    "notes": "3 table(s) at survey; no mid-shoe entry, dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$15 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "4 table(s) at survey; no mid-shoe entry, dealt from shoe; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "3 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$15 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$15 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.49%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Live stadium BJ $3 min 3:2 S17; video/hybrid (VA 2026)",
  "rules_update_2026": "VA May 2026: most games 3:2, one 6:5; mins $15-$50.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Flamingo",
  "address": "3555 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1162,
  "lng": -115.1709,
  "website": "https://www.caesars.com/flamingo-las-vegas",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "2 table(s) at survey; cut card, penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.33%",
    "notes": "1 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; heads-up electronic 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: new 3:2 pit game late 2025; two 3:2 high-limit games; 6-deck S17, all others H17; mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Harrah's Las Vegas",
  "address": "3475 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1193,
  "lng": -115.1716,
  "website": "https://www.caesars.com/harrahs-las-vegas",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "2 table(s) at survey; no mid-shoe entry, cut card; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.33%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6:5 tables (decks NS)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: high-limit 6-deck S17, others H17; mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "The LINQ",
  "address": "3535 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1177,
  "lng": -115.1706,
  "website": "https://www.caesars.com/linq",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$3000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "1 table(s) at survey; cut card, penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "$10-$50 range (VA May 2026)",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026; VA also lists a 3:2 8-deck option"
   }
  ],
  "special_games": "6:5 Free Bet; video 6:5; O'Sheas inside Linq: 6:5 Free Bet & 8-deck (VA 2026)",
  "rules_update_2026": "VA May 2026: 3:2 double-deck no DAS (consistent with WoV); new high-limit area late 2025.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Paris Las Vegas",
  "address": "3655 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1125,
  "lng": -115.1707,
  "website": "https://www.caesars.com/paris-las-vegas",
  "status": "open",
  "games": [
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "3 table(s) at survey; penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "2 table(s) at survey; no mid-shoe entry / no sitting out, cut card, penetration varies by dealer; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Floor double-deck / 8-deck 6:5",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026: double-deck H17 no DAS"
   }
  ],
  "special_games": "Free Bet 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: high-limit S17 game; $25 3:2 pit game; mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Horseshoe Las Vegas (formerly Bally's)",
  "address": "3645 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1144,
  "lng": -115.1695,
  "website": "https://www.caesars.com/horseshoe-las-vegas",
  "status": "open (renamed from Bally's Dec 2022)",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "2 table(s) at survey; no mid-shoe entry; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.46%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "unverified",
    "das": true,
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026"
   }
  ],
  "special_games": "Free Bet (VA 2026)",
  "rules_update_2026": "CONFLICT: VA May 2026 says ALL games H17, so the WoV Jan 2025 6-deck S17 game may no longer exist - treat S17 row as unverified for 2026. Mins $15-$50.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Planet Hollywood",
  "address": "3667 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.11,
  "lng": -115.172,
  "website": "https://www.caesars.com/planet-hollywood",
  "status": "open",
  "games": [
   {
    "name": "6-deck shoe 3:2 S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$10000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.26%",
    "notes": "5 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 0,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.53%",
    "notes": "3 table(s) at survey; no mid-shoe entry, cut card; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "late",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$5000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.56%",
    "notes": "2 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Double Down Madness; Free Bet; stadium/video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: salon double-deck H17 no DAS, six-deck S17 w/ surrender; mins $15-$100.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "SAHARA Las Vegas",
  "address": "2535 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1424,
  "lng": -115.1567,
  "website": "https://www.saharalasvegas.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$100 (usual, Jan 2025)",
    "max_bet": "$3000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$50 (usual, Jan 2025)",
    "max_bet": "$3000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.66%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "8-deck shoe 3:2 H17",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.59%",
    "notes": "1 table(s) at survey; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Free Bonus Blackjack; video 6:5 (VA 2026)",
  "rules_update_2026": "VA May 2026: four games, DAS; most 6:5, some 3:2; mins $15-$50.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "The STRAT",
  "address": "2000 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89104",
  "lat": 36.1475,
  "lng": -115.1566,
  "website": "https://thestrat.com",
  "status": "open",
  "games": [
   {
    "name": "Double-deck 3:2 H17",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 0,
    "max_splits": "unverified",
    "min_bet": "$25 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.4%",
    "notes": "3 table(s) at survey; no mid-shoe entry, dealt from shoe, penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   },
   {
    "name": "6-deck shoe 3:2 H17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards (no d10 restriction flagged in survey)",
    "das": 1,
    "surrender": "none",
    "rsa": 1,
    "max_splits": "unverified",
    "min_bet": "$15 (usual, Jan 2025)",
    "max_bet": "$2000 (usual, Jan 2025)",
    "csm": "unverified",
    "house_edge": "0.56%",
    "notes": "5 table(s) at survey; penetration set by notch; house edge per WoV (total-dependent basic strategy, cut card)"
   }
  ],
  "special_games": "Free Ride Blackjack; heads-up/multiplayer/stadium video (VA 2026)",
  "rules_update_2026": "VA May 2026: three 3:2 games, DAS; some RSA; mins $5-$25.",
  "source_urls": [
   "https://wizardofvegas.com/guides/blackjack-survey/",
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/"
  ],
  "source_dates": [
   "2025-01 (Wizard of Vegas 3:2 survey table labeled 'January 2025'; page updated 2026-11-20, Strip rows not re-verified)",
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')"
  ]
 },
 {
  "name": "Circus Circus",
  "address": "2880 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1377,
  "lng": -115.1652,
  "website": "https://www.circuscircus.com",
  "status": "open",
  "games": [
   {
    "name": "Live blackjack (6:5; no 3:2 games)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "$10 typical (VA May 2026)",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA: no 3:2 live or video games; decks/H17 not stated"
   }
  ],
  "special_games": "Slots A Fun (adjacent): 6:5 live game, $5 min (VA 2026)",
  "rules_update_2026": "Not in WoV 3:2 survey (consistent with no 3:2 games).",
  "source_urls": [
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/",
   "https://vegasadvantage.com/las-vegas-blackjack/"
  ],
  "source_dates": [
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')",
   "2026-05-26 (Vegas Advantage 2026 survey hub)"
  ]
 },
 {
  "name": "The Vanderpump Hotel (formerly The Cromwell)",
  "address": "3595 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1153,
  "lng": -115.1721,
  "website": "https://www.caesars.com/vanderpump-hotel",
  "status": "open (rebranded from The Cromwell, stays from May 2026)",
  "games": [
   {
    "name": "Floor tables (most 6:5)",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "max_splits": "unverified",
    "min_bet": "$15-$100 range (VA May 2026)",
    "max_bet": "unverified",
    "csm": "unverified",
    "house_edge": "unverified",
    "notes": "VA May 2026: many tables standard doubling; high limit limited hours"
   }
  ],
  "special_games": "Free Bet; video 6:5 (VA 2026)",
  "rules_update_2026": "Not in WoV Jan 2025 3:2 table.",
  "source_urls": [
   "https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/",
   "https://investor.caesars.com/node/35991",
   "https://www.hospitalitynet.org/news/4131558"
  ],
  "source_dates": [
   "2026-05-18 (Vegas Advantage page 'Last Updated May 18, 2026')",
   "2026-03-23 (Caesars release: bookings open, stays from May 2026)",
   "2026 (Hospitality Net)"
  ]
 },
 {
  "name": "The Mirage (closed; site becoming Hard Rock Las Vegas)",
  "address": "3400 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.1212,
  "lng": -115.1741,
  "website": "https://www.hardrock.com",
  "status": "closed 2024-07-17; Hard Rock Las Vegas targeting Q4 2027 opening",
  "games": [],
  "special_games": "",
  "rules_update_2026": "EXCLUDE from active directory; no blackjack.",
  "source_urls": [
   "https://lasvegassun.com/news/2024/may/15/mirage-to-close-in-july-for-hard-rock-rebranding/",
   "https://www.covers.com/industry/hard-rock-las-vegas-taking-shape-ahead-of-2027-opening-jan-7-2026",
   "https://cdcgaming.com/hard-rock-las-vegas-construction-progressing-at-former-mirage-site-preparing-for-2027-opening"
  ],
  "source_dates": [
   "2024-05-15",
   "2026-01-07",
   "2026 (CDC Gaming)"
  ]
 },
 {
  "name": "Tropicana Las Vegas (demolished)",
  "address": "3801 S Las Vegas Blvd",
  "city": "Las Vegas",
  "state": "NV",
  "zip": "89109",
  "lat": 36.0998,
  "lng": -115.1712,
  "website": "",
  "status": "closed 2024-04-02; imploded 2024-10-09; site of Athletics ballpark (target 2028)",
  "games": [],
  "special_games": "",
  "rules_update_2026": "EXCLUDE; no blackjack.",
  "source_urls": [
   "https://mlb.com/news/press-release-tropicana-las-vegas-says-final-farewell-with-historic-implosion-making-way-for-a-s-ballpark",
   "https://abc7.com/post/tropicana-las-vegas-strip-shutting-down-tuesday/14603788/"
  ],
  "source_dates": [
   "2024-10-09",
   "2024-04"
  ]
 }
]
```

### Inferences
- In 3:2 rows, min/max bets are "usual" values as of January 2025. Vegas Advantage's 2026 ranges show floor minimums of $15-$25 at most properties, often on 6:5 tables. Expect 3:2 minimums to be at or above the January 2025 figures.
- The best widely available Strip game is the 6-deck S17/DAS/LS/RSA game (0.26%), mostly at $100+ minimums. Double-deck S17 (0.19%) is offered at Bellagio, Aria, Park MGM, Cosmopolitan, MGM Grand, Mandalay Bay, Fontainebleau and Treasure Island ($50+ at TI).
- Caesars Entertainment double-deck games (Flamingo, Harrah's, Linq, Paris, Horseshoe, Planet Hollywood) are H17 with no DAS (0.53%).

### Gaps
- Max splits / resplit-to-N: neither source gives this. Marked "unverified" everywhere.
- CSM: only confirmed at Resorts World (6:5 games). Every other row is "unverified".
- Per-row 2026 re-verification: the 3:2 rows are January 2025 data. No source re-verified each table in 2025-2026. Vegas Advantage gives only 2026 qualitative notes.
- 6:5 games: decks, H17/S17, DAS and limits are mostly not given per property.
- I did not use LVA (members-only) or Current Blackjack News (paywalled). Casino official sites do not publish table rules.
- Not covered: Hard Rock (pre-opening), Casino Royale (Vegas Advantage says it has no table games), Slots A Fun, O'Sheas, and Strip-adjacent Virgin/Palms/Rio. South Point is in the Wizard of Vegas table but is ~6 mi south of the Strip, so I excluded it.

## Which properties have closed or rebranded, and should be excluded or marked?

### Takeaway
Exclude The Mirage and Tropicana; neither offers blackjack. Mark three renames: Bally's to Horseshoe (Dec 2022), The Cromwell to The Vanderpump Hotel (stays from May 2026), and The Mirage to Hard Rock Las Vegas (not open yet, target Q4 2027).

### Cited Findings
- The Mirage closed July 17, 2024 for a full rebuild as Hard Rock Las Vegas. — [Las Vegas Sun, 2024-05-15](https://lasvegassun.com/news/2024/may/15/mirage-to-close-in-july-for-hard-rock-rebranding/)
- Hard Rock is targeting a Q4 2027 opening. As of January 2026, 28 of 42 stories of the Guitar Hotel were built. — [Covers, 2026-01-07](https://www.covers.com/industry/hard-rock-las-vegas-taking-shape-ahead-of-2027-opening-jan-7-2026); [CDC Gaming](https://cdcgaming.com/hard-rock-las-vegas-construction-progressing-at-former-mirage-site-preparing-for-2027-opening)
- The Tropicana was imploded October 9, 2024 for the Athletics ballpark, which targets 2028. It closed in April 2024. — [MLB.com press release](https://mlb.com/news/press-release-tropicana-las-vegas-says-final-farewell-with-historic-implosion-making-way-for-a-s-ballpark); [ABC7](https://abc7.com/post/tropicana-las-vegas-strip-shutting-down-tuesday/14603788/)
- Bally's became Horseshoe Las Vegas in December 2022. — [Vegas Advantage](https://vegasadvantage.com/las-vegas-blackjack/central-las-vegas-strip-blackjack/); [WoV](https://wizardofvegas.com/guides/blackjack-survey/)
- The Cromwell was rebranded as The Vanderpump Hotel. Caesars opened bookings March 23, 2026 for stays from May 2026. — [Caesars investor release](https://investor.caesars.com/node/35991); [Hospitality Net](https://www.hospitalitynet.org/news/4131558)

### Inferences
- In the app, keep Mirage and Tropicana as "closed" records only for historical context, or drop them. Add Hard Rock when it opens and new rules are surveyed.

### Gaps
- I did not confirm the exact Tropicana closing date in a fetched article (April 2, 2024, per the ABC7 headline context).
- I found no 2026 blackjack rule data specific to The Vanderpump Hotel beyond Vegas Advantage's "most floor tables 6:5".
