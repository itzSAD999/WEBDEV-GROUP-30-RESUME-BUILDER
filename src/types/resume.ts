export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  coursework?: string;
  bullets: string[];
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  organization: string;
}

export interface Project {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  role?: string;
  technologies?: string;
  description: string[];
}

export interface Certification {
  id: string;
  name: string;
  date: string;
  issuer: string;
}

export interface LeadershipExperience {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  bullets: string[];
}

export interface VolunteerExperience {
  id: string;
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  profile: string;
  education: Education[];
  workExperience: WorkExperience[];
  volunteering: VolunteerExperience[];
  achievements: Achievement[];
  projects: Project[];
  certifications: Certification[];
  leadership: LeadershipExperience[];
  technicalSkills: string[];
  softSkills: string[];
  interests: string[];
  customSections: CustomSection[];
  skillCategories: SkillCategory[];
  sectionOrder: string[];
  references: Reference[];
}
