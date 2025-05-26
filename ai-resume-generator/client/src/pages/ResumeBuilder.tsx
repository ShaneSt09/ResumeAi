import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Button } from '../components/Button';
import { ResumePreview } from '../components/ResumePreview';
import { ExportModal } from '../components/ExportModal';
import { useStore } from '../store';
import { resumeAPI } from '../services/api';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { ResumeContent, JobExperience, Education, GenerateResumeParams, ResumeGenerationResponse, JobExperienceArray, EducationArray, StringArray } from '../types/resume';
import { ApiResponse } from '../types/api';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiSave, FiDownload } from 'react-icons/fi';

const mockApi = {
  generateResume: async (params: GenerateResumeParams): Promise<ApiResponse<ResumeGenerationResponse>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            name: params.targetJob,
            email: 'mock@example.com',
            phone: '123-456-7890',
            summary: 'Mock summary',
            location: 'Mock location',
            jobTitle: params.targetJob,
            industry: 'Mock industry',
            experience: params.jobExperience,
            education: params.education,
            skills: params.skills,
            projects: ['Mock project 1', 'Mock project 2'],
            atsScore: 85,
            atsKeywords: ['React', 'Node.js', 'TypeScript', 'REST APIs']
          }
        });
      }, 1000);
    });
  }
};

