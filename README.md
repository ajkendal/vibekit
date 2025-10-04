# VibeKit – Cloudflare Monorepo (Pages + Worker)

## About VibeKit

VibeKit is a theme-design toolkit that lets you craft and share UI tokens — **colors**, **typography**, and **spacing** — with a live preview and a shareable CSS endpoint you can drop into any frontend. The app includes a **Google Fonts picker**, **contrast checker (WCAG)**, and a **public preview** page with **Light/Dark** mode toggling.

### Project Origins
> VibeKit began as a “vibe-coding” experiment during the **Fearless UX: Unleash Your Creative Potential** design workshop. It was built in collaboration with [**kscott2016**](https://github.com/kscott2016), who helped shape the user-empathy work, journey mapping, and prototyping.

### Highlights
- **Inline Live Preview (editor):** See changes instantly on the main page with a Light/Dark toggle driven by your neutral tokens.
- **Google Fonts:** Pick separate **Header** and **Paragraph** families and weights. Optional full catalog + search via `VITE_GF_API_KEY`.
- **Color Tokens:** Neutral (light/dark), Primary, Secondary, Tertiary, Danger, Warning, Caution, Success (+ Surface/Text). All exported as CSS variables.
- **Contrast Checker:** Quick AA/AAA checks for key pairs.
- **Palette Generator:** Get triadic/analogous/complementary suggestions from a seed color and apply with one click.
- **Logos:** Use the built-in VibeKit logo or **upload your own** (PNG/SVG/JPEG/WebP) — stored in **R2** and served via `/api/assets/*`.
- **Shareable:** `/api/themes/{id}.css` (1‑day cache) and `/api/themes/{id}/preview` (5‑min cache).
- **OG Image:** `/api/themes/{id}.og.svg` for rich link unfurls.
- **Docs/FAQ:** Available at `#/docs` inside the app.

### Future Opportunities
- Add an option to **download styles for Figma** integration
- Add the ability to **store comments** for users to see
- Add the ability to **use custom fonts** (user-provided)
- *(Shipped)* Allow users to **add their personal logo**

## Structure
```
frontend/                 # Vite SPA (Pages)
  functions/api/[[path]].ts  # Pages Function proxy to bound Worker (binding name: API)
  src/
  public/
api/                      # Worker (D1)
  src/index.ts
  migrations/0001_init.sql
  wrangler.toml
```

## Deploy

### 1) D1 database (once)
```bash
cd api
npm i
npm run d1:create
# Copy the printed database_id into `wrangler.toml` (replace <YOUR_D1_ID>)
npm run d1:migrate
```

### 2) Deploy Worker
```bash
npm run deploy
```

### 3) Deploy Pages (frontend/)
- Create a Cloudflare Pages project pointing to `frontend/`
- Build command: `vite build`
- Output: `dist`
- **Service Binding**: add a binding named `API` that points to your deployed Worker.

### Local Dev
You can run Worker and SPA separately, or use `wrangler pages dev` for the Pages+Functions experience.

## API

**Core**
- `GET /api/health`
- `GET /api/themes`
- `POST /api/themes` → `{ name, colors, typography, spacing }`
- `GET /api/themes/:id`
- `DELETE /api/themes/:id`

**Shareable**
- `GET /api/themes/:id.css` → theme CSS tokens (Cache-Control: 1 day)
- `GET /api/themes/:id/preview` → public HTML preview (Cache-Control: 5 min)
- `GET /api/themes/:id.og.svg` → Open Graph SVG (Cache-Control: 1 day)

**Assets / Uploads**
- `POST /api/uploads/logo` → accepts PNG/SVG/JPEG/WebP; stores in R2; returns `{ key, url }`
- `GET /api/assets/:key` → serves uploaded asset (immutable cache)


## Configuration

**Cloudflare Worker (`api/wrangler.toml`)**
```toml
[[d1_databases]]
binding = "DB"
database_name = "vibekit"
database_id = "<YOUR_D1_ID>"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "vibekit-uploads"
```

**Cloudflare Pages (project settings)**
- Framework preset: **Vite**
- Build: `vite build` • Output: `dist`
- **Service Binding**: add a binding named **API** pointing to your deployed Worker

**Frontend env (optional)**
```
# Use full Google Fonts catalog in the Font Picker
VITE_GF_API_KEY=YOUR_GOOGLE_FONTS_API_KEY

# Override API base (normally not required because of the service binding)
# VITE_API_BASE=https://your-worker.example.workers.dev
```
