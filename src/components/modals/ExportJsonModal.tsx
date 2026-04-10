import { useMemo } from 'react'
import type { ResumeData } from '../../types/resume'

interface ExportJsonModalProps {
  resume: ResumeData
  onCancel: () => void
  onSave: () => void
}

export function ExportJsonModal({
  resume,
  onCancel,
  onSave,
}: ExportJsonModalProps) {
  const jsonText = useMemo(() => JSON.stringify(resume, null, 2), [resume])

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal export-json-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-json-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="export-json-title">Export JSON</h3>
        <textarea
          readOnly
          className="export-json-preview"
          value={jsonText}
          spellCheck={false}
          aria-label="Resume JSON for export"
        />
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
