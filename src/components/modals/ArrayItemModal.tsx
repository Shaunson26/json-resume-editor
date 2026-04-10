import { useEffect, useMemo, useState } from 'react'
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

const DYNAMIC_ARRAY_FIELD_CONFIG: Record<
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
  const [activeTab, setActiveTab] = useState<'details' | 'highlights'>('details')

  const dynamicArrayField = DYNAMIC_ARRAY_FIELD_CONFIG[sectionLabel]
  const tabbedHighlightsModal =
    Boolean(dynamicArrayField && dynamicArrayField.key === 'highlights')
  const tallDynamicListRows =
    sectionLabel === 'work' || sectionLabel === 'projects'

  useEffect(() => {
    setActiveTab('details')
  }, [initialValue, itemIndex])

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

  const detailKeys = useMemo(
    () =>
      tabbedHighlightsModal
        ? keys.filter((key) => key !== 'highlights')
        : keys,
    [keys, tabbedHighlightsModal],
  )

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

  const renderKeyedField = (key: string) => {
    const value = (draft as Record<string, unknown>)[key]
    const displayLabel = modalFieldDisplayLabel(sectionLabel, key)
    const labelClassName =
      displayLabel !== key ? 'modal-field-custom-label' : undefined
    const isArray = Array.isArray(value)

    if (isArray) {
      if (dynamicArrayField && key === dynamicArrayField.key) {
        const arrayItems = value.length > 0 ? value.map(String) : ['']
        return (
          <div key={key} className="full-row">
            <span>{displayLabel}</span>
            {arrayItems.map((arrayItem, arrayItemIndex) => (
              <div key={`${key}-${arrayItemIndex}`} className="row-item">
                <textarea
                  className={
                    tallDynamicListRows
                      ? 'row-item-textarea--tall'
                      : 'row-item-textarea--compact'
                  }
                  rows={tallDynamicListRows ? 4 : 1}
                  value={arrayItem}
                  onChange={(event) =>
                    updateArrayItemField(key, arrayItemIndex, event.target.value)
                  }
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
    const scalarLabelClass = [fullWidthScalar && 'full-row', labelClassName]
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
  }

  const tabAriaLabel = `${sectionLabel} item sections`

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
        {tabbedHighlightsModal && (
          <div className="modal-tabs" role="tablist" aria-label={tabAriaLabel}>
            <button
              type="button"
              role="tab"
              className={activeTab === 'details' ? 'is-active' : undefined}
              aria-selected={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              role="tab"
              className={activeTab === 'highlights' ? 'is-active' : undefined}
              aria-selected={activeTab === 'highlights'}
              onClick={() => setActiveTab('highlights')}
            >
              Highlights
            </button>
          </div>
        )}
        {(!tabbedHighlightsModal || activeTab === 'details') && (
          <div className="modal-grid">{detailKeys.map(renderKeyedField)}</div>
        )}
        {tabbedHighlightsModal && activeTab === 'highlights' && (
          <div className="modal-grid">{renderKeyedField('highlights')}</div>
        )}
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
