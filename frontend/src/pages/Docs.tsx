export default function Docs() {
  return (
    <div
      className='container'
      style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}
    >
      <h1>VibeKit — Docs</h1>
      <p>
        How to use VibeKit to pick fonts, colors, and generate CSS variables.
      </p>
      <ol>
        <li>
          Choose header & paragraph fonts (weight / italic / line-height /
          letter-spacing).
        </li>
        <li>Set colors. Use the Contrast Checker for readability.</li>
        <li>
          Click <b>Save</b> to store a theme. Load or duplicate from Saved
          Themes.
        </li>
        <li>
          Copy the CSS or use the <code>/themes/:id/css</code> URL.
        </li>
        <li>
          Open preview at <code>/themes/:id/preview</code>.
        </li>
      </ol>
    </div>
  )
}
