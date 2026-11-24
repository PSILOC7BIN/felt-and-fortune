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
