import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SectionCard } from './components/SectionCard'
import { Sidebar } from './components/Sidebar'
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

const sections: ResumeSectionId[] = [
  'basics',
  'work',
  'volunteer',
  'education',
  'awards',
  'certificates',
  'publications',
  'skills',
  'languages',
  'interests',
  'references',
  'projects',
]

const RESUME_DRAFT_STORAGE_KEY = 'jsonResumeEditor:draft:v1'

type PersistedResumeDraft = {
  version: 1
  savedAt: string
  data: ResumeData
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
        area: '',
        studyType: '',
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
        `Name: ${resume.basics.name || 'Not set'}`,
        `Label: ${resume.basics.label || 'Not set'}`,
        `Image: ${resume.basics.image || 'Not set'}`,
        `Email: ${resume.basics.email || 'Not set'}`,
        `Phone: ${resume.basics.phone || 'Not set'}`,
        `URL: ${resume.basics.url || 'Not set'}`,
        `Location: ${
          [
            resume.basics.location.address,
            resume.basics.location.city,
            resume.basics.location.region,
            resume.basics.location.postalCode,
            resume.basics.location.countryCode,
          ]
            .filter(Boolean)
            .join(', ') || 'Not set'
        }`,
        `Profiles: ${resume.basics.profiles.length} entries`,
        `Summary: ${resume.basics.summary || 'Not set'}`,
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
              <li>Company URL: {item.url || 'Not set'}</li>
              <li>
                Dates: {item.startDate || 'Not set'} - {item.endDate || 'Present'}
              </li>
              <li>Summary: {item.summary || 'Not set'}</li>
              <li>
                Highlights:
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`work-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move work item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('work', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move work item down"
              disabled={index === resume.work.length - 1}
              onClick={() => moveArrayItemByOffset('work', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'work', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('work', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Organization URL: {item.url || 'Not set'}</li>
              <li>
                Dates: {item.startDate || 'Not set'} - {item.endDate || 'Present'}
              </li>
              <li>Summary: {item.summary || 'Not set'}</li>
              <li>
                Highlights:
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`volunteer-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move volunteer item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('volunteer', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move volunteer item down"
              disabled={index === resume.volunteer.length - 1}
              onClick={() => moveArrayItemByOffset('volunteer', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'volunteer', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('volunteer', index)}
            >
              Delete
            </button>
          </div>
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
              {index + 1}. {item.studyType || 'Program'} in{' '}
              {item.area || 'Area not set'}
            </p>
            <ul className="section-row-details">
              <li>Institution: {item.institution || 'Not set'}</li>
              <li>Institution URL: {item.url || 'Not set'}</li>
              <li>
                Dates: {item.startDate || 'Not set'} - {item.endDate || 'Present'}
              </li>
              <li>Score: {item.score || 'Not set'}</li>
              <li>
                Courses:
                {item.courses.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.courses.map((course, courseIndex) => (
                      <li key={`education-course-${index}-${courseIndex}`}>{course}</li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move education item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('education', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move education item down"
              disabled={index === resume.education.length - 1}
              onClick={() => moveArrayItemByOffset('education', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'education', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('education', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Date: {item.date || 'Not set'}</li>
              <li>Awarder: {item.awarder || 'Not set'}</li>
              <li>Summary: {item.summary || 'Not set'}</li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move award item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('awards', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move award item down"
              disabled={index === resume.awards.length - 1}
              onClick={() => moveArrayItemByOffset('awards', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'awards', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('awards', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Date: {item.date || 'Not set'}</li>
              <li>Issuer: {item.issuer || 'Not set'}</li>
              <li>URL: {item.url || 'Not set'}</li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move certificate item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('certificates', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move certificate item down"
              disabled={index === resume.certificates.length - 1}
              onClick={() => moveArrayItemByOffset('certificates', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() =>
                setEditingArrayItem({ section: 'certificates', index })
              }
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('certificates', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Publisher: {item.publisher || 'Not set'}</li>
              <li>Release date: {item.releaseDate || 'Not set'}</li>
              <li>URL: {item.url || 'Not set'}</li>
              <li>Summary: {item.summary || 'Not set'}</li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move publication item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('publications', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move publication item down"
              disabled={index === resume.publications.length - 1}
              onClick={() => moveArrayItemByOffset('publications', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() =>
                setEditingArrayItem({ section: 'publications', index })
              }
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('publications', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Level: {item.level || 'Not set'}</li>
              <li>
                Keywords:
                {item.keywords.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.keywords.map((keyword, keywordIndex) => (
                      <li key={`skills-keyword-${index}-${keywordIndex}`}>{keyword}</li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move skill item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('skills', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move skill item down"
              disabled={index === resume.skills.length - 1}
              onClick={() => moveArrayItemByOffset('skills', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'skills', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('skills', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Fluency: {item.fluency || 'Not set'}</li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move language item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('languages', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move language item down"
              disabled={index === resume.languages.length - 1}
              onClick={() => moveArrayItemByOffset('languages', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'languages', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('languages', index)}
            >
              Delete
            </button>
          </div>
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
                Keywords:
                {item.keywords.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.keywords.map((keyword, keywordIndex) => (
                      <li key={`interests-keyword-${index}-${keywordIndex}`}>
                        {keyword}
                      </li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move interest item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('interests', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move interest item down"
              disabled={index === resume.interests.length - 1}
              onClick={() => moveArrayItemByOffset('interests', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'interests', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('interests', index)}
            >
              Delete
            </button>
          </div>
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
              <li>Reference: {item.reference || 'Not set'}</li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move reference item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('references', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move reference item down"
              disabled={index === resume.references.length - 1}
              onClick={() => moveArrayItemByOffset('references', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'references', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('references', index)}
            >
              Delete
            </button>
          </div>
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
              <li>URL: {item.url || 'Not set'}</li>
              <li>
                Dates: {item.startDate || 'Not set'} - {item.endDate || 'Present'}
              </li>
              <li>Description: {item.description || 'Not set'}</li>
              <li>
                Highlights:
                {item.highlights.length > 0 ? (
                  <ul className="section-row-sublist">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li key={`project-highlight-${index}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  ' Not set'
                )}
              </li>
            </ul>
          </div>
          <div className="row-actions">
            <button
              type="button"
              aria-label="Move project item up"
              disabled={index === 0}
              onClick={() => moveArrayItemByOffset('projects', index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              aria-label="Move project item down"
              disabled={index === resume.projects.length - 1}
              onClick={() => moveArrayItemByOffset('projects', index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => setEditingArrayItem({ section: 'projects', index })}
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={() => requestDeleteArrayItem('projects', index)}
            >
              Delete
            </button>
          </div>
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
        <Sidebar sections={sections} activeSection={activeSection} />

        <main className="content">
          {sections.map((section) => (
            <SectionCard
              key={section}
              sectionId={section}
              title={section}
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
              actionLabel={section === 'basics' ? 'Edit' : 'Add'}
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
