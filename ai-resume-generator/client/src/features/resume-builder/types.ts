// Job Experience Type
export interface JobExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

// Education Type
export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}

export interface PersonalInfoFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  jobTitle: string;
  industry: string;
}

export interface ExperienceFormData {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

export interface EducationFormData {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}

export interface SkillsFormData {
  skills: string[];
}

export interface ResumeFormData {
  personalInfo: PersonalInfoFormData;
  experience: ExperienceFormData[];
  education: EducationFormData[];
  skills: string[];
}

export type FormSection = 'personal' | 'experience' | 'education' | 'skills';
