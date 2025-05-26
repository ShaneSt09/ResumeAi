import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install: npm install uuid @types/uuid
import { 
  PersonalInfoFormData, 
  ExperienceFormData, 
  EducationFormData, 
  ResumeFormData 
} from './types';

const initialPersonalInfo: PersonalInfoFormData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  jobTitle: '',
  industry: ''
};

export const useResumeForm = (initialData?: Partial<ResumeFormData>) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>(
    initialData?.personalInfo || initialPersonalInfo
  );
  const [experience, setExperience] = useState<ExperienceFormData[]>(
    initialData?.experience || []
  );
  const [education, setEducation] = useState<EducationFormData[]>(
    initialData?.education || []
  );
  const [skills, setSkills] = useState<string[]>(
    initialData?.skills || []
  );

  const updatePersonalInfo = useCallback((data: Partial<PersonalInfoFormData>) => {
    setPersonalInfo(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  const addExperience = useCallback(() => {
    const newExperience: ExperienceFormData = {
      id: uuidv4(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setExperience(prev => [...prev, newExperience]);
  }, []);

  const updateExperience = useCallback((index: number, data: Partial<ExperienceFormData>) => {
    setExperience(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  }, []);

  const removeExperience = useCallback((index: number) => {
    setExperience(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addEducation = useCallback(() => {
    const newEducation: EducationFormData = {
      id: uuidv4(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
    };
    setEducation(prev => [...prev, newEducation]);
  }, []);

  const updateEducation = useCallback((index: number, data: Partial<EducationFormData>) => {
    setEducation(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  }, []);

  const removeEducation = useCallback((index: number) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSkills = useCallback((newSkills: string[]) => {
    setSkills(newSkills);
  }, []);

  return {
    formData: {
      personalInfo,
      experience,
      education,
      skills,
    },
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
  };
};
