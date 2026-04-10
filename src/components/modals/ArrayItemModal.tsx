import { useMemo, useState } from 'react'
import { IconDeleteButton } from '../ItemRowActions'

const MODAL_FIELD_ORDER_BY_SECTION: Partial<Record<string, string[]>> = {
  work: [
    'name',
    'position',
    'startDate',
    'endDate',
    'url',
    'summary',
    'highlights',
  ],
  education: [
    'institution',
    'url',
    'studyType',
    'area',
    'startDate',
    'endDate',
    'score',
    'courses',
  ],
}

const MODAL_FIELD_LABELS: Partial<Record<string, Record<string, string>>> = {
  education: {
    studyType: 'Education level',
  },
  work: {
    name: 'Company name',
    url: 'Company URL',
    startDate: 'Start date',
    endDate: 'End date',
  },
}

function modalFieldDisplayLabel(sectionLabel: string, fieldKey: string) {
  return MODAL_FIELD_LABELS[sectionLabel]?.[fieldKey] ?? fieldKey
}

/** Scalar fields that span both grid columns (e.g. full-width URL, summary). */
const MODAL_FULL_WIDTH_SCALAR_FIELDS: Partial<Record<string, string[]>> = {
  work: ['url', 'summary'],
}

/** Scalar string fields edited with a multi-line textarea (not the array-of-lines textarea). */
const MODAL_TEXTAREA_SCALAR_FIELDS: Partial<Record<string, string[]>> = {
  work: ['summary'],
}

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

  const keys = useMemo(() => {
    const rawKeys = Object.keys(initialValue)
    const order = MODAL_FIELD_ORDER_BY_SECTION[sectionLabel]
    if (!order) {
      return rawKeys
    }
    const ordered = order.filter((key) => rawKeys.includes(key))
    const rest = rawKeys.filter((key) => !order.includes(key))
    return [...ordered, ...rest]
  }, [initialValue, sectionLabel])

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
            const displayLabel = modalFieldDisplayLabel(sectionLabel, key)
            const labelClassName =
              displayLabel !== key ? 'modal-field-custom-label' : undefined
            const isArray = Array.isArray(value)
            const dynamicArrayField = dynamicArrayFieldConfig[sectionLabel]

            if (isArray) {
              if (dynamicArrayField && key === dynamicArrayField.key) {
                const arrayItems = value.length > 0 ? value.map(String) : ['']
                return (
                  <div key={key} className="full-row">
                    <span>{displayLabel}</span>
                    {arrayItems.map((arrayItem, arrayItemIndex) => (
                      <div key={`${key}-${arrayItemIndex}`} className="row-item">
                        <input
                          value={arrayItem}
                          onChange={(event) =>
                            updateArrayItemField(
                              key,
                              arrayItemIndex,
                              event.target.value,
                            )}
                        />
                        <IconDeleteButton
                          ariaLabel={`Remove ${displayLabel} row`}
                          onClick={() => deleteArrayItemField(key, arrayItemIndex)}
                        />
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
                <label
                  key={key}
                  className={['full-row', labelClassName].filter(Boolean).join(' ')}
                >
                  {displayLabel}
                  <textarea
                    rows={4}
                    value={value.map(String).join('\n')}
                    onChange={(event) => updateArrayField(key, event.target.value)}
                  />
                </label>
              )
            }

            const fullWidthScalar =
              MODAL_FULL_WIDTH_SCALAR_FIELDS[sectionLabel]?.includes(key) ?? false
            const textareaScalar =
              MODAL_TEXTAREA_SCALAR_FIELDS[sectionLabel]?.includes(key) ?? false
            const scalarLabelClass = [
              fullWidthScalar && 'full-row',
              labelClassName,
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <label key={key} className={scalarLabelClass || undefined}>
                {displayLabel}
                {textareaScalar ? (
                  <textarea
                    rows={4}
                    value={String(value ?? '')}
                    onChange={(event) => updateTextField(key, event.target.value)}
                  />
                ) : (
                  <input
                    value={String(value ?? '')}
                    onChange={(event) => updateTextField(key, event.target.value)}
                  />
                )}
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
