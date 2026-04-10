import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { ItemRowActions } from './components/ItemRowActions'
import { SectionCard } from './components/SectionCard'
import { Sidebar, type SectionDisplayMeta } from './components/Sidebar'
import { ArrayItemModal } from './components/modals/ArrayItemModal'
import { BasicsModal } from './components/modals/BasicsModal'
import { defaultResume } from './data/defaultResume'
import { downloadResumeJson, parseResumeJson } from './utils/importExport'
import type {
  AwardItem,
  CertificateItem,
  EducationItem,
  InterestItem,
  LanguageItem,
  ProjectItem,
  PublicationItem,
  ReferenceItem,
  ResumeArraySectionId,
  ResumeData,
  ResumeSectionId,
  SkillItem,
  VolunteerItem,
  WorkItem,
} from './types/resume'

function previewDetailLine(label: string, value: string) {
  return (
    <>
      <strong>{label}</strong>
      {value ? ` ${value}` : ''}
    </>
  )
}

function formatPreviewDateRange(startRaw: string, endRaw: string) {
  const start = startRaw ?? ''
  const end = endRaw ?? ''
  if (!start && !end) {
    return ''
  }
  if (start && end) {
    return `${start} - ${end}`
  }
  if (start) {
    return `${start} - Present`
  }
  return end
}

function formatEducationPreviewTitle(item: EducationItem) {
  const study = item.studyType?.trim() || 'Program'
  const area = item.area?.trim() ?? ''
  return area === '' ? study : `${study} of ${area}`
}

const sections: ResumeSectionId[] = [
  'basics',
  'skills',
  'work',
  'education',
  'certificates',
  'projects',
  'references',
  'languages',
  'interests',
  'volunteer',
  'publications',
  'awards',
]

const RESUME_DRAFT_STORAGE_KEY = 'jsonResumeEditor:draft:v1'
const THEME_STORAGE_KEY = 'jsonResumeEditor:theme:v1'

type Theme = 'light' | 'dark'

type PersistedResumeDraft = {
  version: 1
  savedAt: string
  data: ResumeData
}

const sectionDisplay: Record<ResumeSectionId, SectionDisplayMeta> = {
  basics: { label: 'Basics', icon: '👤' },
  work: { label: 'Work', icon: '💼' },
  volunteer: { label: 'Volunteer', icon: '🤝' },
  education: { label: 'Education', icon: '🎓' },
  awards: { label: 'Awards', icon: '🏆' },
  certificates: { label: 'Certificates', icon: '📜' },
  publications: { label: 'Publications', icon: '📰' },
  skills: { label: 'Skills', icon: '🛠️' },
  languages: { label: 'Languages', icon: '🗣️' },
  interests: { label: 'Interests', icon: '🎯' },
  references: { label: 'References', icon: '👥' },
  projects: { label: 'Projects', icon: '🚀' },
}

const loadInitialResume = (): ResumeData => {
  if (typeof window === 'undefined') {
    return defaultResume
  }

  const storedValue = window.localStorage.getItem(RESUME_DRAFT_STORAGE_KEY)
  if (!storedValue) {
    return defaultResume
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<PersistedResumeDraft>
    const maybeResume = parsed.data ?? parsed
    const normalized = parseResumeJson(JSON.stringify(maybeResume))
    if (normalized.ok === false) {
      window.localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY)
      return defaultResume
    }
    return normalized.data
  } catch {
    window.localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY)
    return defaultResume
  }
}

const loadInitialSavedAt = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const storedValue = window.localStorage.getItem(RESUME_DRAFT_STORAGE_KEY)
  if (!storedValue) {
    return null
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<PersistedResumeDraft>
    return typeof parsed.savedAt === 'string' ? parsed.savedAt : null
  } catch {
    return null
  }
}

const loadInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const createEmptyArrayItem = (
  section: ResumeArraySectionId,
):
  | WorkItem
  | VolunteerItem
  | EducationItem
  | AwardItem
  | CertificateItem
  | PublicationItem
  | SkillItem
  | LanguageItem
  | InterestItem
  | ReferenceItem
  | ProjectItem => {
  switch (section) {
    case 'work':
      return {
        name: '',
        position: '',
        url: '',
        startDate: '',
        endDate: '',
        summary: '',
        highlights: [],
      }
    case 'education':
      return {
        institution: '',
        url: '',
        studyType: '',
        area: '',
        startDate: '',
        endDate: '',
        score: '',
        courses: [],
      }
    case 'volunteer':
      return {
        organization: '',
        position: '',
        url: '',
        startDate: '',
        endDate: '',
        summary: '',
        highlights: [],
      }
    case 'awards':
      return {
        title: '',
        date: '',
        awarder: '',
        summary: '',
      }
    case 'certificates':
      return {
        name: '',
        date: '',
        issuer: '',
        url: '',
      }
    case 'publications':
      return {
        name: '',
        publisher: '',
        releaseDate: '',
        url: '',
        summary: '',
      }
    case 'skills':
      return {
        name: '',
        level: '',
        keywords: [],
      }
    case 'languages':
      return {
        language: '',
        fluency: '',
      }
    case 'interests':
      return {
        name: '',
        keywords: [],
      }
    case 'references':
      return {
        name: '',
        reference: '',
      }
    case 'projects':
      return {
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
        url: '',
      }
  }
}

