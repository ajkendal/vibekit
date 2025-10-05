import React from 'react'

type Props = {
  name: string
  saving?: boolean
  hasCurrent?: boolean
  onChange: (name: string) => void
  onSaveNew: () => void | Promise<void>
  onSaveUpdate: () => void | Promise<void>
}

export default function ThemeHeader({
  name,
  saving = false,
  hasCurrent = false,
  onChange,
  onSaveNew,
  onSaveUpdate,
}: Props) {
  return (
    <section className='card' style={{ marginBottom: 16 }}>
      <label htmlFor='themeName'>
        <strong>Theme Name</strong>
      </label>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          id='themeName'
          placeholder='e.g. Ocean Breeze'
          value={name}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            width: '100%',
            maxWidth: 420,
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type='button'
            className='btn'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSaveNew()
            }}
            disabled={saving}
            title='Create a brand new theme'
          >
            {saving ? 'Saving…' : 'Save New Theme'}
          </button>
          {hasCurrent && (
            <button
              type='button'
              className='btn'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSaveUpdate()
              }}
              disabled={saving}
              title='Update the currently loaded theme'
            >
              {saving ? 'Saving…' : 'Update Current'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
