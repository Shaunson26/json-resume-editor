import type { ResumeSectionId } from '../types/resume'

export interface SectionDisplayMeta {
  label: string
  icon: string
}

interface SidebarProps {
  sections: ResumeSectionId[]
  activeSection: ResumeSectionId
  sectionDisplay: Record<ResumeSectionId, SectionDisplayMeta>
}

export function Sidebar({
  sections,
  activeSection,
  sectionDisplay,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>Sections</h2>
      <nav aria-label="Resume sections">
        <ul>
          {sections.map((section) => (
            <li key={section}>
              <a
                href={`#${section}`}
                className={activeSection === section ? 'is-active' : undefined}
                aria-current={activeSection === section ? 'true' : undefined}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  {sectionDisplay[section].icon}
                </span>
                <span>{sectionDisplay[section].label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
