# Nisarg & Devanshi · Wedding Invitation

The bilingual (English / हिंदी) wedding invitation website for **https://nisarg-weds-devanshi.site**.

- **Frontend:** Vite + TypeScript + React components (rendered with Preact for a ~60 KB gzipped bundle), Framer Motion
- **Backend:** Cloudflare Pages Functions (`/functions`) + Cloudflare D1 (SQLite) for RSVPs
- **Hosting:** Cloudflare Pages (free tier is enough). The domain is already on Cloudflare DNS.

---

## Where things live

| What | File |
| --- | --- |
| All wedding facts (dates, times, venues, map links, phone numbers) | `src/content/wedding.ts` |
| All English and Hindi text | `src/i18n/translations.ts` |
| Must-come friends (Nisarg’s note if they decline in the RSVP form) | `src/content/friends.ts` |
| Ready-made RSVP messages | `src/i18n/translations.ts` → `rsvp.quick` |
| Colours, fonts, spacing | `src/styles/global.css` (`:root` variables — maroon & gold theme) |
| Illustrations (flowers, bells, pillars, elephants, diya) and falling petals | `src/components/Scenery.tsx` |
| Page sections | `src/components/*.tsx` |
| RSVP API | `functions/api/rsvp.ts` |
| Admin API (list + CSV) | `functions/api/admin/rsvps.ts` |
| Admin page | `admin.html`, `src/admin/` → served at `/admin` |
| Database schema | `migrations/0001_create_rsvps.sql` (+ `needs_stay`, added automatically on first use by `functions/_lib.ts`) |
| www → apex redirect | `functions/_middleware.ts` |
| Security headers, caching | `public/_headers` |
| Social preview image / icons | `public/og-image.jpg`, `public/*.png`, `public/favicon.svg` |

---

## Run it locally

On a Mac you can simply double-click **`Start Wedding Website.command`** (needs Node.js 20+). Or:

```bash
npm install
cp .dev.vars.example .dev.vars        # then put any long string in ADMIN_TOKEN
npm run db:migrate:local              # creates the local SQLite RSVP table
npm run dev:api                       # builds and serves site + API at http://127.0.0.1:8788
```

For fast UI work with hot reload, run `npm run dev:api` in one terminal and `npm run dev` in another (the Vite dev server proxies `/api` to port 8788).

---

## Deploy to Cloudflare Pages from GitHub (one-time setup, ~20 minutes)

Everything below is done in the Cloudflare dashboard (dash.cloudflare.com) — no command line needed.
After this, every `git push` to `main` redeploys the site automatically.

### 1. Create the RSVP database (D1)
1. **Storage & Databases → D1 SQL Database → Create database** → name it `nwd-rsvp` → Create.
2. Copy the **Database ID** shown on the database page.
3. In this repo, open `wrangler.toml` and replace the `00000000-0000-0000-0000-000000000000` placeholder with that ID. Commit and push.
4. On the database page open the **Console** tab, paste the whole contents of `migrations/0001_create_rsvps.sql`, and run it. (This creates the `rsvps` table.)

### 2. Create the Pages project from GitHub
1. **Workers & Pages → Create → Pages → Connect to Git** → authorise GitHub → choose `PatelNisarg28/wedding_invitation`.
2. Build settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
3. **Save and Deploy.** When it finishes you get `https://<project-name>.pages.dev` — open it and check the site.

`wrangler.toml` tells Pages to attach the D1 database as `DB`. You can confirm under the project's **Settings → Bindings** (it should list D1 database `DB` → `nwd-rsvp`; add it there if it doesn't).

### 3. Add the secrets (never commit these)
Project → **Settings → Variables and Secrets → Add** (Production), type **Secret**:

| Name | Value |
| --- | --- |
| `ADMIN_TOKEN` | a long random password for the admin page (e.g. from a password manager, 24+ characters) |
| `IP_SALT` | any other random string |

Then **Deployments → latest → ⋯ → Retry deployment** so the secrets take effect.

### 4. Connect the domain — ⚠️ changes DNS, needs your approval
Project → **Custom domains → Set up a custom domain**:
1. `nisarg-weds-devanshi.site`
2. `www.nisarg-weds-devanshi.site`

Because the domain is already on Cloudflare, Cloudflare creates these records automatically:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `@` (nisarg-weds-devanshi.site) | `<project-name>.pages.dev` | Proxied |
| CNAME | `www` | `<project-name>.pages.dev` | Proxied |

If an `A`/`AAAA`/`CNAME` record already exists for `@` or `www` (e.g. a parking page), Cloudflare asks to replace it. Email (MX) records are not touched.
HTTPS certificates are issued automatically (usually within minutes). `www` redirects to the apex domain via `functions/_middleware.ts`.
Recommended: **SSL/TLS → Overview → Full**, and **SSL/TLS → Edge Certificates → Always Use HTTPS: On**.

### 5. Verify
- `https://nisarg-weds-devanshi.site` loads with a padlock; `https://www.nisarg-weds-devanshi.site` redirects to it.
- Submit a test RSVP, then open `https://nisarg-weds-devanshi.site/admin`, enter your `ADMIN_TOKEN`, and confirm it appears.
- Remove test rows in **D1 → nwd-rsvp → Console**: `DELETE FROM rsvps WHERE name LIKE 'Test%';`
- Paste the link in WhatsApp to check the preview card (WhatsApp caches previews; add `?v=2` after changing `og-image.jpg`).

### Alternative: deploy from the command line
```bash
npx wrangler login
npx wrangler d1 create nwd-rsvp            # put the id in wrangler.toml
npm run db:migrate:remote
npx wrangler pages project create nisarg-weds-devanshi --production-branch main
npx wrangler pages secret put ADMIN_TOKEN --project-name nisarg-weds-devanshi
npm run deploy
```

## Viewing RSVPs
- **Admin page:** `https://nisarg-weds-devanshi.site/admin` → enter the `ADMIN_TOKEN` → see totals, search, filter, **Export CSV** (opens in Excel/Sheets with Hindi intact).
- The admin page and API are `noindex`, need the secret on every request, and the token is kept only for the current browser tab.
- For extra protection you can also put `/admin*` behind **Cloudflare Zero Trust → Access** (free for up to 50 users) with a one-time PIN to your email.

## How the RSVP works
- No login. Each browser gets a random device id; resubmitting from the same phone **updates** the same response instead of creating duplicates ("Change my response").
- Double taps are ignored while a request is in flight; the server validates every field again.
- A hidden honeypot field filters simple bots; a light per-IP limit (40 responses / 10 min, office-Wi-Fi friendly) stops floods. IPs are stored only as salted hashes.
- Data lives in your Cloudflare D1 database; nothing is sent to third parties.

## Content notes
All dates, times, venues, parents' names and phone numbers come from the printed Gujarati card. The Sangeet Sandhya / Dinner / Haldi venue (Kadva Patidar Community Ground) and the wedding venue use the exact Google Maps pins from the card's QR codes; the residence link is a Google Maps search for the printed address.
