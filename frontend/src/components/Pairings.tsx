import { PAIRINGS, type FontPairing } from '../lib/font-pairings'

type Props = {
  current: { header: string; body: string }
  onApply: (pairing: FontPairing) => void
}

export default function Pairings({ current, onApply }: Props) {
  return (
    <>
      <p className='vk-fpair-intro'>
        Curated header + body combos. Click to apply both at once — weight,
        line-height, and letter-spacing stay as-is.
      </p>
      <div className='vk-fpair-grid'>
        {PAIRINGS.map((p) => {
          const isActive =
            current.header === p.header && current.body === p.body
          return (
            <button
              key={p.id}
              type='button'
              className={`vk-fpair-card ${isActive ? 'is-active' : ''}`}
              onClick={() => onApply(p)}
              title={`${p.header}${
                p.header !== p.body ? ` + ${p.body}` : ''
              }`}
            >
              <div className='vk-fpair-samples'>
                <span
                  className='vk-fpair-sample-h'
                  style={{
                    fontFamily: `'${p.header}', system-ui, sans-serif`,
                  }}
                >
                  Aa
                </span>
                <span
                  className='vk-fpair-sample-b'
                  style={{ fontFamily: `'${p.body}', system-ui, sans-serif` }}
                >
                  Aa
                </span>
              </div>
              <div className='vk-fpair-name'>{p.name}</div>
            </button>
          )
        })}
      </div>
    </>
  )
}
