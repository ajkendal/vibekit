import { useState } from 'react'

type Props = {
  isOpen: boolean
  themeName: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteModal({
  isOpen,
  themeName,
  onClose,
  onConfirm,
}: Props) {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const requiredPassword = import.meta.env.VITE_DELETE_PASSWORD as string
    if (password !== requiredPassword) {
      setPasswordError('Incorrect password')
      return
    }

    // Reset form state and close modal
    setPassword('')
    setPasswordError('')
    onConfirm()
  }

  function handleClose() {
    setPassword('')
    setPasswordError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          minWidth: 400,
          maxWidth: 500,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Delete Theme</h3>
        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          Are you sure you want to delete "<strong>{themeName}</strong>"? This
          action cannot be undone.
        </p>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor='deletePassword'
            style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}
          >
            Enter password to confirm:
          </label>
          <input
            id='deletePassword'
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
            }}
            placeholder='Password'
            style={{
              width: '100%',
              padding: '10px 12px',
              border: passwordError ? '1px solid #dc2626' : '1px solid #e5e7eb',
              borderRadius: 8,
              marginBottom: 8,
              fontSize: 14,
            }}
            autoFocus
          />
          {passwordError && (
            <p style={{ margin: '0 0 16px 0', color: '#dc2626', fontSize: 14 }}>
              {passwordError}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type='button'
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                backgroundColor: '#dc2626',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Delete Theme
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
