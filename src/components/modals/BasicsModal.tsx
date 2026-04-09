import { useState } from 'react'
import type { Basics } from '../../types/resume'

interface BasicsModalProps {
  initialValue: Basics
  onCancel: () => void
  onSave: (nextValue: Basics) => void
}

export function BasicsModal({
  initialValue,
  onCancel,
  onSave,
}: BasicsModalProps) {
  const [draft, setDraft] = useState<Basics>(initialValue)

  const updateField = (key: keyof Basics, value: string) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const save = () => onSave(draft)

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit basics"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Edit basics</h3>
        <div className="modal-grid">
          <label>
            Name
            <input
              value={draft.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>
          <label>
            Label
            <input
              value={draft.label}
              onChange={(event) => updateField('label', event.target.value)}
            />
          </label>
          <label>
            Email
            <input
              value={draft.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              value={draft.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </label>
          <label>
            URL
            <input
              value={draft.url}
              onChange={(event) => updateField('url', event.target.value)}
            />
          </label>
          <label className="full-row">
            Summary
            <textarea
              rows={4}
              value={draft.summary}
              onChange={(event) => updateField('summary', event.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
