# US Casino Blackjack Rules: South, Midwest & West (excluding Nevada)

Research date: 2026-11-24. Scope: 41 casinos in MS, LA, MI, IN, IL, MO, OK, FL, CA (tribal), AZ, CO, NM, WA.

**How to read this dataset (important for the app):**
- **Main source:** blackjack.tools casino profiles. These are dated reports sent in by players. Each profile itemizes one "representative" 3:2 game with its full rules, and also counts other recorded games that it does not itemize. The site itself says these are "recorded conditions, not confirmed current availability." Each record carries its report date (mostly 2025). Example: [Beau Rivage profile](https://blackjack.tools/casino/beau-rivage-biloxi-169).
- **Secondary sources:**
  - [free-bet-advice.com Biloxi review](https://free-bet-advice.com/casinos/biloxi-casinos.html): the page is stamped "Desk updated" 2026-10-12, but it says its figures are "as of the original writing." A search snippet put that writing at about 1,215 days old, so roughly 2023.
  - Easy Money Blackjack charts for [Michigan](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/) and [Tunica](https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/). These carry no date (only a (c)2026 footer). The Tunica page's latest dated item is from Feb 2021.
  - Games taken only from these secondary sources are flagged in their notes as "treat as unverified for 2025-26."
- **No casino in scope publishes a full rules card online** that I could find. Thunder Valley's official page lists its variants but no rules ([Thunder Valley table games](https://www.thundervalleyresort.com/casino/table-games)). Talking Stick's page describes blackjack only generically.
- **CSM field:** blackjack.tools records "Auto" (automatic shuffler) or "Hand", but it does not say whether "Auto" means a batch shuffler or a continuous shuffler. "Auto" games are therefore coded `no (automatic shuffler recorded; batch vs continuous not specified)`. Coding them `no` is reasonable because the same records report penetration figures, and a CSM game has no penetration. A game is coded `yes` only when a source explicitly says "continuous shuffle."
- **Coordinates:** geocoded on 2026-11-24 from each street address through OpenStreetMap Nominatim. A few matched a building or point on the casino property rather than its centroid (for example a parking structure, restaurant or adjoining hotel). They are accurate enough for a map pin.
- **Status:** every property had blackjack reports during 2025 (Gold Strike's latest detailed record is 2024-05-20). I found no source confirming 2026 operating status independently, so status reads "open (active table-game reports in 2025; 2026 status not independently confirmed)."
- **Limits:** limits come from player reports and are dated, and blackjack.tools does not store a currency. They describe the table reported, not the casino's whole range.

## Q1. Casino records and blackjack rules (dataset)

### Takeaway
I found 41 casinos with at least one dated 2024-2025 rule record (Talking Stick has an address and location only, with rules unverified). Almost all itemized games pay 3:2 and allow doubling on any two cards plus double after split (DAS). Surrender is essentially absent. The soft-17 rule splits regionally: H17 is the default in Mississippi, Missouri, California tribal, Arizona, Colorado, New Mexico and Washington. S17 shows up in Lake Charles/Kinder LA, Oklahoma (Choctaw, WinStar), Horseshoe Hammond, Rivers Des Plaines, MotorCity and Treasure Bay.

### Cited Findings

#### Location / directory table
| # | Casino | Address | ZIP | Lat | Lng | Website | Status | Rule sources (date) |
|---|---|---|---|---|---|---|---|---|
| 1 | Beau Rivage Resort & Casino | 875 Beach Blvd, Biloxi, MS | 39530 | 30.39267 | -88.89187 | https://beaurivage.mgmresorts.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/beau-rivage-biloxi-169); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 2 | Hard Rock Hotel & Casino Biloxi | 777 Beach Blvd, Biloxi, MS | 39530 | 30.3918 | -88.88755 | https://www.hrhcbiloxi.com | open per 2025 reports | [2025-01-21](https://blackjack.tools/casino/hard-rock-biloxi-biloxi-167); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 3 | IP Casino Resort Spa | 850 Bayview Ave, Biloxi, MS | 39530 | 30.41116 | -88.88916 | https://www.ipbiloxi.com | open per 2025 reports | [2024-12-03](https://blackjack.tools/casino/ip-biloxi-biloxi-168); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 4 | Golden Nugget Biloxi | 151 Beach Blvd, Biloxi, MS | 39530 | 30.39342 | -88.87531 | https://www.goldennugget.com/biloxi/ | open per 2025 reports | [2025-03-17](https://blackjack.tools/casino/golden-nugget-biloxi-biloxi-473); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 5 | Harrah's Gulf Coast | 280 Beach Blvd (blackjack.tools lists 265 Beach Blvd), Biloxi, MS | 39530 | 30.39346 | -88.87573 | https://www.caesars.com/harrahs-gulf-coast | open per 2025 reports | [2025-01-21](https://blackjack.tools/casino/harrah-s-gulf-coast-biloxi-166); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 6 | Treasure Bay Casino & Hotel | 1980 Beach Blvd, Biloxi, MS | 39531 | 30.39384 | -88.95519 | https://treasurebay.com | open per 2025 reports | [2024-07-25](https://blackjack.tools/casino/treasure-bay-biloxi-biloxi-171); [c. 2023 (page updated 2026-10-12)](https://free-bet-advice.com/casinos/biloxi-casinos.html) |
| 7 | Scarlet Pearl Casino Resort | 9380 Central Ave, D'Iberville, MS | 39540 | 30.4234 | -88.89113 | https://www.scarletpearlcasino.com/ | open per 2025 reports | [2025-04-21](https://blackjack.tools/casino/scarlet-pearl-casino-resort-d-iberville-536) |
| 8 | Horseshoe Tunica | 1021 Casino Center Dr, Tunica Resorts, MS | 38664 | 34.84744 | -90.33102 | https://www.caesars.com/horseshoe-tunica | open per 2025 reports | [2025-07-01](https://blackjack.tools/casino/horseshoe-tunica-tunica-resorts-180); [undated (c)2026 chart](https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/) |
| 9 | Gold Strike Casino Resort | 1010 Casino Center Dr, Tunica Resorts, MS | 38664 | 34.8463 | -90.33257 | https://goldstrike.com/ | open per 2025 reports | [2024-05-20](https://blackjack.tools/casino/gold-strike-tunica-tunica-resorts-178); [undated (c)2026 chart](https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/) |
| 10 | Caesars New Orleans (formerly Harrah's New Orleans) | 8 Canal St (blackjack.tools: 'Canal at the River'), New Orleans, LA | 70130 | 29.95021 | -90.06545 | https://www.caesars.com/caesars-new-orleans | open per 2025 reports | [2025-10-01](https://blackjack.tools/casino/caesars-new-orleans-new-orleans-128) |
| 11 | L'Auberge Casino Resort Lake Charles | 777 Ave L'Auberge, Lake Charles, LA | 70601 | 30.20218 | -93.25567 | https://www.llakecharles.com | open per 2025 reports | [2025-04-03](https://blackjack.tools/casino/lauberge-casino-resort-lake-charles-lake-charles-126) |
| 12 | Golden Nugget Lake Charles | 2550 Golden Nugget Blvd, Lake Charles, LA | 70601 | 30.20459 | -93.26387 | https://www.goldennugget.com/lake-charles/ | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/golden-nugget-lake-charles-lake-charles-263) |
| 13 | Horseshoe Lake Charles | 100 Westlake Ave, Westlake, LA | 70669 | 30.23404 | -93.24833 | https://www.caesars.com/horseshoe-lake-charles | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/horseshoe-lake-charles-westlake-131) |
| 14 | Coushatta Casino Resort | 777 Coushatta Dr, Kinder, LA | 70648 | 30.54589 | -92.81442 | https://www.coushattacasinoresort.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/coushatta-kinder-125) |
| 15 | MGM Grand Detroit | 1777 3rd St, Detroit, MI | 48226 | 42.33477 | -83.0606 | https://mgmgranddetroit.mgmresorts.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/mgm-grand-detroit-detroit-138); [undated (c)2026 chart](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/) |
| 16 | MotorCity Casino Hotel | 2901 Grand River Ave, Detroit, MI | 48201 | 42.33824 | -83.06697 | https://www.motorcitycasino.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/motor-city-detroit-139); [undated (c)2026 chart](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/) |
| 17 | Hollywood Casino at Greektown | 555 E Lafayette Blvd, Detroit, MI | 48226 | 42.33474 | -83.04113 | https://www.pennentertainment.com/hollywood-greektown/ | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/hollywood-casino-greektown-detroit-137); [undated (c)2026 chart](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/) |
| 18 | Horseshoe Hammond | 777 Casino Center Dr, Hammond, IN | 46320 | 41.69266 | -87.50736 | https://www.caesars.com/horseshoe-hammond | open per 2025 reports | [2025-10-01](https://blackjack.tools/casino/horseshoe-casino-hammond-hammond-90) |
| 19 | Horseshoe Indianapolis | 4300 N Michigan Rd, Shelbyville, IN | 46176 | 39.58788 | -85.82679 | https://www.caesars.com/horseshoe-indianapolis | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/horseshoe-indianapolis-shelbyville-611) |
| 20 | Rivers Casino Des Plaines | 3000 S River Rd, Des Plaines, IL | 60018 | 41.99775 | -87.86433 | https://www.riverscasino.com/desplaines/ | open per 2025 reports | [2025-06-12](https://blackjack.tools/casino/rivers-casino-des-plaines-des-plaines-80) |
| 21 | Ameristar Casino Resort Spa St. Charles | 1 Ameristar Blvd, St. Charles, MO | 63301 | 38.76661 | -90.48383 | unverified | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/ameristar-casino-st-charles-st-charles-193) |
| 22 | Ameristar Casino Hotel Kansas City | 3200 N Ameristar Dr, Kansas City, MO | 64161 | 39.15013 | -94.48433 | https://www.ameristarkansascity.com/ | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/ameristar-kansas-city-kansas-city-188) |
| 23 | Horseshoe St. Louis | 999 N 2nd St, St. Louis, MO | 63102 | 38.63388 | -90.18486 | https://www.caesars.com/horseshoe-st-louis | open per 2025 reports | [2024-12-05](https://blackjack.tools/casino/horseshoe-st-louis-st-louis-195) |
| 24 | WinStar World Casino and Resort | 777 Casino Ave, Thackerville, OK | 73459 | 33.75757 | -97.13162 | https://www.winstar.com | open per 2025 reports | [2025-10-01](https://blackjack.tools/casino/winstar-casino-thackerville-487); [2026-09-27 (updated)](https://www.goodgamblingsites.com/articles/table-game-antes-and-the-house-edge-at-the-winstar-casino/) |
| 25 | Choctaw Casino & Resort Durant | 3735 Choctaw Rd, Durant, OK | 74701 | 33.95427 | -96.41247 | https://www.choctawcasinos.com/durant/ | open per 2025 reports | [2025-07-21](https://blackjack.tools/casino/choctaw-durant-durant-333) |
| 26 | Hard Rock Hotel & Casino Tulsa | 777 W Cherokee St, Catoosa, OK | 74015 | 36.16763 | -95.76604 | https://www.hardrockcasinotulsa.com | open per 2025 reports | [2025-07-22](https://blackjack.tools/casino/hard-rock-tulsa-catoosa-345) |
| 27 | Seminole Hard Rock Hotel & Casino Hollywood | 1 Seminole Way, Hollywood, FL | 33314 | 26.05173 | -80.21124 | https://www.seminolehardrockhollywood.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/seminole-hard-rock-hollywood-hollywood-73) |
| 28 | Seminole Hard Rock Hotel & Casino Tampa | 5223 N Orient Rd, Tampa, FL | 33610 | 27.99365 | -82.37105 | https://www.seminolehardrocktampa.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/seminole-hard-rock-tampa-tampa-77) |
| 29 | Pechanga Resort Casino | 45000 Pechanga Pkwy, Temecula, CA | 92592 | 33.45731 | -117.10786 | https://www.pechanga.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/pechanga-temecula-52) |
| 30 | Morongo Casino Resort & Spa | 49500 Seminole Dr, Cabazon, CA | 92230 | 33.92201 | -116.80122 | https://www.morongocasinoresort.com | open per 2025 reports | [2025-07-29](https://blackjack.tools/casino/morongo-cabazon-21) |
| 31 | Yaamava' Resort & Casino at San Manuel | 777 San Manuel Blvd, Highland, CA | 92346 | 34.15068 | -117.22941 | https://www.sanmanuel.com | open per 2025 reports | [2025-09-01](https://blackjack.tools/casino/yaamava-resort-casino-highland-31) |
| 32 | Thunder Valley Casino Resort | 1200 Athens Ave, Lincoln, CA | 95648 | 38.84037 | -121.31374 | https://www.thundervalleyresort.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/thunder-valley-lincoln-37); [accessed 2026-11-24](https://www.thundervalleyresort.com/casino/table-games) |
| 33 | Talking Stick Resort | 9800 E Talking Stick Way, Scottsdale, AZ | 85256 | 33.54134 | -111.86926 | unverified | open per 2025 reports | [accessed 2026-11-24](https://prod-talking-stick.azurewebsites.net/phoenix-scottsdale-casino/table-games) |
| 34 | Gila River Resorts & Casinos - Wild Horse Pass | 5040 Wild Horse Pass Blvd (OSM: 5040 S Maricopa Rd), Chandler, AZ | 85226 | 33.28166 | -111.97306 | https://playatgila.com | open per 2025 reports | [2025-03-04](https://blackjack.tools/casino/gila-river-wild-horse-pass-chandler-424) |
| 35 | Ameristar Black Hawk | 111 Richman St, Black Hawk, CO | 80422 | 39.80022 | -105.48925 | unverified | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/ameristar-black-hawk-black-hawk-59); [undated](https://uscasinoadvantage.com/gambling/colorado/black-hawk/ameristar/) |
| 36 | Horseshoe Black Hawk | 401 Main St, Black Hawk, CO | 80422 | 39.79832 | -105.48429 | https://www.caesars.com/horseshoe-black-hawk | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/horseshoe-black-hawk-black-hawk-61) |
| 37 | Sandia Resort & Casino | 30 Rainbow Rd NE, Albuquerque, NM | 87113 | 35.20708 | -106.56697 | https://www.sandiacasino.com | open per 2025 reports | [2025-09-01](https://blackjack.tools/casino/sandia-albuquerque-312) |
| 38 | Isleta Resort & Casino | 11000 Broadway Blvd SE, Albuquerque, NM | 87105 | 34.93621 | -106.66164 | unverified | open per 2025 reports | [2025-07-22](https://blackjack.tools/casino/isleta-resort-casino-albuquerque-433) |
| 39 | Muckleshoot Casino Resort | 2402 Auburn Way S, Auburn, WA | 98002 | 47.29033 | -122.19559 | https://www.muckleshootcasino.com | open per 2025 reports | [2025-11-01](https://blackjack.tools/casino/muckleshoot-auburn-379) |
| 40 | Tulalip Resort Casino | 10200 Quil Ceda Blvd, Tulalip, WA | 98271 | 48.08805 | -122.18925 | https://www.tulalipresortcasino.com | open per 2025 reports | [2025-07-24](https://blackjack.tools/casino/tulalip-tulalip-393) |
| 41 | Snoqualmie Casino | 37500 SE North Bend Way, Snoqualmie, WA | 98065 | 47.51863 | -121.84171 | https://www.snocasino.com | open per 2025 reports | [2025-07-08](https://blackjack.tools/casino/snoqualmie-snoqualmie-388) |

#### Blackjack games table (one row per game variant)
Y = allowed, N = not allowed. Min/Max are as reported on the date shown. Full notes are in the JSON.

| # | Casino | City, ST | Game | Decks | BJ | S17/H17 | Double | DAS | Surr | RSA | Min | Max | CSM | Rule date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Beau Rivage Resort & Casino | Biloxi, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $25 | $2,500 | no | 2025-11-01 |
|  |  |  | 6-deck shoe | 6 | 3:2 (implied) | H17 | any two cards | Y | Y | Y | $10-$25 | $10,000 | no | older survey |
|  |  |  | 6-deck CSM | 6 | unverified | H17 | any two cards | Y | Y | Y | $10 | $5,000 | yes | older survey |
|  |  |  | Single deck 6:5 | 1 | 6:5 | H17 | any two cards | N | N | Y | $10 | $5,000 | no | older survey |
| 2 | Hard Rock Hotel & Casino Biloxi | Biloxi, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $25 | $1,000 | no | 2025-01-21 |
|  |  |  | Main-floor shoe games | unverified | 6:5 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |  |
| 3 | IP Casino Resort Spa | Biloxi, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | Y | $50 | $2,500 | no | 2024-12-03 |
|  |  |  | 6-deck shoe | 6 | unverified | H17 | any two cards | Y | N | Y | $10 | $5,000 | no | older survey |
|  |  |  | Single deck 6:5 | 1 | 6:5 | H17 | any two cards | N | N | N | $25 | $2,500 | no | older survey |
| 4 | Golden Nugget Biloxi | Biloxi, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $25 | $1,000 | no | 2025-03-17 |
| 5 | Harrah's Gulf Coast | Biloxi, MS | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | N | $25 | $2,500 | no | 2025-01-21 |
|  |  |  | High-limit 6-deck | 6 | 3:2 | S17 | any two cards | Y | unverified | Y | $200-$500 | unverified | no | older survey |
| 6 | Treasure Bay Casino & Hotel | Biloxi, MS | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | Y | $10 | $500 | no | 2024-07-25 |
|  |  |  | Double deck | 2 | 3:2 | S17 | any two cards | Y | N | Y | $10-$25 | $1,000 | no | older survey |
| 7 | Scarlet Pearl Casino Resort | D'Iberville, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $25 | $2,500 | no | 2025-04-21 |
| 8 | Horseshoe Tunica | Tunica Resorts, MS | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $2,500 | no | 2025-07-01 |
|  |  |  | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | Y | unverified | unverified | no | undated chart |
|  |  |  | Single deck | 1 | 3:2 | H17 | any two cards | N | N | N | unverified | unverified | no | undated chart |
|  |  |  | 8-deck shoe | 8 | 3:2 | H17 | any two cards | Y | N | Y | unverified | unverified | no | undated chart |
| 9 | Gold Strike Casino Resort | Tunica Resorts, MS | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | Y | $25 | $2,500 | no | 2024-05-20 |
|  |  |  | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | unverified | unverified | no | undated chart |
|  |  |  | Single-deck novelty (BJ pays 1:1) | 1 | 1:1 (suited BJ 3:2) | H17 | any two cards | N | anytime | N | unverified | unverified | no | undated chart |
| 10 | Caesars New Orleans (formerly Harrah's New Orleans) | New Orleans, LA | 8-deck shoe | 8 | 3:2 | H17 | any two cards | Y | N | N | $10 | $1,000 | no | 2025-10-01 |
| 11 | L'Auberge Casino Resort Lake Charles | Lake Charles, LA | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $25 | $2,500 | no | 2025-04-03 |
| 12 | Golden Nugget Lake Charles | Lake Charles, LA | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | Y | $100 | $5,000 | no | 2025-11-01 |
| 13 | Horseshoe Lake Charles | Westlake, LA | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | N | $100 | $2,500 | no | 2025-11-01 |
| 14 | Coushatta Casino Resort | Kinder, LA | Double deck | 2 | 3:2 | S17 | any two cards | Y | N | N | $100 | $2,500 | no | 2025-11-01 |
| 15 | MGM Grand Detroit | Detroit, MI | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $25 | $500 | no | 2025-11-01 |
|  |  |  | 6-deck shoe S17 | 6 | 3:2 | S17 | any two cards | Y | N | Y | unverified | unverified | unverified | undated chart |
|  |  |  | 8-deck 6:5 | 8 | 6:5 | H17 | any two cards | Y | N | Y | unverified | unverified | unverified | undated chart |
|  |  |  | Spanish 21 | 6 | 3:2 | H17 | any number of cards incl. redouble | Y | late (plus double-down rescue) | Y | unverified | unverified | unverified | undated chart |
|  |  |  | Free Bet Blackjack | 8 | 3:2 | H17 | any two cards | N | N | N | unverified | unverified | unverified | undated chart |
| 16 | MotorCity Casino Hotel | Detroit, MI | 8-deck shoe | 8 | 3:2 | S17 | any two cards | Y | N | Y | $15 | $1,500 | no | 2025-11-01 |
|  |  |  | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | Y | unverified | unverified | unverified | undated chart |
|  |  |  | 5-deck CSM | 5 | 3:2 | H17 | any two cards | Y | N | Y | unverified | unverified | yes | undated chart |
| 17 | Hollywood Casino at Greektown | Detroit, MI | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $25 | $2,000 | no | 2025-11-01 |
|  |  |  | 5-deck CSM | 5 | 3:2 | H17 | any two cards | Y | N | Y | unverified | unverified | yes | undated chart |
| 18 | Horseshoe Hammond | Hammond, IN | 8-deck shoe | 8 | 3:2 | S17 | any two cards | N | N | N | $10 | $2,500 | no | 2025-10-01 |
| 19 | Horseshoe Indianapolis | Shelbyville, IN | 6-deck shoe | 6 | 3:2 | unverified | any two cards | Y | unverified | N | $100 | $5,000 | unverified | 2025-11-01 |
| 20 | Rivers Casino Des Plaines | Des Plaines, IL | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | N | $50 | $5,000 | no | 2025-06-12 |
| 21 | Ameristar Casino Resort Spa St. Charles | St. Charles, MO | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $15 | $1,000 | no | 2025-11-01 |
| 22 | Ameristar Casino Hotel Kansas City | Kansas City, MO | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $2,000 | no | 2025-11-01 |
| 23 | Horseshoe St. Louis | St. Louis, MO | Double deck | 2 | 3:2 | H17 | 9-11 only | N | N | N | $25 | $2,500 | no | 2024-12-05 |
| 24 | WinStar World Casino and Resort | Thackerville, OK | 6-deck shoe | 6 | 3:2 | S17 | any two cards | conflicting | N | N | $10 | $3,000 | no on the few hand-dealt shoe tables; most other tables are CSM | 2025-10-01 |
| 25 | Choctaw Casino & Resort Durant | Durant, OK | 6-deck shoe | 6 | 3:2 | S17 | any two cards | Y | N | Y | $100 | $1,000 | no | 2025-07-21 |
| 26 | Hard Rock Hotel & Casino Tulsa | Catoosa, OK | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $1,000 | no | 2025-07-22 |
| 27 | Seminole Hard Rock Hotel & Casino Hollywood | Hollywood, FL | 8-deck shoe (3:2) | 8 | 3:2 | H17 | any two cards | Y | N | N | $15 | $2,500 | no | 2025-11-01 |
|  |  |  | Main-floor 6:5 games | unverified | 6:5 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |  |
| 28 | Seminole Hard Rock Hotel & Casino Tampa | Tampa, FL | 8-deck shoe | 8 | 3:2 | unverified | any two cards | Y | unverified | N | $10 | $5,000 | CSMs present on some tables | 2025-11-01 |
| 29 | Pechanga Resort Casino | Temecula, CA | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | N | $100 | $5,000 | no | 2025-11-01 |
| 30 | Morongo Casino Resort & Spa | Cabazon, CA | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | N | $25 | $1,000 | no | 2025-07-29 |
| 31 | Yaamava' Resort & Casino at San Manuel | Highland, CA | Double deck | 2 | 3:2 | H17 | any two cards | Y | N | N | $50 | $5,000 | no | 2025-09-01 |
| 32 | Thunder Valley Casino Resort | Lincoln, CA | 6-deck shoe | 6 | 3:2 | unverified | 9-11 only | Y | unverified | Y | $15 | $500 | unverified | 2025-11-01 |
| 33 | Talking Stick Resort | Scottsdale, AZ | Blackjack (rules not found) | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |  |
| 34 | Gila River Resorts & Casinos - Wild Horse Pass | Chandler, AZ | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $25 | $1,300 | no | 2025-03-04 |
| 35 | Ameristar Black Hawk | Black Hawk, CO | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | unverified | $10 | $2,500 | no | 2025-11-01 |
|  |  |  | Double deck | 2 | 3:2 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified |  |
| 36 | Horseshoe Black Hawk | Black Hawk, CO | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $10,000 | no | 2025-11-01 |
| 37 | Sandia Resort & Casino | Albuquerque, NM | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $1,000 | no | 2025-09-01 |
| 38 | Isleta Resort & Casino | Albuquerque, NM | Double deck | 2 | 3:2 | H17 | any two cards | N | N | N | $25 | $500 | no | 2025-07-22 |
| 39 | Muckleshoot Casino Resort | Auburn, WA | 8-deck shoe | 8 | 3:2 | unverified | any two cards | N | unverified | N | $10 | $500 | unverified | 2025-11-01 |
| 40 | Tulalip Resort Casino | Tulalip, WA | 6-deck shoe | 6 | 3:2 | H17 | any two cards | Y | N | Y | $25 | $500 | no | 2025-07-24 |
| 41 | Snoqualmie Casino | Snoqualmie, WA | 8-deck shoe | 8 | 3:2 | H17 | any two cards | Y | N | Y | $10 | $500 | no | 2025-07-08 |

#### JSON dataset

```json
[
 {
  "name": "Beau Rivage Resort & Casino",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39530",
  "address": "875 Beach Blvd",
  "lat": 30.39267,
  "lng": -88.89187,
  "website": "https://beaurivage.mgmresorts.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-11-01)",
    "max_bet": "$2,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; cut ~0.8 deck."
   },
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2 (implied)",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": true,
    "rsa": true,
    "min_bet": "$10-$25 (older survey)",
    "max_bet": "$10,000 (older survey)",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26."
   },
   {
    "name": "6-deck CSM",
    "decks": 6,
    "bj_payout": "unverified",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": true,
    "rsa": true,
    "min_bet": "$10 (older survey)",
    "max_bet": "$5,000 (older survey)",
    "csm": "yes",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26."
   },
   {
    "name": "Single deck 6:5",
    "decks": 1,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (older survey)",
    "max_bet": "$5,000 (older survey)",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26. Source is internally inconsistent about whether single deck is offered."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/beau-rivage-biloxi-169",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "Hard Rock Hotel & Casino Biloxi",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39530",
  "address": "777 Beach Blvd",
  "lat": 30.3918,
  "lng": -88.88755,
  "website": "https://www.hrhcbiloxi.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-01-21)",
    "max_bet": "$1,000 (2025-01-21)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-01-21. Only reliable 3:2 game; often in high-limit or opened weekend evenings."
   },
   {
    "name": "Main-floor shoe games",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Profile notes say main floor is mostly 6:5 (2025)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/hard-rock-biloxi-biloxi-167",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-01-21",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "IP Casino Resort Spa",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39530",
  "address": "850 Bayview Ave",
  "lat": 30.41116,
  "lng": -88.88916,
  "website": "https://www.ipbiloxi.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$50 (2024-12-03)",
    "max_bet": "$2,500 (2024-12-03)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2024-12-03 (most recent detailed record)."
   },
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "unverified",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (older survey)",
    "max_bet": "$5,000 (older survey)",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26."
   },
   {
    "name": "Single deck 6:5",
    "decks": 1,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (older survey)",
    "max_bet": "$2,500 (older survey)",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/ip-biloxi-biloxi-168",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2024-12-03",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "Golden Nugget Biloxi",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39530",
  "address": "151 Beach Blvd",
  "lat": 30.39342,
  "lng": -88.87531,
  "website": "https://www.goldennugget.com/biloxi/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-03-17)",
    "max_bet": "$1,000 (2025-03-17)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-03-17; cut ~0.9-1.0 deck. Older survey listed this game as S17 with RSA (conflict)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/golden-nugget-biloxi-biloxi-473",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-03-17",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "Harrah's Gulf Coast",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39530",
  "address": "280 Beach Blvd (blackjack.tools lists 265 Beach Blvd)",
  "lat": 30.39346,
  "lng": -88.87573,
  "website": "https://www.caesars.com/harrahs-gulf-coast",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-01-21)",
    "max_bet": "$2,500 (2025-01-21)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-01-21."
   },
   {
    "name": "High-limit 6-deck",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": "unverified",
    "rsa": true,
    "min_bet": "$200-$500 (older survey)",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26. Resplit to four hands."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/harrah-s-gulf-coast-biloxi-166",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-01-21",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "Treasure Bay Casino & Hotel",
  "city": "Biloxi",
  "state": "MS",
  "zip": "39531",
  "address": "1980 Beach Blvd",
  "lat": 30.39384,
  "lng": -88.95519,
  "website": "https://treasurebay.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2024-07-25)",
    "max_bet": "$500 (2024-07-25)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2024-07-25; only six-deck S17 listing in Mississippi on blackjack.tools."
   },
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10-$25 (older survey)",
    "max_bet": "$1,000 (older survey)",
    "csm": "no",
    "notes": "Older third-party survey (content c. 2023; page stamped 'updated' 2026-10-12); treat as unverified for 2025-26."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/treasure-bay-biloxi-biloxi-171",
   "https://free-bet-advice.com/casinos/biloxi-casinos.html",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2024-07-25",
   "c. 2023 (page updated 2026-10-12)",
   "2026-11-24"
  ]
 },
 {
  "name": "Scarlet Pearl Casino Resort",
  "city": "D'Iberville",
  "state": "MS",
  "zip": "39540",
  "address": "9380 Central Ave",
  "lat": 30.4234,
  "lng": -88.89113,
  "website": "https://www.scarletpearlcasino.com/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-04-21)",
    "max_bet": "$2,500 (2025-04-21)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-04-21."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/scarlet-pearl-casino-resort-d-iberville-536",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-04-21",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe Tunica",
  "city": "Tunica Resorts",
  "state": "MS",
  "zip": "38664",
  "address": "1021 Casino Center Dr",
  "lat": 34.84744,
  "lng": -90.33102,
  "website": "https://www.caesars.com/horseshoe-tunica",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-07-01)",
    "max_bet": "$2,500 (2025-07-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-07-01. Double deck may require ID."
   },
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26. No mid-shoe entry."
   },
   {
    "name": "Single deck",
    "decks": 1,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   },
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-tunica-tunica-resorts-180",
   "https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-01",
   "undated (c)2026 chart",
   "2026-11-24"
  ]
 },
 {
  "name": "Gold Strike Casino Resort",
  "city": "Tunica Resorts",
  "state": "MS",
  "zip": "38664",
  "address": "1010 Casino Center Dr",
  "lat": 34.8463,
  "lng": -90.33257,
  "website": "https://goldstrike.com/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$25 (2024-05-20)",
    "max_bet": "$2,500 (2024-05-20)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2024-05-20 (most recent detailed record); scanned ID/players card required to sit."
   },
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   },
   {
    "name": "Single-deck novelty (BJ pays 1:1)",
    "decks": 1,
    "bj_payout": "1:1 (suited BJ 3:2)",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": "anytime",
    "rsa": false,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "no",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26. Non-standard rules: tied blackjack wins, 6-card hand wins, split after hitting allowed."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/gold-strike-tunica-tunica-resorts-178",
   "https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2024-05-20",
   "undated (c)2026 chart",
   "2026-11-24"
  ]
 },
 {
  "name": "Caesars New Orleans (formerly Harrah's New Orleans)",
  "city": "New Orleans",
  "state": "LA",
  "zip": "70130",
  "address": "8 Canal St (blackjack.tools: 'Canal at the River')",
  "lat": 29.95021,
  "lng": -90.06545,
  "website": "https://www.caesars.com/caesars-new-orleans",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$10 (2025-10-01)",
    "max_bet": "$1,000 (2025-10-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-10-01; profile also records 2- and 6-deck games (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/caesars-new-orleans-new-orleans-128",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-10-01",
   "2026-11-24"
  ]
 },
 {
  "name": "L'Auberge Casino Resort Lake Charles",
  "city": "Lake Charles",
  "state": "LA",
  "zip": "70601",
  "address": "777 Ave L'Auberge",
  "lat": 30.20218,
  "lng": -93.25567,
  "website": "https://www.llakecharles.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-04-03)",
    "max_bet": "$2,500 (2025-04-03)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-04-03; mid-shoe entry banned; players card often required."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/lauberge-casino-resort-lake-charles-lake-charles-126",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-04-03",
   "2026-11-24"
  ]
 },
 {
  "name": "Golden Nugget Lake Charles",
  "city": "Lake Charles",
  "state": "LA",
  "zip": "70601",
  "address": "2550 Golden Nugget Blvd",
  "lat": 30.20459,
  "lng": -93.26387,
  "website": "https://www.goldennugget.com/lake-charles/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$100 (2025-11-01)",
    "max_bet": "$5,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; 2-deck games also recorded (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/golden-nugget-lake-charles-lake-charles-263",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe Lake Charles",
  "city": "Westlake",
  "state": "LA",
  "zip": "70669",
  "address": "100 Westlake Ave",
  "lat": 30.23404,
  "lng": -93.24833,
  "website": "https://www.caesars.com/horseshoe-lake-charles",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$100 (2025-11-01)",
    "max_bet": "$2,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; double deck requires ID (rules not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-lake-charles-westlake-131",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Coushatta Casino Resort",
  "city": "Kinder",
  "state": "LA",
  "zip": "70648",
  "address": "777 Coushatta Dr",
  "lat": 30.54589,
  "lng": -92.81442,
  "website": "https://www.coushattacasinoresort.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$100 (2025-11-01)",
    "max_bet": "$2,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; profile records both H17 and S17 games overall."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/coushatta-kinder-125",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "MGM Grand Detroit",
  "city": "Detroit",
  "state": "MI",
  "zip": "48226",
  "address": "1777 3rd St",
  "lat": 42.33477,
  "lng": -83.0606,
  "website": "https://mgmgranddetroit.mgmresorts.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$25 (2025-11-01)",
    "max_bet": "$500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; $15/$25 tables can switch to 6:5 or $35 min in evening (~7:30-9pm)."
   },
   {
    "name": "6-deck shoe S17",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   },
   {
    "name": "8-deck 6:5",
    "decks": 8,
    "bj_payout": "6:5",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   },
   {
    "name": "Spanish 21",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any number of cards incl. redouble",
    "das": true,
    "surrender": "late (plus double-down rescue)",
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26. Spanish deck (tens removed); not standard blackjack."
   },
   {
    "name": "Free Bet Blackjack",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26. Free Bet variant (house-funded free doubles/splits; dealer 22 typically pushes)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/mgm-grand-detroit-detroit-138",
   "https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "undated (c)2026 chart",
   "2026-11-24"
  ]
 },
 {
  "name": "MotorCity Casino Hotel",
  "city": "Detroit",
  "state": "MI",
  "zip": "48201",
  "address": "2901 Grand River Ave",
  "lat": 42.33824,
  "lng": -83.06697,
  "website": "https://www.motorcitycasino.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$15 (2025-11-01)",
    "max_bet": "$1,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01."
   },
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   },
   {
    "name": "5-deck CSM",
    "decks": 5,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "yes",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/motor-city-detroit-139",
   "https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "undated (c)2026 chart",
   "2026-11-24"
  ]
 },
 {
  "name": "Hollywood Casino at Greektown",
  "city": "Detroit",
  "state": "MI",
  "zip": "48226",
  "address": "555 E Lafayette Blvd",
  "lat": 42.33474,
  "lng": -83.04113,
  "website": "https://www.pennentertainment.com/hollywood-greektown/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$25 (2025-11-01)",
    "max_bet": "$2,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; some games moved to 8 decks. Easy Money chart lists Greektown 6-deck as S17 (conflict)."
   },
   {
    "name": "5-deck CSM",
    "decks": 5,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "yes",
    "notes": "Easy Money Blackjack chart, undated (page (c)2026); treat as unverified for 2025-26."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/hollywood-casino-greektown-detroit-137",
   "https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "undated (c)2026 chart",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe Hammond",
  "city": "Hammond",
  "state": "IN",
  "zip": "46320",
  "address": "777 Casino Center Dr",
  "lat": 41.69266,
  "lng": -87.50736,
  "website": "https://www.caesars.com/horseshoe-hammond",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "$10 (2025-10-01)",
    "max_bet": "$2,500 (2025-10-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-10-01; no DAS recorded on this game. 6-deck game also recorded (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-casino-hammond-hammond-90",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-10-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe Indianapolis",
  "city": "Shelbyville",
  "state": "IN",
  "zip": "46176",
  "address": "4300 N Michigan Rd",
  "lat": 39.58788,
  "lng": -85.82679,
  "website": "https://www.caesars.com/horseshoe-indianapolis",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "unverified",
    "double": "any two cards",
    "das": true,
    "surrender": "unverified",
    "rsa": false,
    "min_bet": "$100 (2025-11-01)",
    "max_bet": "$5,000 (2025-11-01)",
    "csm": "unverified",
    "notes": "Recorded 2025-11-01; soft-17 not recorded in row (profile summary lists H17). High-limit double deck reported with 'strong rules' (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-indianapolis-shelbyville-611",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Rivers Casino Des Plaines",
  "city": "Des Plaines",
  "state": "IL",
  "zip": "60018",
  "address": "3000 S River Rd",
  "lat": 41.99775,
  "lng": -87.86433,
  "website": "https://www.riverscasino.com/desplaines/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$50 (2025-06-12)",
    "max_bet": "$5,000 (2025-06-12)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-06-12; state listing notes also mention H17 play (conflict)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/rivers-casino-des-plaines-des-plaines-80",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-06-12",
   "2026-11-24"
  ]
 },
 {
  "name": "Ameristar Casino Resort Spa St. Charles",
  "city": "St. Charles",
  "state": "MO",
  "zip": "63301",
  "address": "1 Ameristar Blvd",
  "lat": 38.76661,
  "lng": -90.48383,
  "website": "unverified",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$15 (2025-11-01)",
    "max_bet": "$1,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; 2-deck games also recorded (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/ameristar-casino-st-charles-st-charles-193",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Ameristar Casino Hotel Kansas City",
  "city": "Kansas City",
  "state": "MO",
  "zip": "64161",
  "address": "3200 N Ameristar Dr",
  "lat": 39.15013,
  "lng": -94.48433,
  "website": "https://www.ameristarkansascity.com/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-11-01)",
    "max_bet": "$2,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/ameristar-kansas-city-kansas-city-188",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe St. Louis",
  "city": "St. Louis",
  "state": "MO",
  "zip": "63102",
  "address": "999 N 2nd St",
  "lat": 38.63388,
  "lng": -90.18486,
  "website": "https://www.caesars.com/horseshoe-st-louis",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "9-11 only",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2024-12-05)",
    "max_bet": "$2,500 (2024-12-05)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2024-12-05 (most recent detailed record); restrictive doubling. Geocode matched the adjoining hotel at the same address."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-st-louis-st-louis-195",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2024-12-05",
   "2026-11-24"
  ]
 },
 {
  "name": "WinStar World Casino and Resort",
  "city": "Thackerville",
  "state": "OK",
  "zip": "73459",
  "address": "777 Casino Ave",
  "lat": 33.75757,
  "lng": -97.13162,
  "website": "https://www.winstar.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": "conflicting (blackjack.tools 2025: yes; goodgamblingsites: no)",
    "surrender": false,
    "rsa": false,
    "min_bet": "$10 (2025-10-01)",
    "max_bet": "$3,000 (2025-10-01)",
    "csm": "no on the few hand-dealt shoe tables; most other tables are CSM",
    "notes": "Oklahoma tribal blackjack is non-house-banked/player-pooled; the casino collects a per-hand ante (fee) regardless of outcome. Ante ~$0.50/hand, $1 at $100+ unless waived (2025). S17 from profile summary and goodgamblingsites; surrender 'no' per goodgamblingsites."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/winstar-casino-thackerville-487",
   "https://www.goodgamblingsites.com/articles/table-game-antes-and-the-house-edge-at-the-winstar-casino/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-10-01",
   "2026-09-27 (updated)",
   "2026-11-24"
  ]
 },
 {
  "name": "Choctaw Casino & Resort Durant",
  "city": "Durant",
  "state": "OK",
  "zip": "74701",
  "address": "3735 Choctaw Rd",
  "lat": 33.95427,
  "lng": -96.41247,
  "website": "https://www.choctawcasinos.com/durant/",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "S17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$100 (2025-07-21)",
    "max_bet": "$1,000 (2025-07-21)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-07-21. Oklahoma tribal blackjack is non-house-banked/player-pooled; the casino collects a per-hand ante (fee) regardless of outcome. Ante ~$0.50 on bets under $50. A single double-deck game (opens ~5pm) has restricted doubling/splitting (details unverified)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/choctaw-durant-durant-333",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-21",
   "2026-11-24"
  ]
 },
 {
  "name": "Hard Rock Hotel & Casino Tulsa",
  "city": "Catoosa",
  "state": "OK",
  "zip": "74015",
  "address": "777 W Cherokee St",
  "lat": 36.16763,
  "lng": -95.76604,
  "website": "https://www.hardrockcasinotulsa.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-07-22)",
    "max_bet": "$1,000 (2025-07-22)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-07-22. Ante amount not in record (unverified). Oklahoma tribal blackjack is non-house-banked/player-pooled; the casino collects a per-hand ante (fee) regardless of outcome."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/hard-rock-tulsa-catoosa-345",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-22",
   "2026-11-24"
  ]
 },
 {
  "name": "Seminole Hard Rock Hotel & Casino Hollywood",
  "city": "Hollywood",
  "state": "FL",
  "zip": "33314",
  "address": "1 Seminole Way",
  "lat": 26.05173,
  "lng": -80.21124,
  "website": "https://www.seminolehardrockhollywood.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe (3:2)",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$15 (2025-11-01)",
    "max_bet": "$2,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01. Unrated players limited to one spot and max bet 10x table min. Dayshift podium pits may run 6-deck S17."
   },
   {
    "name": "Main-floor 6:5 games",
    "decks": "unverified",
    "bj_payout": "6:5",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Profile notes many floor games have moved to 6:5 (2025)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/seminole-hard-rock-hollywood-hollywood-73",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Seminole Hard Rock Hotel & Casino Tampa",
  "city": "Tampa",
  "state": "FL",
  "zip": "33610",
  "address": "5223 N Orient Rd",
  "lat": 27.99365,
  "lng": -82.37105,
  "website": "https://www.seminolehardrocktampa.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "unverified",
    "double": "any two cards",
    "das": true,
    "surrender": "unverified",
    "rsa": false,
    "min_bet": "$10 (2025-11-01)",
    "max_bet": "$5,000 (2025-11-01)",
    "csm": "CSMs present on some tables (per-table unverified)",
    "notes": "Recorded 2025-11-01; soft-17 not in row, notes say most tables are 8-deck H17. Some 6-deck and double-deck tables also reported."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/seminole-hard-rock-tampa-tampa-77",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Pechanga Resort Casino",
  "city": "Temecula",
  "state": "CA",
  "zip": "92592",
  "address": "45000 Pechanga Pkwy",
  "lat": 33.45731,
  "lng": -117.10786,
  "website": "https://www.pechanga.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$100 (2025-11-01)",
    "max_bet": "$5,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01 (likely high-limit given $100 min). High-limit double deck also exists. California tribal casinos are house-banked under Prop 1A; the player-dealer/'no-bust' rules fight applies to commercial cardrooms, not these tribal properties."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/pechanga-temecula-52",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Morongo Casino Resort & Spa",
  "city": "Cabazon",
  "state": "CA",
  "zip": "92230",
  "address": "49500 Seminole Dr",
  "lat": 33.92201,
  "lng": -116.80122,
  "website": "https://www.morongocasinoresort.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-07-29)",
    "max_bet": "$1,000 (2025-07-29)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-07-29. California tribal casinos are house-banked under Prop 1A; the player-dealer/'no-bust' rules fight applies to commercial cardrooms, not these tribal properties."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/morongo-cabazon-21",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-29",
   "2026-11-24"
  ]
 },
 {
  "name": "Yaamava' Resort & Casino at San Manuel",
  "city": "Highland",
  "state": "CA",
  "zip": "92346",
  "address": "777 San Manuel Blvd",
  "lat": 34.15068,
  "lng": -117.22941,
  "website": "https://www.sanmanuel.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": false,
    "min_bet": "$50 (2025-09-01)",
    "max_bet": "$5,000 (2025-09-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-09-01. California tribal casinos are house-banked under Prop 1A; the player-dealer/'no-bust' rules fight applies to commercial cardrooms, not these tribal properties."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/yaamava-resort-casino-highland-31",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-09-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Thunder Valley Casino Resort",
  "city": "Lincoln",
  "state": "CA",
  "zip": "95648",
  "address": "1200 Athens Ave",
  "lat": 38.84037,
  "lng": -121.31374,
  "website": "https://www.thundervalleyresort.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "unverified",
    "double": "9-11 only",
    "das": true,
    "surrender": "unverified",
    "rsa": true,
    "min_bet": "$15 (2025-11-01)",
    "max_bet": "$500 (2025-11-01)",
    "csm": "unverified",
    "notes": "Recorded 2025-11-01; soft-17 not in row (summary lists H17). Official table-games page lists Blackjack, Blackjack Switch, Double Up, Free Bet, Double Down Madness, Spanish 21, Zappit (rules not shown). California tribal casinos are house-banked under Prop 1A; the player-dealer/'no-bust' rules fight applies to commercial cardrooms, not these tribal properties."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/thunder-valley-lincoln-37",
   "https://www.thundervalleyresort.com/casino/table-games",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "accessed 2026-11-24",
   "2026-11-24"
  ]
 },
 {
  "name": "Talking Stick Resort",
  "city": "Scottsdale",
  "state": "AZ",
  "zip": "85256",
  "address": "9800 E Talking Stick Way",
  "lat": 33.54134,
  "lng": -111.86926,
  "website": "unverified",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Blackjack (rules not found)",
    "decks": "unverified",
    "bj_payout": "unverified",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "No dated 2025-26 rule source found; official table-games page describes blackjack only generically."
   }
  ],
  "source_urls": [
   "https://prod-talking-stick.azurewebsites.net/phoenix-scottsdale-casino/table-games",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "accessed 2026-11-24",
   "2026-11-24"
  ]
 },
 {
  "name": "Gila River Resorts & Casinos - Wild Horse Pass",
  "city": "Chandler",
  "state": "AZ",
  "zip": "85226",
  "address": "5040 Wild Horse Pass Blvd (OSM: 5040 S Maricopa Rd)",
  "lat": 33.28166,
  "lng": -111.97306,
  "website": "https://playatgila.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$25 (2025-03-04)",
    "max_bet": "$1,300 (2025-03-04)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-03-04; double deck also recorded (not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/gila-river-wild-horse-pass-chandler-424",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-03-04",
   "2026-11-24"
  ]
 },
 {
  "name": "Ameristar Black Hawk",
  "city": "Black Hawk",
  "state": "CO",
  "zip": "80422",
  "address": "111 Richman St",
  "lat": 39.80022,
  "lng": -105.48925,
  "website": "unverified",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": "unverified",
    "min_bet": "$10 (2025-11-01)",
    "max_bet": "$2,500 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; RSA value not stated in record."
   },
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "unverified",
    "double": "unverified",
    "das": "unverified",
    "surrender": "unverified",
    "rsa": "unverified",
    "min_bet": "unverified",
    "max_bet": "unverified",
    "csm": "unverified",
    "notes": "Third-party guide (undated) reports 3:2 double deck on weekdays before 5pm; rules unverified."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/ameristar-black-hawk-black-hawk-59",
   "https://uscasinoadvantage.com/gambling/colorado/black-hawk/ameristar/",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "undated",
   "2026-11-24"
  ]
 },
 {
  "name": "Horseshoe Black Hawk",
  "city": "Black Hawk",
  "state": "CO",
  "zip": "80422",
  "address": "401 Main St",
  "lat": 39.79832,
  "lng": -105.48429,
  "website": "https://www.caesars.com/horseshoe-black-hawk",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-11-01)",
    "max_bet": "$10,000 (2025-11-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-11-01; 2-deck games also recorded."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/horseshoe-black-hawk-black-hawk-61",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Sandia Resort & Casino",
  "city": "Albuquerque",
  "state": "NM",
  "zip": "87113",
  "address": "30 Rainbow Rd NE",
  "lat": 35.20708,
  "lng": -106.56697,
  "website": "https://www.sandiacasino.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-09-01)",
    "max_bet": "$1,000 (2025-09-01)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-09-01; high-limit double deck also exists (rules not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/sandia-albuquerque-312",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-09-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Isleta Resort & Casino",
  "city": "Albuquerque",
  "state": "NM",
  "zip": "87105",
  "address": "11000 Broadway Blvd SE",
  "lat": 34.93621,
  "lng": -106.66164,
  "website": "unverified",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "Double deck",
    "decks": 2,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": false,
    "surrender": false,
    "rsa": false,
    "min_bet": "$25 (2025-07-22)",
    "max_bet": "$500 (2025-07-22)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-07-22; 6-deck games also recorded."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/isleta-resort-casino-albuquerque-433",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-22",
   "2026-11-24"
  ]
 },
 {
  "name": "Muckleshoot Casino Resort",
  "city": "Auburn",
  "state": "WA",
  "zip": "98002",
  "address": "2402 Auburn Way S",
  "lat": 47.29033,
  "lng": -122.19559,
  "website": "https://www.muckleshootcasino.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "unverified",
    "double": "any two cards",
    "das": false,
    "surrender": "unverified",
    "rsa": false,
    "min_bet": "$10 (2025-11-01)",
    "max_bet": "$500 (2025-11-01)",
    "csm": "unverified",
    "notes": "Recorded 2025-11-01; soft-17 not in row (summary lists H17). High-limit double deck requires players card."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/muckleshoot-auburn-379",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-11-01",
   "2026-11-24"
  ]
 },
 {
  "name": "Tulalip Resort Casino",
  "city": "Tulalip",
  "state": "WA",
  "zip": "98271",
  "address": "10200 Quil Ceda Blvd",
  "lat": 48.08805,
  "lng": -122.18925,
  "website": "https://www.tulalipresortcasino.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "6-deck shoe",
    "decks": 6,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$25 (2025-07-24)",
    "max_bet": "$500 (2025-07-24)",
    "csm": "no (hand shuffle)",
    "notes": "Recorded 2025-07-24; most games are 8-deck (rules not itemized)."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/tulalip-tulalip-393",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-24",
   "2026-11-24"
  ]
 },
 {
  "name": "Snoqualmie Casino",
  "city": "Snoqualmie",
  "state": "WA",
  "zip": "98065",
  "address": "37500 SE North Bend Way",
  "lat": 47.51863,
  "lng": -121.84171,
  "website": "https://www.snocasino.com",
  "status": "open (active table-game reports in 2025; 2026 status not independently confirmed)",
  "games": [
   {
    "name": "8-deck shoe",
    "decks": 8,
    "bj_payout": "3:2",
    "soft17": "H17",
    "double": "any two cards",
    "das": true,
    "surrender": false,
    "rsa": true,
    "min_bet": "$10 (2025-07-08)",
    "max_bet": "$500 (2025-07-08)",
    "csm": "no (automatic shuffler recorded; batch vs continuous not specified)",
    "notes": "Recorded 2025-07-08."
   }
  ],
  "source_urls": [
   "https://blackjack.tools/casino/snoqualmie-snoqualmie-388",
   "https://nominatim.openstreetmap.org (geocoded 2026-11-24)"
  ],
  "source_dates": [
   "2025-07-08",
   "2026-11-24"
  ]
 }
]
```

#### Notable per-casino findings (with sources)
- **Hard Rock Biloxi:** the main floor is "mostly 6:5." The only reliable 3:2 game is double deck (25-1,000, H17, DAS, no RSA, hand-shuffled; recorded 2025-01-21). — [blackjack.tools](https://blackjack.tools/casino/hard-rock-biloxi-biloxi-167)
- **Treasure Bay:** its 6-deck S17 game is the only six-deck S17 listing in Mississippi. Pearl River (out of scope) is the only Mississippi double-deck S17 listing. — [blackjack.tools MS index](https://blackjack.tools/casinos/locations/usa/ms/)
- **Gold Strike (Tunica):** lists a novelty single-deck game where blackjack pays 1:1 (suited blackjack pays 3:2), surrender is allowed anytime, a tied blackjack wins, and a 6-card hand wins. — [Easy Money Tunica chart](https://easymoneyblackjack.com/tunica-ms-blackjack-rules-conditions/) (undated)
- **MGM Grand Detroit:**
  - $15/$25 tables can switch to 6:5 or a $35 minimum around 7:30-9pm (recorded 2025-11-01). — [blackjack.tools](https://blackjack.tools/casino/mgm-grand-detroit-detroit-138)
  - It also lists a Spanish 21 game (late surrender, redoubling), an 8-deck 6:5 H17 game and an 8-deck Free Bet game. — [Easy Money MI chart](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/)
- **Detroit (all three):** MotorCity and Greektown each list a 5-deck continuous-shuffle H17 game. No Detroit game in either source offers surrender or is a double-deck game. — [Easy Money MI chart](https://easymoneyblackjack.com/michigan-blackjack-rules-conditions/)
- **Horseshoe St. Louis:** the double deck has restrictive rules: double on 9-11 only, no DAS, no RSA, H17 (2024-12-05). — [blackjack.tools](https://blackjack.tools/casino/horseshoe-st-louis-st-louis-195)
- **Bally's KC (Missouri, not in table):** "surrender was recently removed" (2025-11-01). — [blackjack.tools MO index](https://blackjack.tools/casinos/locations/usa/mo/)
- **Seminole Hard Rock Hollywood:**
  - Many floor games have moved to 6:5.
  - Unrated players are limited to one spot and a maximum bet of 10x the table minimum.
  - The 3:2 8-deck game is H17, DAS, no RSA, 15-2,500 (2025-11-01). — [blackjack.tools](https://blackjack.tools/casino/seminole-hard-rock-hollywood-hollywood-73)
- **Seminole Coconut Creek (FL, not in table):** the main floor is mostly 6:5. 3:2 games appear in the non-smoking and high-limit areas at $25-$50+ minimums. — [blackjack.tools FL index](https://blackjack.tools/casinos/locations/usa/fl/)
- **Thunder Valley:** the official site lists Blackjack, Blackjack Switch, Double Up, Free Bet, Double Down Madness, Spanish 21 and Zappit, but shows no rules. — [Thunder Valley](https://www.thundervalleyresort.com/casino/table-games)
- **Thunder Valley's recorded game:** 6-deck, double on 9-11 only, DAS, RSA, 15-500 (2025-11-01). — [blackjack.tools](https://blackjack.tools/casino/thunder-valley-lincoln-37)
- **Graton (CA, not in table):** "Main floor 6:5." — [blackjack.tools CA index](https://blackjack.tools/casinos/locations/usa/ca/)
- **Ameristar Black Hawk:** a third-party guide reports 3:2 double deck on weekdays before 5pm. The same guide text gives the dealer rule both ways (it says S17 in one place and hits soft 17 in another). — [uscasinoadvantage](https://uscasinoadvantage.com/gambling/colorado/black-hawk/ameristar/)
- **Fire Rock Navajo (NM, not in table):** table games closed on 2025-05-01. — [blackjack.tools NM index](https://blackjack.tools/casinos/locations/usa/nm/)
- **Casino Arizona (not in table):** reportedly removed its double deck, and its high-limit room switched to slots. — [blackjack.tools AZ index](https://blackjack.tools/casinos/locations/usa/az/)

#### Conflicts noted between sources
- **Golden Nugget Biloxi double deck:** blackjack.tools (2025-03-17) records H17 with no RSA. The older free-bet-advice survey says S17 with RSA. The dataset uses the 2025 record.
- **Hollywood Greektown 6-deck:** blackjack.tools (2025-11-01) records H17. The Easy Money chart (undated) says S17. The dataset uses the dated record and notes the conflict.
- **WinStar DAS:** blackjack.tools (2025-10-01) records DAS as yes. [goodgamblingsites](https://www.goodgamblingsites.com/articles/table-game-antes-and-the-house-edge-at-the-winstar-casino/) (updated 2026-09-27) says no doubling after split. The dataset marks this as conflicting.
- **Rivers Des Plaines:** the profile header says S17, but the notes on the Illinois index mention H17 play. — [blackjack.tools IL index](https://blackjack.tools/casinos/locations/usa/il/)
- **Harrah's Gulf Coast street number:** blackjack.tools gives 265 Beach Blvd. The free-bet-advice survey and the geocode use 280 Beach Blvd.
- **Caesars New Orleans address:** blackjack.tools gives "Canal at the River." The dataset uses 8 Canal St, which geocodes to that site in OSM.

### Inferences
- In Mississippi, Louisiana and Missouri, the itemized double-deck games are H17 with no surrender, and most do not allow resplitting aces. That makes "3:2 DD H17 DAS" the typical better game in these markets, while some main floors (Hard Rock Biloxi, Seminole Hollywood, Graton) push 6:5.
- The many $100-minimum S17 records (Golden Nugget Lake Charles, Horseshoe Lake Charles, Coushatta, Choctaw Durant, Pechanga) are probably high-limit tables. The app should not show them as typical floor minimums.
- Surrender is close to non-existent across these regions. Only Beau Rivage (in the older survey), MGM's Spanish 21, Gold Strike's novelty game, and a few properties outside the table (Kiowa OK, Soboba CA, Pala CA, Macau Lakewood WA) were reported with surrender.

### Gaps
- Each blackjack.tools profile itemizes one game only, so casinos certainly run other variants that this dataset does not capture.
- No official rule cards were found online for any property.
- Talking Stick: no dated rules found. Its website was not confirmed on an official domain; the search result was an azurewebsites mirror.
- Websites for Ameristar St. Charles, Ameristar Black Hawk and Isleta were not listed in the sources and are marked unverified.
- Not covered: Island View Gulfport (only the older survey), Choctaw ball-draw games, and other Illinois and Indiana properties.
- 2026 open/closed status could not be confirmed for any property.

## Q2. Non-standard variants: Oklahoma player-pooled/ante games and California rules

### Takeaway
Oklahoma tribal blackjack is non-house-banked and charges a per-hand ante, which changes the economics compared with standard blackjack. California tribal casinos deal house-banked blackjack. The player-dealer and "no-bust" rules are a fight over commercial cardrooms, not tribal casinos, and their 2026 legal status is contested.

### Cited Findings
- **Why Oklahoma charges an ante:** Oklahoma's criminal code prohibits banking card games, so blackjack runs as a player-pooled game. The casino earns money from a per-hand fee paid whether the hand wins, loses or pushes. Reader surveys put the fee at 25-50 cents a hand. — [goodgamblingsites](https://www.goodgamblingsites.com/articles/table-game-antes-and-the-house-edge-at-the-winstar-casino/) (updated 2026-09-27)
- **Disputed legal basis:** forum posts say the ante is tied to Oklahoma regulation, but a Tripadvisor thread argues it is not required by law. — [Las Vegas Advisor](https://www.lasvegasadvisor.com/question/winstar-table-game-rake/), [Tripadvisor](https://www.tripadvisor.com/FAQ_Answers-g51690-d940161-t721423-When_are_you_going_to_quit_charging_to_play_table.html)
- **Ante amounts recorded in 2025 (from the Oklahoma index):**
  - WinStar: about $0.50, or $1 at $100+, unless waived.
  - Choctaw Durant: about $0.50 below $50.
  - Apache Casino: a players card waives the ante.
  - Apache Lonestar: antes waived Monday-Thursday.
  - Grand Casino Shawnee: "now ante-free."
  - Golden Mesa: a mandatory $50 ante (as written) plus compulsory side bets.
  - Cherokee West Siloam Springs: a Free Bet variant that pushes some 22s.
  — [blackjack.tools OK index](https://blackjack.tools/casinos/locations/usa/ok/)
- **WinStar mix of tables:** WinStar has only one or two 6-deck hand-dealt shoe tables, and "most other tables use continuous shufflers." — [blackjack.tools WinStar](https://blackjack.tools/casino/winstar-casino-thackerville-487)
- **California tribal exclusivity:** California tribal casinos hold a constitutional exclusive on banked card games under Proposition 1A. — [Wikipedia: Gambling in California](https://en.wikipedia.org/wiki/Gambling_in_California) (via search summary)
- **Proposed California DOJ cardroom rules:** they would bar cardrooms from offering modified blackjack using third-party player-dealers (TPPPS). The DOJ says these games differ from house-banked games "only in name." — [Yogonet, 2025-10-24](https://www.yogonet.com/international/news/2025/10/24/115994-california-pushes-new-regulations-on-card-rooms-playing-blackjackstyle-games)
- **What the rules would require:** the player-dealer position must rotate every 40 minutes. The bust feature would be removed, so hands are decided by which is closer to a target count, and that target cannot be 21. — search summary of [ABC10](https://www.abc10.com/article/news/local/california/new-california-regulations-ban-blackjack-at-cardrooms/103-68e1a389-cdc8-48d0-a9c3-7536f585cdd3) and [NatLawReview](https://natlawreview.com/article/california-cardrooms-face-major-operational-shift-following-doj-rule-approval)
- **Conflict on status:** one source says continuous third-party banking was no longer permitted as of 2026-04-01. Another reports a San Francisco Superior Court preliminary injunction blocking enforcement. — [NatLawReview](https://natlawreview.com/article/california-cardrooms-face-major-operational-shift-following-doj-rule-approval); [Courthouse News](https://courthousenews.com/judge-lets-california-cardrooms-keep-dealing-blackjack/)
- **Cardroom practice in 2025:** Stones Gambling Hall (Citrus Heights) reports payout caps of $100-$500 set by third-party bankers. Artichoke Joe's reports a per-hand buy-in fee starting at $1. — [blackjack.tools CA index p2](https://blackjack.tools/casinos/locations/usa/ca/?page=2), [p1](https://blackjack.tools/casinos/locations/usa/ca/)

### Inferences
- In the app, tag Oklahoma games "player-pooled + per-hand ante." On a $10 bet, a $0.50 ante is a 5% charge per hand, far more than the rules-based house edge. This is my own calculation, not a sourced figure.
- The California tribal properties in this dataset (Pechanga, Morongo, Yaamava', Thunder Valley) should be shown as standard house-banked blackjack. Cardroom "California blackjack" belongs in a separate category.

### Gaps
- I found no current source documenting Oklahoma card-and-ball-draw blackjack, or any ball-draw game still in use at WinStar or Choctaw. None of the 28 Oklahoma profiles mention ball-draw.
- I did not read the injunction and appeal status of the California cardroom rules from a primary source. The two reports conflict.
- I found no official ante schedule published by any Oklahoma casino.

## Q3. Source quality and method

### Takeaway
I found no authoritative, current, per-casino rules survey for these regions comparable to the Wizard of Odds Las Vegas survey. The best available data is dated player reports, which suit a directory but should be shown to users with their dates and a "verify at the table" note.

### Cited Findings
- The Wizard of Vegas blackjack survey covers Las Vegas only. — [Wizard of Vegas survey](https://wizardofvegas.com/guides/blackjack-survey/)
- The blackjackreview.com state pages for Mississippi and Louisiana are about 1,669 days old (roughly 2022), and they list properties that no longer exist. — [Blackjack Review MS](https://www.blackjackreview.com/wp/blackjack-rules-mississippi-usa/), [LA](https://www.blackjackreview.com/wp/blackjack-rules-louisiana-usa/)
- blackjack.tools says its database has 841 casinos. Searching by name (needed for Talking Stick) requires signing in. — [blackjack.tools search](https://blackjack.tools/casinos/?search=talking+stick)

### Inferences
- For the app, store `source_dates` for each game and show a "last reported" date. Re-check records older than 12 months: IP, Gold Strike, Treasure Bay and Horseshoe St. Louis are from 2024.

### Gaps
- Reddit r/blackjack and bj21 trip reports were not found by search. Searches returned general strategy pages instead.
