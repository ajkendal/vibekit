export default function Docs(){
  return (
    <main className="container">
      <h1>VibeKit – Docs / FAQ</h1>
      <p>VibeKit lets you pick fonts, colors, and spacing, upload a logo, and export a shareable CSS link and a public preview.</p>
      <h3>How do I use Google Fonts?</h3>
      <p>Pick <em>Header</em> and <em>Paragraph</em> fonts, then choose weights (e.g., 400, 600). The preview & CSS will include those families.</p>
      <h3>How do I share a theme?</h3>
      <p>Save a theme, then use <strong>Copy CSS URL</strong> or <strong>Open Preview</strong>. Anyone with the link can consume your tokens.</p>
      <h3>Where is my logo stored?</h3>
      <p>Uploaded logos are stored in object storage and served via <code>/api/assets/&lt;key&gt;</code>. Use PNG/SVG/JPEG/WebP.</p>
      <p><a href="#/">← Back to editor</a></p>
    </main>
  )
}
