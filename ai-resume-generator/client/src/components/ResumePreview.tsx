import React from 'react';
import { ResumeContent } from '../types/resume';

interface ResumePreviewProps {
  resume: ResumeContent;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <header className="border-b-2 border-gray-200 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{resume.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600 mt-2">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>• {resume.phone}</span>}
          {resume.location && <span>• {resume.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Summary</h2>
          <p className="text-gray-700">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={ index } className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">{exp.position}</h3>
                <span className="text-gray-600">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-700 font-medium">{exp.company}</div>
              {exp.description && <p className="text-gray-600 mt-1">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Education</h2>
          {resume.education.map((edu, index) => (
            <div key={ index } className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">{edu.school}</h3>
                <span className="text-gray-600">
                  {edu.graduationDate || `${edu.startDate} - ${edu.endDate || 'Present'}`}
                </span>
              </div>
              <div className="text-gray-700">
                {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span
                key={ index }
                className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumePreview;
