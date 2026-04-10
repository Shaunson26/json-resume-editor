export type ResumeSectionId =
  | 'basics'
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

export type ResumeArraySectionId =
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

export interface Basics {
  name: string
  label: string
  image: string
  email: string
  phone: string
  url: string
  summary: string
  location: Location
  profiles: Profile[]
}

export interface Location {
  address: string
  postalCode: string
  city: string
  countryCode: string
  region: string
}

export interface Profile {
  network: string
  username: string
  url: string
}

export interface WorkItem {
  name: string
  position: string
  url: string
  startDate: string
  endDate: string
  summary: string
  highlights: string[]
}

export interface EducationItem {
  institution: string
  url: string
  studyType: string
  area: string
  startDate: string
  endDate: string
  score: string
  courses: string[]
}

export interface VolunteerItem {
  organization: string
  position: string
  url: string
  startDate: string
  endDate: string
  summary: string
  highlights: string[]
}

export interface AwardItem {
  title: string
  date: string
  awarder: string
  summary: string
}

export interface CertificateItem {
  name: string
  date: string
  issuer: string
  url: string
}

export interface PublicationItem {
  name: string
  publisher: string
  releaseDate: string
  url: string
  summary: string
}

export interface SkillItem {
  name: string
  level: string
  keywords: string[]
}

export interface LanguageItem {
  language: string
  fluency: string
}

export interface InterestItem {
  name: string
  keywords: string[]
}

export interface ReferenceItem {
  name: string
  reference: string
}

export interface ProjectItem {
  name: string
  startDate: string
  endDate: string
  description: string
  highlights: string[]
  url: string
}

export interface ResumeData {
  basics: Basics
  work: WorkItem[]
  volunteer: VolunteerItem[]
  education: EducationItem[]
  awards: AwardItem[]
  certificates: CertificateItem[]
  publications: PublicationItem[]
  skills: SkillItem[]
  languages: LanguageItem[]
  interests: InterestItem[]
  references: ReferenceItem[]
  projects: ProjectItem[]
}
