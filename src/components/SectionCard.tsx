import type { ReactNode } from 'react'
import type { ResumeSectionId } from '../types/resume'
import { IconPencil, IconPlus } from './ItemRowActions'

interface SectionCardProps {
  sectionId: ResumeSectionId
  title: string
  subtitle: string
  rows: ReactNode[]
  onEdit: () => void
  actionVariant: 'edit' | 'add'
}

export function SectionCard({
  sectionId,
  title,
  subtitle,
  rows,
  onEdit,
  actionVariant,
}: SectionCardProps) {
  const actionAriaLabel =
    actionVariant === 'edit' ? `Edit ${title}` : `Add ${title} entry`

  return (
    <section id={sectionId} className="section-card">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <button
          type="button"
          className="icon-action-button section-heading-action"
          aria-label={actionAriaLabel}
          onClick={onEdit}
        >
          {actionVariant === 'edit' ? <IconPencil /> : <IconPlus />}
        </button>
      </div>

      {rows.length > 0 ? (
        <ul className="section-list">
          {rows.map((row, index) => (
            <li key={`${sectionId}-${index}`}>{row}</li>
          ))}
        </ul>
      ) : (
        <p className="section-empty">No entries yet.</p>
      )}
    </section>
  )
}
