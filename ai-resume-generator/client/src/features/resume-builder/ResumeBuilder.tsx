import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ExportModal } from '../../components/ExportModal';
import { useStore } from '../../store';
import { resumeAPI } from '../../services/api';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { ResumeGenerationResponse, GenerateResumeParams, JobExperience, Education } from '../../types/resume';
import { ApiResponse } from '../../types/api';
import { FiSave, FiDownload } from 'react-icons/fi';
import { 
  PersonalInfoSection, 
  ExperienceSection, 
  EducationSection, 
  SkillsSection,
  useResumeForm,
  FormSection,
  ResumeFormData
} from './index';

const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeSection, setActiveSection] = useState<FormSection>('personal');
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  const {
    formData,
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
  } = useResumeForm();

  const toggleSection = useCallback((section: FormSection) => {
    setActiveSection(prev => prev === section ? '' as FormSection : section);
  }, []);

  const isSectionExpanded = useCallback((section: FormSection) => {
    return activeSection === section;
  }, [activeSection]);

  const handleSaveToAccount = useCallback(async () => {
    if (!user) {
      navigate('/login', { state: { from: '/resume-builder' } });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: '', message: '' });

    try {
      const resumeData = {
        ...formData.personalInfo,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
        userId: user.uid,
      };

      const response = await resumeAPI.saveResume(resumeData);

      if (response.success) {
        setSaveStatus({ type: 'success', message: 'Resume saved successfully!' });
      } else {
        setSaveStatus({ type: 'error', message: response.error || 'Failed to save resume' });
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveStatus({ type: 'error', message: 'An error occurred while saving the resume' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, user, navigate]);

  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'txt') => {
    setIsExporting(true);
    try {
      let content = '';
      
      content += `${formData.personalInfo.name || ''}\n`;
      content += [
        formData.personalInfo.email,
        formData.personalInfo.phone
      ].filter(Boolean).join(' | ') + '\n\n';
      
      if (formData.personalInfo.summary) {
        content += `SUMMARY\n${formData.personalInfo.summary}\n\n`;
      }
      
      if (formData.experience && formData.experience.length > 0) {
        content += 'EXPERIENCE\n';
        formData.experience.forEach((exp) => {
          content += `${exp.position || ''} at ${exp.company || ''}\n`;
          content += `${exp.startDate || ''} - ${exp.endDate || 'Present'}\n`;
          content += `${exp.description || ''}\n\n`;
        });
      }
      
      if (formData.education && formData.education.length > 0) {
        content += 'EDUCATION\n';
        formData.education.forEach((edu) => {
          content += `${edu.degree || ''} in ${edu.fieldOfStudy || ''}\n`;
          content += `${edu.school || ''}\n`;
          content += `${edu.startDate || ''} - ${edu.endDate || 'Present'}\n\n`;
        });
      }
      
      if (formData.skills && formData.skills.length > 0) {
        content += 'SKILLS\n';
        content += formData.skills.join(', ');
      }

      if (format === 'pdf') {
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
        doc.save('resume.pdf');
      } else if (format === 'docx') {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'resume.txt');
      } else {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'resume.txt');
      }
      
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Error exporting resume:', error);
      setSaveStatus({ type: 'error', message: 'Failed to export resume' });
    } finally {
      setIsExporting(false);
    }
  }, [formData]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resume Builder</h1>
        <div className="space-x-2">
          <Button 
            onClick={handleSaveToAccount} 
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            onClick={() => setIsExportModalOpen(true)}
            disabled={isExporting}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <FiDownload className="mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {saveStatus.message && (
        <div className={`mb-4 p-3 rounded ${
          saveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {saveStatus.message}
        </div>
      )}

      <div className="space-y-6">
        <PersonalInfoSection 
          data={formData.personalInfo}
          onChange={updatePersonalInfo}
          isExpanded={isSectionExpanded('personal')}
          onToggle={() => toggleSection('personal')}
        />

        <ExperienceSection 
          experiences={formData.experience}
          onAdd={addExperience}
          onUpdate={(index, data) => updateExperience(index, data as any)}
          onRemove={removeExperience}
          isExpanded={isSectionExpanded('experience')}
          onToggle={() => toggleSection('experience')}
        />

        <EducationSection 
          education={formData.education}
          onAdd={addEducation}
          onUpdate={(index, data) => updateEducation(index, data as any)}
          onRemove={removeEducation}
          isExpanded={isSectionExpanded('education')}
          onToggle={() => toggleSection('education')}
        />

        <SkillsSection 
          skills={formData.skills}
          onChange={updateSkills}
          isExpanded={isSectionExpanded('skills')}
          onToggle={() => toggleSection('skills')}
        />
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

// Export the component as default
export default ResumeBuilder;
