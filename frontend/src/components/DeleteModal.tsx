import { useEffect, useRef, useState } from 'react'

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
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset and focus when opened
  useEffect(() => {
    if (isOpen) {
      setTyped('')
      // Focus next tick so the modal is mounted
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const matches = typed.trim() === themeName.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!matches) return
    onConfirm()
  }

  return (
    <div className='vk-modal-backdrop' onClick={onClose}>
      <div
        className='vk-modal'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='vk-modal-title'
      >
        <h3 id='vk-modal-title' className='vk-modal-title'>
          Delete this theme?
        </h3>
        <p className='vk-modal-body'>
          This can't be undone. The theme{' '}
          <strong>{themeName || 'Untitled Theme'}</strong> will be removed
          permanently.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor='vk-delete-confirm' className='vk-modal-confirm-label'>
            To confirm, type{' '}
            <span className='vk-modal-confirm-target'>{themeName}</span> below:
          </label>
          <input
            ref={inputRef}
            id='vk-delete-confirm'
            type='text'
            className='vk-modal-input'
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={themeName}
            autoComplete='off'
            spellCheck={false}
          />

          <div className='vk-modal-actions'>
            <button
              type='button'
              className='vk-btn vk-btn--outline vk-btn--sm'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='vk-btn vk-btn--danger vk-btn--sm'
              disabled={!matches}
            >
              Delete theme
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
