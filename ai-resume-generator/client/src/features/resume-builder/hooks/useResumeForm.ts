import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PersonalInfoFormData, 
  ExperienceFormData, 
  EducationFormData,
  ResumeFormData
} from '../types';

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const useResumeForm = (initialData?: Partial<ResumeFormData>) => {
  const [formData, setFormData] = useState<ResumeFormData>(() => ({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      jobTitle: '',
      industry: '',
      ...initialData?.personalInfo,
    },
    experience: initialData?.experience?.length ? [...initialData.experience] : [{
      id: uuidv4(),
      company: '',
      position: '',
      startDate: getCurrentDate(),
      endDate: 'Present',
      description: '',
    }],
    education: initialData?.education?.length ? [...initialData.education] : [{
      id: uuidv4(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: getCurrentDate(),
      endDate: 'Present',
      graduationDate: getCurrentDate(),
    }],
    skills: initialData?.skills || [],
  }));

  const updatePersonalInfo = useCallback((data: Partial<PersonalInfoFormData>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  }, []);

  const addExperience = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: uuidv4(),
          company: '',
          position: '',
          startDate: getCurrentDate(),
          endDate: 'Present',
          description: '',
        },
      ],
    }));
  }, []);

  const updateExperience = useCallback((index: number, data: Partial<ExperienceFormData>) => {
    setFormData(prev => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = { ...updatedExperience[index], ...data };
      return { ...prev, experience: updatedExperience };
    });
  }, []);

  const removeExperience = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: uuidv4(),
          school: '',
          degree: '',
          fieldOfStudy: '',
          startDate: getCurrentDate(),
          endDate: 'Present',
          graduationDate: getCurrentDate(),
        },
      ],
    }));
  }, []);

  const updateEducation = useCallback((index: number, data: Partial<EducationFormData>) => {
    setFormData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = { ...updatedEducation[index], ...data };
      return { ...prev, education: updatedEducation };
    });
  }, []);

  const removeEducation = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setFormData(prev => ({
      ...prev,
      skills,
    }));
  }, []);

  return {
    formData,
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
