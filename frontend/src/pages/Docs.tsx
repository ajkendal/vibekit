import { Link } from 'react-router-dom'

export default function Docs() {
  return (
    <div className='vk-docs'>
      {/* Top bar — matches the editor */}
      <header className='vk-topbar'>
        <div className='vk-topbar-brand'>
          <img
            src='/brand/VibeKit_Mark.svg'
            alt='VibeKit'
            className='vk-topbar-mark'
          />
          <h1 className='vk-topbar-wordmark'>VibeKit</h1>
          <div className='vk-topbar-divider' />
          <span
            style={{
              fontFamily: 'var(--vk-font-sans)',
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(26, 26, 26, 0.7)',
              letterSpacing: '-0.01em',
            }}
          >
            Docs
          </span>
        </div>
        <div className='vk-topbar-actions'>
          <Link to='/' className='vk-btn vk-btn--outline vk-btn--sm'>
            ← Back to editor
          </Link>
        </div>
      </header>

      <main className='vk-docs-page'>
        <p className='vk-docs-eyebrow'>Getting started</p>
        <h1 className='vk-docs-h1'>Build, save, and ship design tokens.</h1>
        <p className='vk-docs-lede'>
          VibeKit is a theme-design toolkit. Craft a palette, pick fonts, set
          spacing, save it, and ship it as CSS, Tailwind, Design Tokens JSON,
          or SCSS. Every value is a live, copy-pasteable token.
        </p>

        {/* ───────── Editor overview ───────── */}
        <h2 className='vk-docs-h2'>The editor at a glance</h2>
        <p className='vk-docs-p'>
          The editor has three zones — a top bar, a category tab strip, and
          the workspace below.
        </p>
        <ul className='vk-docs-ul'>
          <li className='vk-docs-li'>
            <strong>Top bar.</strong> Your VibeKit mark, the theme name
            (editable inline), and the Save buttons.
          </li>
          <li className='vk-docs-li'>
            <strong>Tab strip.</strong> Six categories of controls —
            Templates, Colors, Typography, Spacing, Brand, Themes. Click a tab
            to swap the right panel.
          </li>
          <li className='vk-docs-li'>
            <strong>Workspace.</strong> The big left column shows your theme
            rendered in real UI contexts; the right column shows the controls
            for the active tab.
          </li>
        </ul>

        {/* ───────── Six tabs ───────── */}
        <h2 className='vk-docs-h2'>The six tabs</h2>

        <h3 className='vk-docs-h3'>Templates</h3>
        <p className='vk-docs-p'>
          A grid of six curated starter themes — Sunset Soda, Workshop,
          Editorial, Playful, Mono, Verdant — each with a complete palette,
          font pairing, type scale, and border radius. Click any card to fork
          the template into the editor as a new unsaved theme. Your first
          Save creates a fresh entry without touching the template.
        </p>

        <h3 className='vk-docs-h3'>Colors</h3>
        <p className='vk-docs-p'>
          Pick your 10 semantic colors — three neutrals (Light, Mid, Dark),
          three brand colors (Primary, Secondary, Tertiary), and four status
          colors (Success, Warning, Caution, Danger). Each gets a
          human-readable name automatically via{' '}
          <a
            href='https://www.thecolorapi.com/'
            target='_blank'
            rel='noreferrer'
          >
            The Color API
          </a>
          . The <strong>Palette generator</strong> below derives a palette
          from a base color using monochromatic, analogous, complementary, or
          triadic schemes — and can auto-derive neutrals that pull toward
          white and near-black with a subtle brand tint, plus status colors,
          so the defaults are immediately usable.
        </p>

        <h3 className='vk-docs-h3'>Typography</h3>
        <p className='vk-docs-p'>
          Three cards stacked together:
        </p>
        <ul className='vk-docs-ul'>
          <li className='vk-docs-li'>
            <strong>Pairings</strong> — six curated header+body combos (Linear,
            Vibekit, Editorial, Magazine, Modern tech, Italic flair). Click a
            card to apply both fonts at once; weight, italic, line-height,
            and letter-spacing are left alone.
          </li>
          <li className='vk-docs-li'>
            <strong>Header font</strong> + <strong>Paragraph font</strong> — pick
            independently from Google Fonts (curated list, or the full
            catalog if <code>VITE_GF_API_KEY</code> is set). Each font has its
            own weight, italic, line-height, and letter-spacing controls.
          </li>
          <li className='vk-docs-li'>
            <strong>Type scale</strong> — set a base size (12-18px) and a
            modular ratio (Minor 2nd through Perfect 5th). h1 through h6 are
            derived as <code>base × ratio^n</code>.
          </li>
        </ul>

        <h3 className='vk-docs-h3'>Spacing</h3>
        <p className='vk-docs-p'>
          One slider: <strong>border radius</strong> (0-25px). Affects every
          rounded element across your theme — buttons, cards, badges, inputs,
          and the mockups in the Live Preview update instantly.
        </p>

        <h3 className='vk-docs-h3'>Brand</h3>
        <p className='vk-docs-p'>
          Upload your logo (PNG, SVG, JPG, WebP — stored on Cloudflare R2)
          and write a short description of the theme. Both surface on the
          public preview page hero, and the description shows up under each
          card in the Themes tab.
        </p>

        <h3 className='vk-docs-h3'>Themes</h3>
        <p className='vk-docs-p'>
          Browse everything you've saved — load, duplicate, copy CSS URL,
          open preview, or delete. Each card shows the theme name, a relative
          timestamp ("2 days ago"), the description, and an action row.
          Delete uses a <strong>type-to-confirm</strong> pattern (GitHub-style)
          where you type the theme name to enable the destructive button —
          no passwords, no secrets, very hard to misclick.
        </p>

        {/* ───────── Canvas ───────── */}
        <h2 className='vk-docs-h2'>The canvas</h2>
        <p className='vk-docs-p'>
          Three panels stacked on the left, always visible regardless of
          which tab is active.
        </p>

        <h3 className='vk-docs-h3'>Live Preview</h3>
        <p className='vk-docs-p'>
          A polished web dashboard mockup and a phone mockup, both rendered
          with your tokens — primary color on the CTAs, secondary and
          tertiary on stat tiles, status colors on badges, your fonts on the
          headlines and body. Toggle between Web · Mobile · Both with the
          pill switcher at top right. Edit any value and watch both surfaces
          update instantly. Below the mockups is an{' '}
          <strong>Icons showcase</strong> — 24 common UI icons rendered in
          your theme's ink-on-canvas color so you can see how line geometry
          reads against your brand.
        </p>

        <h3 className='vk-docs-h3'>Contrast Checker</h3>
        <p className='vk-docs-p'>
          WCAG validation for 18 meaningful pairs of your colors. The full
          matrix runs Primary, Secondary, and Tertiary as text on each
          neutral (Light, Mid, Dark), plus Light/Dark as text on each brand
          color — covering every "can I use this color here?" question that
          actually comes up. Each pair shows the live type sample on the
          actual color combo, an AAA / AA / Large only / Fail badge, and the
          precise contrast ratio in monospace.
        </p>

        <h3 className='vk-docs-h3'>Export</h3>
        <p className='vk-docs-p'>
          Four format tabs: <strong>CSS variables</strong>,{' '}
          <strong>Tailwind</strong>, <strong>Tokens JSON</strong>,{' '}
          <strong>SCSS</strong>. Each tab swaps the dark code block to the
          selected format; the Copy button sends the current format to your
          clipboard. The same four formats are available on every saved
          theme's public preview page.
        </p>

        {/* ───────── Saving ───────── */}
        <h2 className='vk-docs-h2'>Saving themes</h2>
        <p className='vk-docs-p'>
          Type a name in the topbar, then hit a save button.
        </p>
        <ul className='vk-docs-ul'>
          <li className='vk-docs-li'>
            <strong>Save</strong> updates the current theme if it's been
            saved before. Otherwise, it creates a new one.
          </li>
          <li className='vk-docs-li'>
            <strong>Save as new</strong> always creates a fresh theme with a
            new ID, leaving the original untouched. Use this when you want
            to fork — duplicate-and-modify without losing the original.
          </li>
        </ul>
        <p className='vk-docs-p'>
          Saves are stored on the VibeKit server. No login required. Each
          theme gets a unique ID, two public URLs (one for CSS, one for the
          preview page), and persists across sessions.
        </p>

        {/* ───────── Sharing & exporting ───────── */}
        <h2 className='vk-docs-h2'>Sharing &amp; exporting</h2>
        <p className='vk-docs-p'>
          Every saved theme gets a public preview page that anyone can
          visit. The page showcases your theme as a complete brand: hero
          with logo + name + description, web + mobile mockups, the full
          color palette, type scale, an icons grid, themed components, and
          all four export formats with one-click copy.
        </p>
        <ul className='vk-docs-ul'>
          <li className='vk-docs-li'>
            <strong>CSS variables.</strong> Paste into your global{' '}
            <code>:root</code> selector. Works everywhere CSS works.
          </li>
          <li className='vk-docs-li'>
            <strong>Tailwind config.</strong> Drop into{' '}
            <code>tailwind.config.js</code> under <code>theme.extend</code>.
            Adds your colors as Tailwind utility classes (
            <code>bg-primary</code>, <code>text-secondary</code>, etc.) and
            registers your fonts and border radius.
          </li>
          <li className='vk-docs-li'>
            <strong>Tokens JSON.</strong> The{' '}
            <a
              href='https://design-tokens.github.io/community-group/format/'
              target='_blank'
              rel='noreferrer'
            >
              W3C Design Tokens
            </a>{' '}
            format. Consumable by Style Dictionary, the Figma Tokens plugin,
            and most modern design-system tooling.
          </li>
          <li className='vk-docs-li'>
            <strong>SCSS variables.</strong> A flat list of{' '}
            <code>$color-primary</code>, <code>$font-header</code>, etc., for
            Sass projects.
          </li>
        </ul>

        <div className='vk-docs-callout'>
          <strong>Direct CSS URL.</strong> If you'd rather not paste, every
          theme also has a live CSS file at{' '}
          <code>/themes/{'{id}'}/css</code>. Link it from your HTML and your
          page picks up the tokens automatically.
        </div>

        {/* ───────── Using it ───────── */}
        <h2 className='vk-docs-h2'>Using your theme in a project</h2>
        <p className='vk-docs-p'>
          However you export, your tokens land as CSS custom properties on{' '}
          <code>:root</code>. Reference them anywhere in your stylesheet:
        </p>
        <pre className='vk-docs-code-block'>
          <span className='tok-comment'>
            {`/* Your component, using VibeKit tokens */`}
          </span>
          {`
.button-primary {
  background: `}
          <span className='tok-key'>var</span>
          {`(--color-primary);
  color: `}
          <span className='tok-key'>var</span>
          {`(--color-neutral-light);
  border-radius: `}
          <span className='tok-key'>var</span>
          {`(--border-radius);
  font-family: `}
          <span className='tok-key'>var</span>
          {`(--font-header);
  font-weight: `}
          <span className='tok-val'>600</span>
          {`;
}`}
        </pre>
        <p className='vk-docs-p'>
          Any rule that uses <code>var(--*)</code> automatically responds
          when you swap one VibeKit theme for another — handy for theming
          preview environments, brand switches, or running an A/B on visual
          style without touching component code.
        </p>

        {/* ───────── Footer ───────── */}
        <footer className='vk-docs-footer'>
          <span>VibeKit — view-only licensed.</span>
          <Link to='/'>Back to editor →</Link>
        </footer>
      </main>
    </div>
  )
}
