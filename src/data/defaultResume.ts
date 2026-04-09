import type { ResumeData } from '../types/resume'

export const defaultResume: ResumeData = {
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    profiles: [],
  },
  work: [
    {
      name: '',
      position: '',
      url: '',
      startDate: '',
      endDate: '',
      summary: '',
      highlights: [],
    },
  ],
  education: [
    {
      institution: '',
      url: '',
      area: '',
      studyType: '',
      startDate: '',
      endDate: '',
      score: '',
      courses: [],
    },
  ],
  skills: [
    {
      name: '',
      level: '',
      keywords: [],
    },
  ],
  projects: [
    {
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: [],
      url: '',
    },
  ],
}
