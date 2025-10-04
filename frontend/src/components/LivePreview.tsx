import { useMemo, useState } from 'react'
import { useTheme } from '../store/theme'

function hexToRgb(hex: string){ const h=hex.replace('#',''); const b=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); return {r:(b>>16)&255,g:(b>>8)&255,b:b&255} }
function s2l(c:number){ const s=c/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055,2.4) }
function lum(hex:string){ const {r,g,b}=hexToRgb(hex); return 0.2126*s2l(r)+0.7152*s2l(g)+0.0722*s2l(b) }
function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max,n)); }
function toHex(n:number){ const s = clamp(Math.round(n),0,255).toString(16).padStart(2,'0'); return s; }
function mix(c1:string, c2:string, w:number){ const a=hexToRgb(c1), b=hexToRgb(c2); const r=a.r*(1-w)+b.r*w, g=a.g*(1-w)+b.g*w, b2=a.b*(1-w)+b.b*w; return '#' + toHex(r)+toHex(g)+toHex(b2); }

export default function LivePreview(){
  const { theme } = useTheme()
  const [mode, setMode] = useState<'light'|'dark'>('light')

  const vars = useMemo(() => {
    const C = theme.colors || ({} as any)
    let surface = C.surface || C.neutral_light || '#ffffff'
    let text = C.text || '#111827'
    if (mode === 'dark'){
      surface = C.neutral_dark || '#0b0f14'
      const Lt = lum(text); if (Lt < 0.6) text = mix(text, '#ffffff', 0.8)
    }
    return {
      ['--color-surface' as any]: surface,
      ['--color-text' as any]: text,
      ['--color-primary' as any]: C.primary || '#2563eb',
      ['--color-secondary' as any]: C.secondary || '#14b8a6',
      ['--color-tertiary' as any]: C.tertiary || '#8b5cf6',
      ['--color-warning' as any]: C.warning || '#f59e0b',
      ['--color-danger' as any]: C.danger || '#ef4444',
      ['--color-caution' as any]: C.caution || '#fbbf24',
      ['--color-success' as any]: C.success || '#16a34a',
      ['--font-header' as any]: `'${theme.typography.headerFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
      ['--font-paragraph' as any]: `'${theme.typography.paragraphFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
      ['--font-base' as any]: `${theme.typography.base}px`,
      ['--font-ratio' as any]: `${theme.typography.ratio}`,
      ['--space-base' as any]: `${theme.spacing.base}px`,
    } as React.CSSProperties
  }, [theme, mode])

  return (
    <div className="card" style={{flex:'1 1 460px'}}>
      <div className="vk-preview" style={vars as any}>
        <div className="vk-toolbar">
          <span>Mode:</span>
          <button className={`vk-chip ${mode==='light'?'active':''}`} onClick={()=>setMode('light')}>Light</button>
          <button className={`vk-chip ${mode==='dark'?'active':''}`} onClick={()=>setMode('dark')}>Dark</button>
        </div>

        <header className="vk-header">
          {theme.logoUrl ? <img src={theme.logoUrl} alt="Logo" /> : null}
          <h2 style={{margin:0}}>{theme.name || 'Untitled Theme'}</h2>
        </header>

        <section className="vk-typography">
          <div className="vk-sample-header">The quick brown fox jumps over the lazy dog</div>
          <div className="vk-sample-paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        </section>

        <div className="row">
          <button className="btn primary">Primary</button>
          <button className="btn secondary">Secondary</button>
          <button className="btn danger">Danger</button>
        </div>

        <div className="row">
          <div className="card" style={{maxWidth:360}}>
            <h3>Card Title</h3>
            <p>Body text uses the paragraph font and color tokens.</p>
            <button className="btn">Action</button>
          </div>
          <div className="vk-alert warning">Warning alert using tokens.</div>
        </div>

        <label className="vk-field">
          <span>Label</span>
          <input type="text" placeholder="Type here" />
        </label>
      </div>
    </div>
  )
}
