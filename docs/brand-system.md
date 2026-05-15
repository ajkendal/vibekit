# VibeKit Brand System

A working reference for the visual identity. Treat this file as the source of truth — if a decision isn't here, it isn't yet a decision.

## The idea

VibeKit is a theme tool whose own brand is one beautiful theme. The product is named *VibeKit*. The brand should *have* a vibe — confident, expressive, alive — while staying disciplined enough that the user's own theme is always the loudest voice on screen.

## Color system

Five saturated primaries plus two neutrals. Each color has a defined job. Don't deploy them as a rainbow — every color choice is a meaning choice.

| Token | Hex | Job |
|---|---|---|
| `--vk-violet` | `#8338EC` | Primary. Brand color, primary CTAs, the Save button, hero moments. |
| `--vk-azure` | `#3A86FF` | Info. Focus rings, links, secondary action emphasis, tip callouts. |
| `--vk-flame` | `#FB5607` | Accent. Secondary CTAs, callout badges, mid-energy moments. |
| `--vk-sun` | `#FFBE0B` | Highlight. Tinted backgrounds for ratings/scores, "passes WCAG" indicators, soft emphasis. |
| `--vk-pink` | `#FF006E` | Love. Held in reserve. Used only for favorites, hearts, joyful moments — never as a default UI color. |
| `--vk-ink` | `#1A1A1A` | Type and primary surfaces (the dark code panel). True near-black, never muddy gray. |
| `--vk-canvas` | `#FAF7F2` | Background. Warm off-white that gives the app personality without competing with user themes. |

Source palette: [coolors.co/ffbe0b-fb5607-ff006e-8338ec-3a86ff](https://coolors.co/ffbe0b-fb5607-ff006e-8338ec-3a86ff).

### The discipline

> Brand colors live on chrome. The preview canvas stays neutral.

This is the single most important rule. The user is here to design *their* theme; their theme should be the loudest thing on screen.

- Chrome (logo, top bar, sidebar, primary buttons, focus rings, code panels) → freely uses brand colors.
- Preview canvas (the area where the user's theme renders) → cream and white surfaces, ink type, no brand-color leakage.

If a button on the preview canvas is filled with `--vk-violet`, the rule is broken. The canvas shows the *user's* primary, not ours.

### The green-shaped hole

The palette has no green, which means we can't use the cultural shortcut of "green = pass" for things like WCAG contrast indicators. The fix: tint the success state with `--vk-sun` at low alpha and use a checkmark glyph in `--vk-ink` to signal pass. Reads as warm approval rather than clinical correctness.

Don't add a sixth color to fill this hole. Discipline over completeness.

### Tints and shades

For tinted backgrounds (badges, alert wells, hover states), append an alpha hex pair to the brand color rather than introducing new tokens. Standard alphas:

- `1A` (10%) — subtle tinted backgrounds, hover fills
- `33` (20%) — emphasized tinted backgrounds, "selected" states
- `99` (60%) — disabled or muted versions on dark surfaces

Example: `#8338EC1A` for a violet-tinted "primary" pill background.

## Logo

The mark is five color chips arranged as a wave — the same five colors as the palette, in palette order. The mark *is* the product.

Three forms ship with the system:

- **Full lockup** (`VibeKit_Logo.svg`) — mark + Inter wordmark. Default for marketing surfaces, README, landing.
- **Mark only** (`VibeKit_Mark.svg`) — wave on its own. For app icons, social avatars, favicon, in-app sidebar where space is tight.
- **Dark variant** (`VibeKit_Logo_Dark.svg`) — same mark (colors stay), wordmark in cream `#FAF7F2`. For dark surfaces.
- **Favicon** (`favicon.svg`) — the mark in a square frame.

### Rules

The mark must never:

- Be recolored to a single color. The five colors *are* the mark.
- Be set inside a colored shape (badge, chip). It needs cream or white space around it.
- Be stretched, rotated, or flipped. The wave reads as the wave; once it tilts it becomes confusing.
- Be reproduced below 24px tall. Below that, the chips lose definition — use a simpler glyph if you must.

### Clearspace

Maintain clearspace equal to the height of one chip on all sides of the lockup. No other element may sit inside that perimeter.

## Typography

| Use | Font | Notes |
|---|---|---|
| All UI | Inter | Weights 400 and 500 only. Letter-spacing -0.02em on display text, -0.03em on the wordmark. |
| Code, tokens, monospace | JetBrains Mono | The CSS Vars panel and any token-style display. |

The previous brand wordmark used "Konkhmer Sleokchher" — that's deprecated. The new wordmark is Inter at weight 500, letter-spacing -0.03em. Same font as the rest of the UI; the mark carries the personality.

No display serif anywhere in the brand. The brand's expressiveness lives in color and shape, not in letterforms.

## Layout & shape

- **Default radius:** 12px (`--vk-radius`). 8px for compact controls, 16px for hero cards.
- **Spacing rhythm:** 8px grid. Component-internal gaps 8/12/16; section gaps 16/24/32.
- **Strokes:** 0.5px borders at low alpha (~0.06 on cream, ~0.10 on white) — never heavy 1px gray rules.
- **Shadows:** none, except focus rings. A 2px ring of `--vk-azure` at 40% alpha is the focus signature.
- **Density:** roomy. If a panel feels cramped, the answer is more padding before it's smaller type.

## Voice

Confident, plain, friendly. Short sentences. Sentence case everywhere — never Title Case in UI. The product talks like a designer who knows their craft and doesn't need to prove it.

- "Save theme" — not "Save Theme"
- "Untitled theme · live" — not "Untitled Theme — Currently Editing"
- "Passes AA at large size" — not "✓ Contrast Validated Successfully"

## Files

| File | Purpose |
|---|---|
| `frontend/public/brand/VibeKit_Logo.svg` | Full lockup (mark + wordmark), light surfaces |
| `frontend/public/brand/VibeKit_Mark.svg` | Mark only |
| `frontend/public/brand/VibeKit_Logo_Dark.svg` | Full lockup for dark surfaces |
| `frontend/public/brand/favicon.svg` | Favicon |
| `frontend/src/styles.scss` | CSS tokens (`--vk-*`) and chrome styling |

## Decisions log

- **2026-05** — Replaced the original orange/teal swirl identity with the five-color wave mark. Source palette from coolors.co.
- **2026-05** — Deprecated Konkhmer Sleokchher as the brand wordmark; standardized on Inter for all UI and brand surfaces.
- **2026-05** — Established the chrome-vs-canvas discipline. No brand colors on the preview canvas.
- **2026-05** — Decided against adding a green to fill the success-state gap. Sun (`#FFBE0B`) tints + ink checkmarks handle pass states.