function App() {
  const [resume, setResume] = useState<ResumeData>(() => loadInitialResume())
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() =>
    loadInitialSavedAt(),
  )
  const [activeSection, setActiveSection] = useState<ResumeSectionId>('basics')
  const [isBasicsModalOpen, setIsBasicsModalOpen] = useState(false)
  const [editingArrayItem, setEditingArrayItem] = useState<{
    section: ResumeArraySectionId
    index: number
  } | null>(null)
  const [draggedItem, setDraggedItem] = useState<{
    section: ResumeArraySectionId
    index: number
  } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    section: ResumeArraySectionId
    index: number
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(() => loadInitialTheme())
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const moveArrayItem = useCallback((
    section: ResumeArraySectionId,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) {
      return
    }
    setResume((previous) => {
      const list = [...previous[section]]
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= list.length ||
        toIndex >= list.length
      ) {
        return previous
      }
      const [moved] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, moved)
      return {
        ...previous,
        [section]: list,
      }
    })
  }, [])

  const moveArrayItemByOffset = useCallback((
    section: ResumeArraySectionId,
    index: number,
    offset: -1 | 1,
  ) => {
    moveArrayItem(section, index, index + offset)
  }, [moveArrayItem])

  const deleteArrayItem = useCallback(
    (section: ResumeArraySectionId, index: number) => {
      setResume((previous) => ({
        ...previous,
        [section]: previous[section].filter((_, itemIndex) => itemIndex !== index),
      }))

      setEditingArrayItem((previous) => {
        if (!previous || previous.section !== section) {
          return previous
        }
        if (previous.index === index) {
          return null
        }
        if (previous.index > index) {
          return { ...previous, index: previous.index - 1 }
        }
        return previous
      })
    },
    [],
  )

  const requestDeleteArrayItem = useCallback(
    (section: ResumeArraySectionId, index: number) => {
      setPendingDelete({ section, index })
    },
    [],
  )

  const sectionDescriptions = useMemo(
    () => ({
      basics: `${resume.basics.name || 'Unnamed person'} - ${resume.basics.label || 'No label yet'}`,
      work: `${resume.work.length} entries`,
      volunteer: `${resume.volunteer.length} entries`,
      education: `${resume.education.length} entries`,
      awards: `${resume.awards.length} entries`,
      certificates: `${resume.certificates.length} entries`,
      publications: `${resume.publications.length} entries`,
      skills: `${resume.skills.length} entries`,
      languages: `${resume.languages.length} entries`,
      interests: `${resume.interests.length} entries`,
      references: `${resume.references.length} entries`,
      projects: `${resume.projects.length} entries`,
    }),
    [resume],
  )

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section))
      .filter((value): value is HTMLElement => value !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as ResumeSectionId)
          }
        })
      },
      {
        threshold: 0.5,
      },
    )

    targets.forEach((target) => observer.observe(target))

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    try {
      const savedAt = new Date().toISOString()
      const payload: PersistedResumeDraft = {
        version: 1,
        savedAt,
        data: resume,
      }
      window.localStorage.setItem(
        RESUME_DRAFT_STORAGE_KEY,
        JSON.stringify(payload),
      )
      setLastSavedAt(savedAt)
    } catch {
      // Ignore storage failures (quota/private mode) and keep app usable.
    }
  }, [resume])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const draftSavedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return 'Draft not saved yet'
    }
    const savedDate = new Date(lastSavedAt)
    if (Number.isNaN(savedDate.getTime())) {
      return 'Draft saved recently'
    }
    return `Draft saved ${savedDate.toLocaleString()}`
  }, [lastSavedAt])

  const sectionRows = useMemo(
    () => ({
      basics: [
        previewDetailLine('Name:', resume.basics.name ?? ''),
        previewDetailLine('Label:', resume.basics.label ?? ''),
        previewDetailLine('Image:', resume.basics.image ?? ''),
        previewDetailLine('Email:', resume.basics.email ?? ''),
        previewDetailLine('Phone:', resume.basics.phone ?? ''),
        previewDetailLine('URL:', resume.basics.url ?? ''),
        previewDetailLine(
          'Location:',
          [
            resume.basics.location.address,
            resume.basics.location.city,
            resume.basics.location.region,
            resume.basics.location.postalCode,
            resume.basics.location.countryCode,
          ]
            .filter(Boolean)
            .join(', '),
        ),
        (
          <>
            <strong>Profiles:</strong>
            {` ${resume.basics.profiles.length} entries`}
          </>
        ),
        previewDetailLine('Summary:', resume.basics.summary ?? ''),
      ],
      work: resume.work.map((item, index) => (
        <div
          key={`work-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'work', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'work') {
              return
            }
            moveArrayItem('work', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.position || 'Untitled role'} at{' '}
              {item.name || 'Unknown company'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Company URL:', item.url ?? '')}</li>
              <li>
                {previewDetailLine(
                  'Dates:',
                  formatPreviewDateRange(item.startDate, item.endDate),
                )}
              </li>
              <li>{previewDetailLine('Summary:', item.summary ?? '')}</li>
              <li>
                <strong>Highlights:</strong>
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`work-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.work.length - 1}
            onMoveUp={() => moveArrayItemByOffset('work', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('work', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'work', index })}
            onDelete={() => requestDeleteArrayItem('work', index)}
            labels={{
              moveUp: 'Move work item up',
              moveDown: 'Move work item down',
              edit: 'Edit work item',
              delete: 'Delete work item',
            }}
          />
        </div>
      )),
      volunteer: resume.volunteer.map((item, index) => (
        <div
          key={`volunteer-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'volunteer', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'volunteer') {
              return
            }
            moveArrayItem('volunteer', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.position || 'Volunteer role'} at{' '}
              {item.organization || 'Unknown organization'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Organization URL:', item.url ?? '')}</li>
              <li>
                {previewDetailLine(
                  'Dates:',
                  formatPreviewDateRange(item.startDate, item.endDate),
                )}
              </li>
              <li>{previewDetailLine('Summary:', item.summary ?? '')}</li>
              <li>
                <strong>Highlights:</strong>
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`volunteer-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.volunteer.length - 1}
            onMoveUp={() => moveArrayItemByOffset('volunteer', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('volunteer', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'volunteer', index })}
            onDelete={() => requestDeleteArrayItem('volunteer', index)}
            labels={{
              moveUp: 'Move volunteer item up',
              moveDown: 'Move volunteer item down',
              edit: 'Edit volunteer item',
              delete: 'Delete volunteer item',
            }}
          />
        </div>
      )),
      education: resume.education.map((item, index) => (
        <div
          key={`education-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'education', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'education') {
              return
            }
            moveArrayItem('education', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {formatEducationPreviewTitle(item)}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Institution:', item.institution ?? '')}</li>
              <li>{previewDetailLine('Institution URL:', item.url ?? '')}</li>
              <li>
                {previewDetailLine(
                  'Dates:',
                  formatPreviewDateRange(item.startDate, item.endDate),
                )}
              </li>
              <li>{previewDetailLine('Score:', item.score ?? '')}</li>
              <li>
                <strong>Courses:</strong>
                {item.courses.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.courses.map((course, courseIndex) => (
                      <li key={`education-course-${index}-${courseIndex}`}>{course}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.education.length - 1}
            onMoveUp={() => moveArrayItemByOffset('education', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('education', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'education', index })}
            onDelete={() => requestDeleteArrayItem('education', index)}
            labels={{
              moveUp: 'Move education item up',
              moveDown: 'Move education item down',
              edit: 'Edit education item',
              delete: 'Delete education item',
            }}
          />
        </div>
      )),
      awards: resume.awards.map((item, index) => (
        <div
          key={`awards-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'awards', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'awards') {
              return
            }
            moveArrayItem('awards', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.title || 'Untitled award'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Date:', item.date ?? '')}</li>
              <li>{previewDetailLine('Awarder:', item.awarder ?? '')}</li>
              <li>{previewDetailLine('Summary:', item.summary ?? '')}</li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.awards.length - 1}
            onMoveUp={() => moveArrayItemByOffset('awards', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('awards', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'awards', index })}
            onDelete={() => requestDeleteArrayItem('awards', index)}
            labels={{
              moveUp: 'Move award item up',
              moveDown: 'Move award item down',
              edit: 'Edit award item',
              delete: 'Delete award item',
            }}
          />
        </div>
      )),
      certificates: resume.certificates.map((item, index) => (
        <div
          key={`certificates-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'certificates', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'certificates') {
              return
            }
            moveArrayItem('certificates', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Untitled certificate'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Date:', item.date ?? '')}</li>
              <li>{previewDetailLine('Issuer:', item.issuer ?? '')}</li>
              <li>{previewDetailLine('URL:', item.url ?? '')}</li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.certificates.length - 1}
            onMoveUp={() => moveArrayItemByOffset('certificates', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('certificates', index, 1)}
            onEdit={() =>
              setEditingArrayItem({ section: 'certificates', index })
            }
            onDelete={() => requestDeleteArrayItem('certificates', index)}
            labels={{
              moveUp: 'Move certificate item up',
              moveDown: 'Move certificate item down',
              edit: 'Edit certificate item',
              delete: 'Delete certificate item',
            }}
          />
        </div>
      )),
      publications: resume.publications.map((item, index) => (
        <div
          key={`publications-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'publications', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'publications') {
              return
            }
            moveArrayItem('publications', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Untitled publication'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Publisher:', item.publisher ?? '')}</li>
              <li>{previewDetailLine('Release date:', item.releaseDate ?? '')}</li>
              <li>{previewDetailLine('URL:', item.url ?? '')}</li>
              <li>{previewDetailLine('Summary:', item.summary ?? '')}</li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.publications.length - 1}
            onMoveUp={() => moveArrayItemByOffset('publications', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('publications', index, 1)}
            onEdit={() =>
              setEditingArrayItem({ section: 'publications', index })
            }
            onDelete={() => requestDeleteArrayItem('publications', index)}
            labels={{
              moveUp: 'Move publication item up',
              moveDown: 'Move publication item down',
              edit: 'Edit publication item',
              delete: 'Delete publication item',
            }}
          />
        </div>
      )),
      skills: resume.skills.map((item, index) => (
        <div
          key={`skills-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'skills', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'skills') {
              return
            }
            moveArrayItem('skills', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Skill group'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Level:', item.level ?? '')}</li>
              <li>
                <strong>Keywords:</strong>
                {item.keywords.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.keywords.map((keyword, keywordIndex) => (
                      <li key={`skills-keyword-${index}-${keywordIndex}`}>{keyword}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.skills.length - 1}
            onMoveUp={() => moveArrayItemByOffset('skills', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('skills', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'skills', index })}
            onDelete={() => requestDeleteArrayItem('skills', index)}
            labels={{
              moveUp: 'Move skill item up',
              moveDown: 'Move skill item down',
              edit: 'Edit skill item',
              delete: 'Delete skill item',
            }}
          />
        </div>
      )),
      languages: resume.languages.map((item, index) => (
        <div
          key={`languages-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'languages', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'languages') {
              return
            }
            moveArrayItem('languages', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.language || 'Language not set'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Fluency:', item.fluency ?? '')}</li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.languages.length - 1}
            onMoveUp={() => moveArrayItemByOffset('languages', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('languages', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'languages', index })}
            onDelete={() => requestDeleteArrayItem('languages', index)}
            labels={{
              moveUp: 'Move language item up',
              moveDown: 'Move language item down',
              edit: 'Edit language item',
              delete: 'Delete language item',
            }}
          />
        </div>
      )),
      interests: resume.interests.map((item, index) => (
        <div
          key={`interests-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'interests', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'interests') {
              return
            }
            moveArrayItem('interests', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Interest not set'}
            </p>
            <ul className="section-row-details">
              <li>
                <strong>Keywords:</strong>
                {item.keywords.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.keywords.map((keyword, keywordIndex) => (
                      <li key={`interests-keyword-${index}-${keywordIndex}`}>
                        {keyword}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.interests.length - 1}
            onMoveUp={() => moveArrayItemByOffset('interests', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('interests', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'interests', index })}
            onDelete={() => requestDeleteArrayItem('interests', index)}
            labels={{
              moveUp: 'Move interest item up',
              moveDown: 'Move interest item down',
              edit: 'Edit interest item',
              delete: 'Delete interest item',
            }}
          />
        </div>
      )),
      references: resume.references.map((item, index) => (
        <div
          key={`references-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'references', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'references') {
              return
            }
            moveArrayItem('references', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Reference not set'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('Reference:', item.reference ?? '')}</li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.references.length - 1}
            onMoveUp={() => moveArrayItemByOffset('references', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('references', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'references', index })}
            onDelete={() => requestDeleteArrayItem('references', index)}
            labels={{
              moveUp: 'Move reference item up',
              moveDown: 'Move reference item down',
              edit: 'Edit reference item',
              delete: 'Delete reference item',
            }}
          />
        </div>
      )),
      projects: resume.projects.map((item, index) => (
        <div
          key={`projects-${index}`}
          className="section-row"
          draggable
          onDragStart={() => setDraggedItem({ section: 'projects', index })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (!draggedItem || draggedItem.section !== 'projects') {
              return
            }
            moveArrayItem('projects', draggedItem.index, index)
            setDraggedItem(null)
          }}
          onDragEnd={() => setDraggedItem(null)}
        >
          <div className="section-row-main">
            <p className="section-row-title">
              {index + 1}. {item.name || 'Untitled project'}
            </p>
            <ul className="section-row-details">
              <li>{previewDetailLine('URL:', item.url ?? '')}</li>
              <li>
                {previewDetailLine(
                  'Dates:',
                  formatPreviewDateRange(item.startDate, item.endDate),
                )}
              </li>
              <li>{previewDetailLine('Description:', item.description ?? '')}</li>
              <li>
                <strong>Highlights:</strong>
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`project-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>
          </div>
          <ItemRowActions
            canMoveUp={index > 0}
            canMoveDown={index < resume.projects.length - 1}
            onMoveUp={() => moveArrayItemByOffset('projects', index, -1)}
            onMoveDown={() => moveArrayItemByOffset('projects', index, 1)}
            onEdit={() => setEditingArrayItem({ section: 'projects', index })}
            onDelete={() => requestDeleteArrayItem('projects', index)}
            labels={{
              moveUp: 'Move project item up',
              moveDown: 'Move project item down',
              edit: 'Edit project item',
              delete: 'Delete project item',
            }}
          />
        </div>
      )),
    }),
    [
      draggedItem,
      moveArrayItem,
      moveArrayItemByOffset,
      requestDeleteArrayItem,
      resume,
    ],
  )

  const editingItemValue = useMemo(() => {
    if (!editingArrayItem) {
      return null
    }
    const { index, section } = editingArrayItem
    return resume[section][index]
  }, [editingArrayItem, resume])

  const handleSaveArrayItem = (
    nextValue:
      | WorkItem
      | VolunteerItem
      | EducationItem
      | AwardItem
      | CertificateItem
      | PublicationItem
      | SkillItem
      | LanguageItem
      | InterestItem
      | ReferenceItem
      | ProjectItem,
  ) => {
    if (!editingArrayItem) {
      return
    }
    const { section, index } = editingArrayItem
    setResume((previous) => {
      const currentList = previous[section]
      const nextList = currentList.map((item, itemIndex) =>
        itemIndex === index ? nextValue : item,
      )
      return {
        ...previous,
        [section]: nextList,
      }
    })
    setEditingArrayItem(null)
  }

  const handleClickImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const text = await file.text()
    const result = parseResumeJson(text)

    if (result.ok === false) {
      setImportError(result.error)
      event.target.value = ''
      return
    }

    setResume(result.data)
    setImportError(null)
    setIsBasicsModalOpen(false)
    setEditingArrayItem(null)
    setPendingDelete(null)
    event.target.value = ''
  }

  const handleExport = () => {
    downloadResumeJson(resume, 'resume.json')
  }

  const handleResetDraft = () => {
    setResume(defaultResume)
    setLastSavedAt(null)
    setImportError(null)
    setIsBasicsModalOpen(false)
    setEditingArrayItem(null)
    setPendingDelete(null)
    window.localStorage.removeItem(RESUME_DRAFT_STORAGE_KEY)
  }

  const toggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>JSON Resume Editor</h1>
        <div className="toolbar">
          <span className="draft-saved-status">{draftSavedLabel}</span>
          <button type="button" onClick={handleClickImport}>
            Import JSON
          </button>
          <button type="button" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" onClick={handleResetDraft}>
            Reset draft
          </button>
          <button
            type="button"
            className={`theme-toggle ${theme === 'dark' ? 'is-on' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={theme === 'dark'}
            title="Toggle dark mode"
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
            <span className="theme-toggle-label">Dark mode</span>
          </button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={handleFileImport}
      />

      {importError ? (
        <div className="error-banner" role="alert">
          <span>{importError}</span>
          <button type="button" onClick={() => setImportError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="layout">
        <Sidebar
          sections={sections}
          activeSection={activeSection}
          sectionDisplay={sectionDisplay}
        />

        <main className="content">
          {sections.map((section) => (
            <SectionCard
              key={section}
              sectionId={section}
              title={sectionDisplay[section].label}
              subtitle={sectionDescriptions[section]}
              rows={sectionRows[section]}
              onEdit={() => {
                if (section === 'basics') {
                  setIsBasicsModalOpen(true)
                  return
                }
                const nextItem = createEmptyArrayItem(section)
                const nextIndex = resume[section].length
                setResume((previous) => ({
                  ...previous,
                  [section]: [...previous[section], nextItem],
                }))
                setEditingArrayItem({ section, index: nextIndex })
              }}
              actionVariant={section === 'basics' ? 'edit' : 'add'}
            />
          ))}
        </main>
      </div>

      {isBasicsModalOpen ? (
        <BasicsModal
          initialValue={resume.basics}
          onCancel={() => setIsBasicsModalOpen(false)}
          onSave={(nextBasics) => {
            setResume((previous) => ({ ...previous, basics: nextBasics }))
            setIsBasicsModalOpen(false)
          }}
        />
      ) : null}

      {editingArrayItem && editingItemValue ? (
        <ArrayItemModal
          sectionLabel={editingArrayItem.section}
          itemIndex={editingArrayItem.index}
          initialValue={editingItemValue}
          onCancel={() => setEditingArrayItem(null)}
          onSave={handleSaveArrayItem}
        />
      ) : null}

      {pendingDelete ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Delete entry?</h3>
            <p>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  deleteArrayItem(pendingDelete.section, pendingDelete.index)
                  setPendingDelete(null)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
