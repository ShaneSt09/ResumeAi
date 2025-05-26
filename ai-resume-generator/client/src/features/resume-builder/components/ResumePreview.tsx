import React from 'react';
import { ResumeFormData } from '../types';

export interface ResumePreviewProps {
  formData: ResumeFormData;
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ formData, className = '' }) => {
  const { personalInfo, experience, education, skills } = formData;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <header className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{personalInfo.name}</h1>
        <p className="text-gray-600">{personalInfo.jobTitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-gray-600 whitespace-pre-line">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <p className="mt-1 text-gray-600 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{edu.school}</h3>
                    <p className="text-gray-600">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
