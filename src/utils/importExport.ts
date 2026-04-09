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

  const arraySections: Array<
    keyof Pick<
      ResumeData,
      | 'work'
      | 'volunteer'
      | 'education'
      | 'awards'
      | 'certificates'
      | 'publications'
      | 'skills'
      | 'languages'
      | 'interests'
      | 'references'
      | 'projects'
    >
  > = [
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

  for (const section of arraySections) {
    if (section in parsed && !Array.isArray(parsed[section])) {
      return {
        ok: false,
        error: `The "${section}" section must be an array.`,
      }
    }
  }

  const basicsValue = isRecord(parsed.basics) ? parsed.basics : {}
  const locationValue = isRecord(basicsValue.location) ? basicsValue.location : {}

  const merged: ResumeData = {
    // Keep a typed handle for optional basics object.
    // This avoids unsafe property access on unknown values.
    ...defaultResume,
    ...parsed,
    basics: {
      ...defaultResume.basics,
      ...basicsValue,
      location: {
        address: typeof locationValue.address === 'string' ? locationValue.address : '',
        postalCode:
          typeof locationValue.postalCode === 'string' ? locationValue.postalCode : '',
        city: typeof locationValue.city === 'string' ? locationValue.city : '',
        countryCode:
          typeof locationValue.countryCode === 'string'
            ? locationValue.countryCode
            : '',
        region: typeof locationValue.region === 'string' ? locationValue.region : '',
      },
      profiles: Array.isArray(basicsValue.profiles)
        ? (basicsValue.profiles as unknown[])
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
    volunteer: Array.isArray(parsed.volunteer)
      ? parsed.volunteer.filter(isRecord).map((item) => ({
          organization:
            typeof item.organization === 'string' ? item.organization : '',
          position: typeof item.position === 'string' ? item.position : '',
          url: typeof item.url === 'string' ? item.url : '',
          startDate: typeof item.startDate === 'string' ? item.startDate : '',
          endDate: typeof item.endDate === 'string' ? item.endDate : '',
          summary: typeof item.summary === 'string' ? item.summary : '',
          highlights: isStringArray(item.highlights) ? item.highlights : [],
        }))
      : defaultResume.volunteer,
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
    awards: Array.isArray(parsed.awards)
      ? parsed.awards.filter(isRecord).map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          date: typeof item.date === 'string' ? item.date : '',
          awarder: typeof item.awarder === 'string' ? item.awarder : '',
          summary: typeof item.summary === 'string' ? item.summary : '',
        }))
      : defaultResume.awards,
    certificates: Array.isArray(parsed.certificates)
      ? parsed.certificates.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          date: typeof item.date === 'string' ? item.date : '',
          issuer: typeof item.issuer === 'string' ? item.issuer : '',
          url: typeof item.url === 'string' ? item.url : '',
        }))
      : defaultResume.certificates,
    publications: Array.isArray(parsed.publications)
      ? parsed.publications.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          publisher: typeof item.publisher === 'string' ? item.publisher : '',
          releaseDate:
            typeof item.releaseDate === 'string' ? item.releaseDate : '',
          url: typeof item.url === 'string' ? item.url : '',
          summary: typeof item.summary === 'string' ? item.summary : '',
        }))
      : defaultResume.publications,
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          level: typeof item.level === 'string' ? item.level : '',
          keywords: isStringArray(item.keywords) ? item.keywords : [],
        }))
      : defaultResume.skills,
    languages: Array.isArray(parsed.languages)
      ? parsed.languages.filter(isRecord).map((item) => ({
          language: typeof item.language === 'string' ? item.language : '',
          fluency: typeof item.fluency === 'string' ? item.fluency : '',
        }))
      : defaultResume.languages,
    interests: Array.isArray(parsed.interests)
      ? parsed.interests.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          keywords: isStringArray(item.keywords) ? item.keywords : [],
        }))
      : defaultResume.interests,
    references: Array.isArray(parsed.references)
      ? parsed.references.filter(isRecord).map((item) => ({
          name: typeof item.name === 'string' ? item.name : '',
          reference: typeof item.reference === 'string' ? item.reference : '',
        }))
      : defaultResume.references,
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
