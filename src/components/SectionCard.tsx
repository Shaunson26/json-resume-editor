import type { ReactNode } from 'react'
import type { ResumeSectionId } from '../types/resume'

interface SectionCardProps {
  sectionId: ResumeSectionId
  title: string
  subtitle: string
  rows: ReactNode[]
  onEdit: () => void
  actionLabel?: string
}

export function SectionCard({
  sectionId,
  title,
  subtitle,
  rows,
  onEdit,
  actionLabel = 'Edit',
}: SectionCardProps) {
  return (
    <section id={sectionId} className="section-card">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <button type="button" onClick={onEdit}>
          {actionLabel}
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
