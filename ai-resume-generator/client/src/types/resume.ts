export interface JobExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export type JobExperienceArray = JobExperience[];
export type EducationArray = Education[];
export type StringArray = string[];

export interface GenerateResumeParams {
  jobExperience: JobExperienceArray;
  education: EducationArray;
  targetJob: string;
  skills: string[];
  skillsArray?: string[];
}

export interface ResumeContent {
  name: string;
  email: string;
  phone: string;
  summary: string;
  location: string;
  jobTitle: string;
  industry: string;
  experience: JobExperienceArray;
  education: EducationArray;
  skills: string[];
  projects: string[];
  atsScore?: number;
  atsKeywords?: string[];
}

export interface ResumeGenerationResponse extends ResumeContent {
  atsScore: number;
  atsKeywords: string[];
}

export type GenerateResume = (params: GenerateResumeParams) => Promise<ResumeContent>;
