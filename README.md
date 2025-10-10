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

### Features & Components

**🎨 Color System**

- **HEX-only format** for consistency and performance across all color tokens
- **8 semantic colors:** Neutral (Light/Dark), Primary, Secondary, Tertiary, Danger, Warning, Caution, Success
- **Palette Generator:** Triadic/analogous/complementary suggestions from seed colors with one-click application
- **Contrast Checker:** WCAG AA/AAA compliance validation with real-time accessibility scoring

**🔄 Border Radius Control**

- **Interactive slider (0-25px)** with instant preview on chips, buttons, and containers
- **CSS variable integration** (`--border-radius`) with live theme updates
- **Logo preservation** - brand assets unaffected by border radius theming

**🔤 Typography Management**

- **Google Fonts integration** with separate Header/Paragraph font selection
- **Advanced controls:** Weight, style, line height, and letter spacing options
- **Optional full catalog** search via `VITE_GF_API_KEY` environment variable

**🖼️ Brand Assets**

- **Multi-format support:** PNG, SVG, JPEG, WebP uploads stored in Cloudflare R2
- **Reliable hosting** with automatic fallback placeholders and error handling

**💾 Theme Management**

- **Full CRUD operations** with D1 database persistence and theme duplication
- **Shareable exports:** `/themes/{id}.css` (cached) and `/themes/{id}/preview` demo pages
- **Development-friendly:** Dynamic API detection for local vs production environments

**⚡ Live Preview System**

- **Real-time updates** using direct theme values without CSS injection dependencies
- **CSS Variables Panel** with organized grouping and copy-to-clipboard functionality
- **Instant feedback** across all UI components and preview elements

### Tools & Technologies

**Frontend**

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework with TypeScript
- **Ant Design** - UI component library with React 18 compatibility
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

- **Sketched Wireframes** - Initial concept sketches and user flow mapping
- **Canva** - User journey mapping and empathy mapping exercises
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
  subgraph Frontend["Frontend (Vite + React + TS + Ant Design)"]
    A1[Font Picker]
    A2[Color Controls - HEX Only]
    A3[Border Radius Control]
    A4[Contrast Checker]
    A5[Brand Logo Upload]
    A6[Saved Themes]
    A7[Live Preview]
    A8[CSS Variables Panel]
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
