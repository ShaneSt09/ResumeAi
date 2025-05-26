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
import { useResumeForm, FormSection, ResumeFormData } from './index';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { ExperienceSection } from './components/ExperienceSection';
import { EducationSection } from './components/EducationSection';
import { SkillsSection } from './components/SkillsSection';
import { ResumePreview } from './components/ResumePreview';

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveToAccount}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <FiSave /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FiDownload /> Export
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
        
        {/* Resume Preview */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resume Preview</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <ResumePreview formData={formData} />
            </div>
          </div>
        </div>
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
export { ResumeBuilder as default };
