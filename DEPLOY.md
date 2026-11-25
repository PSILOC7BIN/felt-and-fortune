# Putting Felt & Fortune online

The app stores everything in one SQLite file, so a host must keep that file between restarts. Hosts with a wiped filesystem (most free web tiers) would erase accounts and test feedback whenever the app sleeps. Two options that keep the data:

## A. Share it from your laptop for testing sessions (no account, free)

Best for the user-testing sessions this week. The data stays in `data/ap-toolbox.sqlite3` on your computer, so `scripts/study_report.py` works directly. The link only works while your laptop is on and both commands are running.

1. Install Cloudflare’s tunnel tool (one time):
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```
2. Start the site (or use the running `felt-and-fortune` preview on port 8000):
   ```powershell
   python server.py
   ```
3. In a second terminal, open a temporary public link:
   ```powershell
   cloudflared tunnel --url http://localhost:8000
   ```
   It prints an `https://…trycloudflare.com` address. Share that with testers. A new address is generated each time you run it.

Stop the tunnel (Ctrl+C) when testing is done. Anyone with the link can reach the site while it runs, so share it only with your testers.

## B. A lasting link on Fly.io (account required)

Good for giving your instructor a link that stays up. Fly.io keeps the database on a persistent volume. It asks for a payment card when you sign up; check their current pricing for a small machine and a 1 GB volume.

1. Install the Fly CLI and sign in (the sign-in happens in your browser):
   ```powershell
   winget install --id Fly-io.flyctl
   fly auth login
   ```
2. From the project folder, create the app without deploying (pick a unique name when asked, and say no to databases):
   ```powershell
   fly launch --copy-config --no-deploy
   ```
3. Create the volume for the database in the same region as the app:
   ```powershell
   fly volumes create ff_data --size 1 --region iad
   ```
4. Deploy:
   ```powershell
   fly deploy
   ```
   Your site is at `https://<app-name>.fly.dev`.
5. To get the study numbers from the hosted copy:
   ```powershell
   fly ssh console -C "python -c \"import shutil; shutil.copy('/data/felt-and-fortune.sqlite3', '/tmp/s.sqlite3')\""
   fly ssh sftp get /tmp/s.sqlite3 data/hosted.sqlite3
   python scripts/study_report.py --db data/hosted.sqlite3 --since 2026-11-25
   ```

The container (see `Dockerfile`) sets `COOKIE_SECURE=1`, listens on port 8080, and stores the database at `/data`. Keep the app to one machine: SQLite on a volume can’t be shared between machines.

## Notes
- Email password reset stays off unless you set the `SMTP_*` variables (see `.env.example`).
- The server accepts form submissions only from its own address (http or https), so links work through the tunnel and on Fly.io without extra settings.

## iOS and Android apps (Capacitor, `app-v2` branch)

The apps wrap the same interface (`public/`) and call the hosted server's API with a bearer token.

1. Deploy the server first (above) so it has an `https://` address.
2. Build the app bundle and copy it into the native projects:
   ```
   FF_API_BASE=https://your-app.fly.dev npm run native:sync
   ```
3. **Android:** install Android Studio, then `npm run native:android` and press Run. A Google Play developer account ($25 once) is needed to publish.
4. **iOS:** needs a Mac with Xcode (or a cloud Mac build service such as Codemagic or a GitHub Actions macOS runner). Run `npm run native:ios`, set your team, and build. Publishing needs the Apple Developer Program ($99/year).

**Before submitting**
- Payments run in test mode (`BILLING_MODE=test`): the Store simulates purchases. For release, connect StoreKit and Google Play Billing (for example through RevenueCat) and a Stripe checkout for the web, then set `BILLING_MODE=live`, which turns the test endpoint off.
- Rate the app 18+ (frequent simulated gambling). Describe it as training only, with play chips that have no cash value. Apple guideline 5.3.4 bars "card counters" used at real tables, so don't add live-table, camera, or discreet-mode features.
- The casino map hides casino website links inside the native apps (Google Play bars links to real-money gambling).
- Guideline 4.2 (minimum functionality): the bundle works offline for the interface and uses native haptics, status bar, splash screen, and back button. Give reviewers a demo account.
- See `reports/Gamified app monetization and retention.md` for the full compliance checklist.

## Casino map data

`public/casinos.json` is built from the researched notes in `research_notes/US casino blackjack rules/`:
```
python scripts/build_casinos.py      # geocodes new casinos with OpenStreetMap (cached)
node scripts/build_us_map.mjs        # US state outlines (US Census, via us-atlas) and pin positions
```
Every casino shows the date of its newest source and a warning when sources disagree. Re-check rules regularly; they change often.

## Testing on your iPhone

**Option A: home-screen app (works today, from Windows).** Start the server for your network (the `felt-and-fortune-phone` launch config, or `$env:HOST='0.0.0.0'; python server.py`), open `http://<your-computer-ip>:8000` in Safari on the iPhone (same Wi-Fi), tap Share → **Add to Home Screen**. It opens full screen from its own icon, with no browser bar. It still needs the server running.

**Option B: the real native app (needs a Mac).** Apple only builds iPhone apps with Xcode, which runs on macOS.
1. On a Mac, install Xcode (free, Mac App Store) and Node.js, clone the repo, `git checkout app-v2`, `npm install`.
2. Point the app at a server:
   - Testing against your PC on the same Wi-Fi: `FF_API_BASE=http://<pc-ip>:8000 python3 scripts/build_native.py --dev && npx cap sync ios`
   - Or a hosted server: `FF_API_BASE=https://your-app.fly.dev python3 scripts/build_native.py && npx cap sync ios`
3. `npx cap open ios`. In Xcode, select the **App** target → Signing & Capabilities → Team: add your Apple ID (a free account works for your own phone).
4. Plug in the iPhone, trust the computer, turn on **Settings → Privacy & Security → Developer Mode**, pick the phone as the run destination, and press Run.
5. First launch: **Settings → General → VPN & Device Management** → trust your developer certificate. Allow the "local network" prompt.

With a free Apple ID the install expires after 7 days (just press Run again). For longer-lived installs and sharing with testers, join the Apple Developer Program ($99/year) and use **TestFlight**; a cloud Mac service (Codemagic, GitHub Actions macOS runners) can then build and upload without owning a Mac.

Regenerate icons after changing the logo: `node scripts/build_icons.mjs`.

## Email, reminders, and analytics

- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `PUBLIC_ORIGIN` to send real email. Without them, every message (receipts, cancellations, trial-ending and renewal reminders) is still written to the `outbox` table so you can check it.
- The server checks for trial-ending (3 days before) and yearly renewal (21 days before) reminders every hour.
- `python scripts/funnel_report.py` prints the landing → survey → signup → first lesson → trial → paid funnel from first-party events. No third-party trackers are used.

## Production bundle

`node scripts/bundle.mjs` builds one minified JS and one CSS file into `public/dist/`. The server uses it when `FF_BUNDLE=1` (the Dockerfile builds and enables it automatically).