export const ResumeBuilder: React.FC = () => {
  // All hooks must be called at the very top, before any other code
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ type: null, message: null });
  
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  // Helper function to get current date in YYYY-MM format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [resume, setResume] = useState<ResumeContent>({
    name: '',
    email: '',
    phone: '',
    summary: '',
    location: '',
    jobTitle: '',
    industry: '',
    experience: [
      {
        company: '',
        position: '',
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
        description: ''
      }
    ],
    education: [
      {
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
        graduationDate: getCurrentDate()
      }
    ],
    skills: [] as StringArray,
    projects: [] as StringArray,
    atsScore: undefined,
    atsKeywords: [] as StringArray
  });

  // Redirect if no user
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setResume(prev => ({
        ...prev,
        skills: value.split(',').map(skill => skill.trim())
      }));
    } else {
      setResume(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleExperienceChange = (index: number, field: keyof JobExperience, value: string) => {
    setResume(prev => {
      const updatedExperience = [...prev.experience];
      
      // Format the value if it's a date field
      const updatedValue = (field === 'startDate' || field === 'endDate')
        ? formatDateValue(value)
        : value;
      
      // If start date is being set and end date is empty, set end date to 'Present'
      if (field === 'startDate' && (!updatedExperience[index].endDate || updatedExperience[index].endDate === '')) {
        updatedExperience[index] = {
          ...updatedExperience[index],
          startDate: updatedValue,
          endDate: 'Present'
        };
      } else {
        updatedExperience[index] = {
          ...updatedExperience[index],
          [field]: updatedValue
        };
      }
      
      return {
        ...prev,
        experience: updatedExperience
      };
    });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResume(prev => {
      // For date fields, ensure the value is in the correct format
      const updatedValue = (field === 'startDate' || field === 'endDate' || field === 'graduationDate')
        ? formatDateValue(value)
        : value;

      return {
        ...prev,
        education: prev.education.map((edu, i) =>
          i === index ? { ...edu, [field]: updatedValue } : edu
        )
      };
    });
  };

  // Helper function to format date values consistently
  const formatDateValue = (dateString: string): string => {
    // If the date string is 'Present' or empty, return it as is
    if (dateString === 'Present' || !dateString) return dateString;
    if (!dateString) return '';
    
    // If it's already in YYYY-MM format, return as is
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date
    
    // Format as YYYY-MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const handleAddExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: getCurrentDate(),
        endDate: 'Present',
        description: ''
      }]
    }));
  };

  const handleAddEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, {
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
        graduationDate: getCurrentDate()
      }]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveToAccount();
  };

  const handleSaveToAccount = async () => {
    try {
      setIsSaving(true);
      setSaveStatus({ type: null, message: 'Saving to your account...' });
      
      const response = await resumeAPI.saveResume(resume);
      
      if (response.success) {
        setSaveStatus({ 
          type: 'success', 
          message: 'Resume saved to your account!'
        });
      } else {
        throw new Error(response.error || 'Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save resume' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportResume = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!resume) {
      setSaveStatus({
        type: 'error',
        message: 'No resume data available to export.'
      });
      return;
    }
    try {
      setIsExporting(true);
      setSaveStatus({ type: null, message: `Preparing ${format.toUpperCase()} export...` });
      
      // Use the current resume data from state
      const resumeData = resume;

      // Generate filename
      const name = resume.name?.replace(/\s+/g, '_').toLowerCase() || 'resume';
      const filename = `${name}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        // For PDF, we'll use jsPDF to generate the PDF
        const doc = new jsPDF();
        
        // Simple text content for now - in a real app, you'd want to format this better
        let content = `${resume.name || 'Resume'}\n\n`;
        if (resume.email || resume.phone || resume.location) {
          content += `${resume.email || ''} ${resume.phone ? `• ${resume.phone} ` : ''}${resume.location ? `• ${resume.location}` : ''}\n\n`;
        }
        
        if (resume.summary) {
          content += `SUMMARY\n${resume.summary}\n\n`;
        }
        
        if (resume.experience.length > 0) {
          content += 'EXPERIENCE\n';
          resume.experience.forEach(exp => {
            content += `${exp.position} at ${exp.company}\n`;
            content += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
            if (exp.description) content += `${exp.description}\n`;
            content += '\n';
          });
        }
        
        if (resume.education.length > 0) {
          content += 'EDUCATION\n';
          resume.education.forEach(edu => {
            content += `${edu.degree} in ${edu.fieldOfStudy}\n`;
            content += `${edu.school}\n`;
            content += `${edu.startDate} - ${edu.endDate || 'Present'}\n`;
            if (edu.graduationDate) content += `Graduation Date: ${edu.graduationDate}\n`;
            content += '\n';
          });
        }
        
        if (resume.skills.length > 0) {
          content += `SKILLS\n${resume.skills.join(', ')}\n\n`;
        }
        
        // Add content to PDF
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 10, 10);
        
        // Save the PDF
        doc.save(`${filename}.pdf`);
        
      } else if (format === 'docx') {
        // For DOCX, we'll create a simple text file with .docx extension
        // In a real app, you'd want to use a library like docx to create a proper Word document
        const content = [
          resume.name || 'Resume',
          '',
          [resume.email, resume.phone, resume.location].filter(Boolean).join(' • '),
          '',
          resume.summary ? `SUMMARY\n${resume.summary}\n` : '',
          resume.experience.length > 0 ? `EXPERIENCE\n${resume.experience.map(exp => 
            `${exp.position} at ${exp.company}\n` +
            `${exp.startDate} - ${exp.endDate || 'Present'}\n` +
            (exp.description ? `${exp.description}\n` : '')
          ).join('\n')}\n` : '',
          resume.education.length > 0 ? `EDUCATION\n${resume.education.map(edu => 
            `${edu.degree} in ${edu.fieldOfStudy}\n` +
            `${edu.school}\n` +
            `${edu.startDate} - ${edu.endDate || 'Present'}` +
            (edu.graduationDate ? `\nGraduation Date: ${edu.graduationDate}` : '')
          ).join('\n\n')}\n` : '',
          resume.skills.length > 0 ? `SKILLS\n${resume.skills.join(', ')}` : ''
        ].filter(Boolean).join('\n');
        
        const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, `${filename}.docx`);
        
      } else if (format === 'txt') {
        // For plain text, we'll create a simple text file
        const content = [
          resume.name || 'Resume',
          '',
          [resume.email, resume.phone, resume.location].filter(Boolean).join(' • '),
          '',
          resume.summary ? `SUMMARY\n${resume.summary}\n` : '',
          resume.experience.length > 0 ? `EXPERIENCE\n${resume.experience.map(exp => 
            `${exp.position} at ${exp.company}\n` +
            `${exp.startDate} - ${exp.endDate || 'Present'}\n` +
            (exp.description ? `${exp.description}\n` : '')
          ).join('\n')}\n` : '',
          resume.education.length > 0 ? `EDUCATION\n${resume.education.map(edu => 
            `${edu.degree} in ${edu.fieldOfStudy}\n` +
            `${edu.school}\n` +
            `${edu.startDate} - ${edu.endDate || 'Present'}` +
            (edu.graduationDate ? `\nGraduation Date: ${edu.graduationDate}` : '')
          ).join('\n\n')}\n` : '',
          resume.skills.length > 0 ? `SKILLS\n${resume.skills.join(', ')}` : ''
        ].filter(Boolean).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${filename}.txt`);
      }
      
      // Update status
      setSaveStatus({ 
        type: 'success', 
        message: `Resume exported as ${format.toUpperCase()} successfully!` 
      });
      
    } catch (error) {
      console.error(`Error exporting resume as ${format}:`, error);
      setSaveStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : `Failed to export resume as ${format}` 
      });
    } finally {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Resume Builder</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('personal')}
              >
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                {activeSection === 'personal' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {activeSection === 'personal' && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Full Name" 
                      name="name" 
                      value={resume.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                    <Input 
                      label="Job Title" 
                      name="jobTitle" 
                      value={resume.jobTitle} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Email" 
                      name="email" 
                      value={resume.email} 
                      onChange={handleInputChange} 
                      required 
                      type="email" 
                    />
                    <Input 
                      label="Phone" 
                      name="phone" 
                      value={resume.phone} 
                      onChange={handleInputChange} 
                      required 
                      type="tel" 
                    />
                  </div>
                  <Input 
                    label="Location" 
                    name="location" 
                    value={resume.location} 
                    onChange={handleInputChange} 
                  />
                  <TextArea 
                    label="Professional Summary" 
                    name="summary" 
                    value={resume.summary} 
                    onChange={handleInputChange} 
                    rows={4}
                    className="min-h-[120px]"
                  />
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('experience')}
              >
                <h2 className="text-xl font-semibold text-gray-800">Work Experience</h2>
                {activeSection === 'experience' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {activeSection === 'experience' && (
                <div className="mt-4 space-y-4">
                  {resume.experience.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove experience"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Company"
                          value={exp.company} 
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} 
                          required 
                        />
                        <Input 
                          label="Position" 
                          value={exp.position} 
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input 
                          label="Start Date" 
                          type="month" 
                          value={exp.startDate} 
                          placeholder="Select start date"
                          onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} 
                          required 
                          className="mt-1"
                        />
                        <Input 
                          label="End Date" 
                          type="month" 
                          value={exp.endDate} 
                          placeholder="Select end date"
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} 
                          className="mt-1"
                        />
                      </div>
                      <div className="mt-4">
                        <TextArea 
                          label="Description" 
                          value={exp.description || ''} 
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} 
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddExperience}
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Experience
                  </Button>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('education')}
              >
                <h2 className="text-xl font-semibold text-gray-800">Education</h2>
                {activeSection === 'education' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {activeSection === 'education' && (
                <div className="mt-4 space-y-4">
                  {resume.education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove education"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="School" 
                          value={edu.school} 
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)} 
                          required 
                        />
                        <Input 
                          label="Degree" 
                          value={edu.degree} 
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input 
                          label="Field of Study" 
                          value={edu.fieldOfStudy || ''} 
                          onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)} 
                          className="mt-1"
                        />
                        <Input 
                          label="Graduation Date" 
                          type="month" 
                          value={edu.graduationDate || ''} 
                          placeholder="Select graduation date"
                          onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddEducation}
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Education
                  </Button>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('skills')}
              >
                <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
                {activeSection === 'skills' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {activeSection === 'skills' && (
                <div className="mt-4">
                  <Input 
                    label="Skills (comma separated)" 
                    name="skills" 
                    value={resume.skills.join(', ')} 
                    onChange={handleInputChange} 
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                  />
                  <p className="text-sm text-gray-500 mt-2">Separate skills with commas</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 gap-4 border-t border-gray-200 mt-6">
              <div className="flex-1">
                {saveStatus.message && (
                  <div className={`text-sm ${saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {saveStatus.message}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSaveToAccount}
                  disabled={isSaving}
                  className="w-full sm:w-auto justify-center"
                >
                  <FiSave className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save to Account'}
                </Button>
                <Button 
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    // Save a copy locally before exporting
                    localStorage.setItem('currentResume', JSON.stringify(resume));
                    setIsExportModalOpen(true);
                  }}
                  disabled={isSaving}
                  className="w-full sm:w-auto justify-center"
                >
                  <FiDownload className="mr-2" />
                  Export Locally
                </Button>
                
                <ExportModal 
                  isOpen={isExportModalOpen}
                  onClose={() => setIsExportModalOpen(false)}
                  onExport={exportResume}
                  isExporting={isExporting}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="sticky top-4 h-fit">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Preview</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[800px] overflow-auto">
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
