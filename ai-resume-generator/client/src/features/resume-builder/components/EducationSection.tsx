import React, { useCallback } from 'react';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { EducationFormData } from '../types';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface EducationSectionProps {
  education: EducationFormData[];
  onAdd: () => void;
  onUpdate: (index: number, data: Partial<EducationFormData>) => void;
  onRemove: (index: number) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onAdd,
  onUpdate,
  onRemove,
  isExpanded = true,
  onToggle,
}) => {
  const handleEducationChange = useCallback((
    index: number,
    field: keyof EducationFormData,
    value: string
  ) => {
    onUpdate(index, { [field]: value });
  }, [onUpdate]);

  const renderContent = () => (
    <div className="space-y-4">
      {education.length === 0 ? (
        <p className="text-gray-500">No education added yet.</p>
      ) : (
        education.map((edu, index) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4 relative group">
            {education.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                title="Remove education"
              >
                <FiTrash2 size={18} />
              </button>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Field of Study"
                value={edu.fieldOfStudy}
                onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                required
              />
              <Input
                label="Location"
                value={edu.location}
                onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={edu.startDate}
                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={edu.endDate}
                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
              />
            </div>
          </div>
        ))
      )}
      <Button
        type="button"
        onClick={onAdd}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <FiPlus /> Add Education
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {onToggle ? (
        <>
          <div 
            className="flex items-center cursor-pointer text-lg font-medium text-gray-700"
            onClick={onToggle}
          >
            <span>Education</span>
            <span className="ml-2">
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {isExpanded && renderContent()}
        </>
      ) : (
        renderContent()
      )}
    </div>
  );
};
