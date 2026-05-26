import { STARTER_TEMPLATES } from '../lib/templates'
import type { Theme } from '../types/theme'

type Props = {
  onPick: (template: Theme) => void
}

export default function Templates({ onPick }: Props) {
  return (
    <>
      <p className='vk-template-intro'>
        Pick a starting point and tweak from there. Loading a template doesn't
        save anything — your work stays unsaved until you hit Save.
      </p>
      <div className='vk-template-grid'>
        {STARTER_TEMPLATES.map((tpl) => {
          const c = tpl.colors ?? {}
          const swatches: string[] = [
            c.primary,
            c.secondary,
            c.tertiary,
            c.success,
            c.danger,
          ].filter((v): v is string => Boolean(v))

          return (
            <button
              key={tpl.name}
              type='button'
              className='vk-template-card'
              onClick={() => onPick(tpl)}
              title={`Start from ${tpl.name}`}
            >
              <div
                className='vk-template-swatches'
                aria-hidden
              >
                {swatches.map((color, i) => (
                  <span key={i} style={{ background: color }} />
                ))}
              </div>
              <div className='vk-template-name'>{tpl.name}</div>
              <div className='vk-template-desc'>{tpl.description}</div>
            </button>
          )
        })}
      </div>
    </>
  )
}
