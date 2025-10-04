import { useState } from 'react'
import { useTheme } from '../store/theme'

function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max, n)) }
function hexToRgb(hex: string){ const h=hex.replace('#',''); const b=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); return {r:(b>>16)&255,g:(b>>8)&255,b:b&255} }
function rgbToHex(r:number,g:number,b:number){ const H=(n:number)=>clamp(Math.round(n),0,255).toString(16).padStart(2,'0'); return `#${H(r)}${H(g)}${H(b)}` }
function rgbToHsl(r:number,g:number,b:number){
  r/=255;g/=255;b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2;
  if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break} h/=6
  } return {h,s,l}
}
function hslToRgb(h:number,s:number,l:number){
  let r:number,g:number,b:number
  const hue2rgb=(p:number,q:number,t:number)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p }
  if(s===0){ r=g=b=l } else { const q=l<.5?l*(1+s):l+s-l*s; const p=2*l-q; r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3) }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)}
}
function shiftHue(hex:string,deg:number){ const {r,g,b}=hexToRgb(hex); const {h,s,l}=rgbToHsl(r,g,b); let nh=(h+(deg/360))%1; if(nh<0) nh+=1; const {r:rr,g:rg,b:rb}=hslToRgb(nh,s,l); return rgbToHex(rr,rg,rb) }
function withSat(hex:string, mult:number){ const {r,g,b}=hexToRgb(hex); const hsl=rgbToHsl(r,g,b); const {r:rr,g:rg,b:rb}=hslToRgb(hsl.h, clamp(hsl.s*mult,0,1), hsl.l); return rgbToHex(rr,rg,rb) }
function withLight(hex:string, mult:number){ const {r,g,b}=hexToRgb(hex); const hsl=rgbToHsl(r,g,b); const {r:rr,g:rg,b:rb}=hslToRgb(hsl.h, hsl.s, clamp(hsl.l*mult,0,1)); return rgbToHex(rr,rg,rb) }

export default function PaletteGenerator(){
  const { theme, setTheme } = useTheme()
  const [seed, setSeed] = useState(theme.colors.primary || '#2563eb')

  const variants = [
    { name: 'Triadic', gen: (c:string) => ({
      primary: c,
      secondary: shiftHue(c, 120),
      tertiary: shiftHue(c, -120)
    })},
    { name: 'Analogous', gen: (c:string) => ({
      primary: c,
      secondary: shiftHue(c, 30),
      tertiary: shiftHue(c, -30)
    })},
    { name: 'Complementary', gen: (c:string) => ({
      primary: c,
      secondary: withSat(shiftHue(c, 180), 0.9),
      tertiary: withLight(shiftHue(c, 180), 1.15)
    })}
  ]

  function applyPalette(p:{primary:string,secondary:string,tertiary:string}){
    setTheme(t => ({
      ...t,
      colors: {
        ...t.colors,
        primary: p.primary, secondary: p.secondary, tertiary: p.tertiary,
        // suggest neutrals based on seed
        neutral_light: '#ffffff',
        neutral_dark: '#0b0f14'
      }
    }))
  }

  return (
    <div className="card">
      <strong>Generate Palette</strong>
      <div className="row">
        <input type="color" value={seed} onChange={e=>setSeed(e.target.value)} />
        <input value={seed} onChange={e=>setSeed(e.target.value)} />
      </div>
      <div className="row" style={{flexWrap:'wrap', gap:12}}>
        {variants.map(v => {
          const p = v.gen(seed)
          return (
            <div key={v.name} className="card" style={{minWidth:220}}>
              <div style={{display:'grid', gap:6}}>
                <div style={{display:'flex', gap:6}}>
                  <span style={{background:p.primary, width:24, height:24, borderRadius:6}} />
                  <span style={{background:p.secondary, width:24, height:24, borderRadius:6}} />
                  <span style={{background:p.tertiary, width:24, height:24, borderRadius:6}} />
                </div>
                <small><strong>{v.name}</strong></small>
                <button className="btn" onClick={()=>applyPalette(p)}>Apply</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
