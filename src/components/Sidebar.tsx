import type { ResumeSectionId } from '../types/resume'

interface SidebarProps {
  sections: ResumeSectionId[]
  activeSection: ResumeSectionId
}

export function Sidebar({ sections, activeSection }: SidebarProps) {
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
                {section}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
