export type ResumeSectionId =
  | 'basics'
  | 'work'
  | 'education'
  | 'skills'
  | 'projects'

export type ResumeArraySectionId =
  | 'work'
  | 'education'
  | 'skills'
  | 'projects'

export interface Basics {
  name: string
  label: string
  email: string
  phone: string
  url: string
  summary: string
  profiles: Profile[]
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
  area: string
  studyType: string
  startDate: string
  endDate: string
  score: string
  courses: string[]
}

export interface SkillItem {
  name: string
  level: string
  keywords: string[]
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
  education: EducationItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
}
