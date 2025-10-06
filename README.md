# VibeKit

## About VibeKit

VibeKit is a theme-design toolkit that lets you craft and share UI tokens — **colors**, **typography**, and **spacing** — with a live preview and a shareable CSS endpoint you can drop into any frontend. The app includes a **Google Fonts picker**, **contrast checker (WCAG)**, and a **public preview** page.

## Inspiration

Explore these helpful color design tools that complement VibeKit's functionality:

- **[Coolors Visualizer](https://coolors.co/visualizer/880d1e-dd2d4a-f26a8d-f49cbb-cbeef3)** - Visualize color palettes in real UI components
- **[Coolors Contrast Checker](https://coolors.co/contrast-checker/112a46-acc8e5)** - Test color combinations for WCAG compliance
- **[Mobile Palette Generator](https://mobilepalette.colorion.co/)** - Generate mobile-optimized color schemes
- **[Adobe Color Wheel](https://color.adobe.com/create/color-wheel)** - Explore color relationships and harmonies

## Project Origins

> This was a Design Project for **Girls Develop It: Fearless UX: Unleash Your Creative Potential** workshop, exploring "vibe-coding" methodology I learned from [**Piyush Acharya**](https://github.com/VerisimilitudeX) at **Git Merge 2025**. The project was built in collaboration with [**Krystina Bradley**](https://github.com/kscott2016), who helped shape the user-empathy work, journey mapping, and prototyping. This project was coded in conjunction with **ChatGPT** and **GitHub Copilot**. – Cloudflare Monorepo (Pages + Worker)

### Highlights

- **Inline Live Preview (editor):** See changes instantly on the main page driven by your neutral tokens.
- **Google Fonts:** Pick separate **Header** and **Paragraph** families and weights. Optional full catalog + search via `VITE_GF_API_KEY`.
- **Color Tokens:** Neutral, Primary, Secondary, Tertiary, Danger, Warning, Caution, Success. All exported as CSS variables.
- **Contrast Checker:** Quick AA/AAA checks for key pairs.
- **Palette Generator:** Get triadic/analogous/complementary suggestions from a seed color and apply with one click.
- **Logos:** **upload your own** (PNG/SVG/JPEG/WebP) — stored in **R2** and served via `/api/assets/*`.
- **Shareable:** `/api/themes/{id}.css` (1‑day cache) and `/api/themes/{id}/preview` (5‑min cache).
- **Docs/FAQ:** Available at `#/docs` inside the app.

### Tools & Technologies

**Frontend**

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework with TypeScript
- **CSS Variables** - Dynamic theming system

**Backend**

- **Cloudflare Workers** - Edge compute platform
- **D1 Database** - Serverless SQLite database
- **R2 Storage** - Object storage for uploaded assets

**Development**

- **TypeScript** - Type-safe development
- **ESLint** - Code linting and formatting
- **Wrangler** - Cloudflare development CLI

**Design**

- **Figma** - UI/UX design and prototyping

**AI Tools**

- **ChatGPT** - Code generation and problem solving
- **GitHub Copilot** - AI pair programming

### Future Opportunities

- Figma integration — export downloadable styles/tokens file
- Comments — per-theme threaded notes visible to collaborators
- Custom fonts — allow user-uploaded fonts in addition to Google Fonts
- Import from CSS tokens / Design Tokens JSON

## Architecture

```mermaid
flowchart TB
  subgraph Frontend["Frontend (Vite + React + TS)"]
    A1[Font Picker]
    A2[Color Controls]
    A3[Contrast Checker]
    A4[Brand Logo Upload]
    A5[Saved Themes]
    A6[Live Preview]
    A7[CSS Variables Panel]
  end

  subgraph API["Cloudflare Worker API"]
    B1[GET /themes]
    B2[POST /themes]
    B3[GET /themes/:id]
    B4[DELETE /themes/:id]
    B5[GET /themes/:id/css]
    B6[GET /themes/:id/preview]
    B7[POST /uploads/logo]
    B8[GET /uploads/:id]
  end

  subgraph Storage["Cloudflare Storage"]
    C1[(D1 Database<br/>themes table)]
    C2[(D1 Database<br/>uploads table)]
    C3[R2 Bucket<br/>vibekit-logos]
  end

  Frontend -.->|Fetch API| API
  B1 --> C1
  B2 --> C1
  B3 --> C1
  B4 --> C1
  B5 --> C1
  B6 --> C1
  B7 --> C2
  B7 -.->|Store files| C3
  B8 --> C2
```

## License

This project is licensed under a **View-Only License** — see the [LICENSE](./LICENSE) file for details.
