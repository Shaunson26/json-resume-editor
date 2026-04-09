import { useMemo, useState } from 'react'

interface ArrayItemModalProps<TItem extends object> {
  sectionLabel: string
  itemIndex: number
  initialValue: TItem
  onCancel: () => void
  onSave: (nextValue: TItem) => void
}

export function ArrayItemModal<TItem extends object>({
  sectionLabel,
  itemIndex,
  initialValue,
  onCancel,
  onSave,
}: ArrayItemModalProps<TItem>) {
  const [draft, setDraft] = useState<TItem>(initialValue)
  const dynamicArrayFieldConfig: Record<
    string,
    { key: string; addButtonLabel: string }
  > = {
    work: { key: 'highlights', addButtonLabel: 'Add highlight' },
    volunteer: { key: 'highlights', addButtonLabel: 'Add highlight' },
    education: { key: 'courses', addButtonLabel: 'Add course' },
    skills: { key: 'keywords', addButtonLabel: 'Add keyword' },
    interests: { key: 'keywords', addButtonLabel: 'Add keyword' },
    projects: { key: 'highlights', addButtonLabel: 'Add highlight' },
  }

  const keys = useMemo(() => Object.keys(initialValue), [initialValue])

  const updateTextField = (key: string, value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }) as TItem)
  }

  const updateArrayField = (key: string, value: string) => {
    const items = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    setDraft((previous) => ({ ...previous, [key]: items }) as TItem)
  }

  const updateArrayItemField = (key: string, index: number, value: string) => {
    const currentValue = (draft as Record<string, unknown>)[key]
    if (!Array.isArray(currentValue)) {
      return
    }

    const items = currentValue.map(String)
    items[index] = value
    setDraft((previous) => ({ ...previous, [key]: items }) as TItem)
  }

  const addArrayItemField = (key: string) => {
    const currentValue = (draft as Record<string, unknown>)[key]
    if (!Array.isArray(currentValue)) {
      return
    }

    const items = [...currentValue.map(String), '']
    setDraft((previous) => ({ ...previous, [key]: items }) as TItem)
  }

  const deleteArrayItemField = (key: string, index: number) => {
    const currentValue = (draft as Record<string, unknown>)[key]
    if (!Array.isArray(currentValue)) {
      return
    }

    const items = currentValue.map(String).filter((_, itemIndex) => itemIndex !== index)
    const nextItems = items.length > 0 ? items : ['']
    setDraft((previous) => ({ ...previous, [key]: nextItems }) as TItem)
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${sectionLabel} item`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3>
          Edit {sectionLabel} item #{itemIndex + 1}
        </h3>
        <div className="modal-grid">
          {keys.map((key) => {
            const value = (draft as Record<string, unknown>)[key]
            const label = key
            const isArray = Array.isArray(value)
            const dynamicArrayField = dynamicArrayFieldConfig[sectionLabel]

            if (isArray) {
              if (dynamicArrayField && key === dynamicArrayField.key) {
                const arrayItems = value.length > 0 ? value.map(String) : ['']
                return (
                  <div key={label} className="full-row">
                    <span>{label}</span>
                    {arrayItems.map((arrayItem, arrayItemIndex) => (
                      <div key={`${label}-${arrayItemIndex}`} className="row-item">
                        <input
                          value={arrayItem}
                          onChange={(event) =>
                            updateArrayItemField(
                              key,
                              arrayItemIndex,
                              event.target.value,
                            )}
                        />
                        <button
                          type="button"
                          onClick={() => deleteArrayItemField(key, arrayItemIndex)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-highlight-button"
                      onClick={() => addArrayItemField(key)}
                    >
                      {dynamicArrayField.addButtonLabel}
                    </button>
                  </div>
                )
              }

              return (
                <label key={label} className="full-row">
                  {label}
                  <textarea
                    rows={4}
                    value={value.map(String).join('\n')}
                    onChange={(event) => updateArrayField(key, event.target.value)}
                  />
                </label>
              )
            }

            return (
              <label key={label}>
                {label}
                <input
                  value={String(value ?? '')}
                  onChange={(event) => updateTextField(key, event.target.value)}
                />
              </label>
            )
          })}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
