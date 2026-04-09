import { defaultResume } from '../data/defaultResume'
import type { ResumeData } from '../types/resume'

interface ParseSuccess {
  ok: true
  data: ResumeData
}

interface ParseFailure {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export const parseResumeJson = (text: string): ParseResult => {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Invalid JSON file. Please check syntax.' }
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: 'Resume root must be a JSON object.' }
  }

  if ('basics' in parsed && !isRecord(parsed.basics)) {
    return { ok: false, error: 'The "basics" section must be an object.' }
  }

  const arraySections: Array<keyof Pick<ResumeData, 'work' | 'education' | 'skills' | 'projects'>> =
    ['work', 'education', 'skills', 'projects']

  for (const section of arraySections) {
    if (section in parsed && !Array.isArray(parsed[section])) {
      return {
        ok: false,
        error: `The "${section}" section must be an array.`,
      }
    }
  }

  const merged: ResumeData = {
    // Keep a typed handle for optional basics object.
    // This avoids unsafe property access on unknown values.
    ...defaultResume,
    ...parsed,
    basics: {
      ...defaultResume.basics,
      ...(isRecord(parsed.basics) ? parsed.basics : {}),
      profiles: Array.isArray((isRecord(parsed.basics) ? parsed.basics : {}).profiles)
        ? ((isRecord(parsed.basics) ? parsed.basics : {}).profiles as unknown[])
            .filter(isRecord)
            .map((item) => ({
            network: typeof item.network === 'string' ? item.network : '',
            username: typeof item.username === 'string' ? item.username : '',
            url: typeof item.url === 'string' ? item.url : '',
          }))
        : defaultResume.basics.profiles,
    },
    work: Array.isArray(parsed.work)
      ? parsed.work.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          position: typeof item.position === 'string' ? item.position : '',
          url: typeof item.url === 'string' ? item.url : '',
          startDate: typeof item.startDate === 'string' ? item.startDate : '',
          endDate: typeof item.endDate === 'string' ? item.endDate : '',
          summary: typeof item.summary === 'string' ? item.summary : '',
          highlights: isStringArray(item.highlights) ? item.highlights : [],
        }))
      : defaultResume.work,
    education: Array.isArray(parsed.education)
      ? parsed.education.filter(isRecord).map((item) => ({
          institution: typeof item.institution === 'string' ? item.institution : '',
          url: typeof item.url === 'string' ? item.url : '',
          area: typeof item.area === 'string' ? item.area : '',
          studyType: typeof item.studyType === 'string' ? item.studyType : '',
          startDate: typeof item.startDate === 'string' ? item.startDate : '',
          endDate: typeof item.endDate === 'string' ? item.endDate : '',
          score: typeof item.score === 'string' ? item.score : '',
          courses: isStringArray(item.courses) ? item.courses : [],
        }))
      : defaultResume.education,
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          level: typeof item.level === 'string' ? item.level : '',
          keywords: isStringArray(item.keywords) ? item.keywords : [],
        }))
      : defaultResume.skills,
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          startDate: typeof item.startDate === 'string' ? item.startDate : '',
          endDate: typeof item.endDate === 'string' ? item.endDate : '',
          description: typeof item.description === 'string' ? item.description : '',
          highlights: isStringArray(item.highlights) ? item.highlights : [],
          url: typeof item.url === 'string' ? item.url : '',
        }))
      : defaultResume.projects,
  }

  return { ok: true, data: merged }
}

export const downloadResumeJson = (
  resume: ResumeData,
  filename = 'resume.json',
) => {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
