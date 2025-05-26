import React, { useCallback } from 'react';
import { Input } from '../../../components/Input';
import { TextArea } from '../../../components/TextArea';
import { Button } from '../../../components/Button';
import { ExperienceFormData } from '../types';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ExperienceSectionProps {
  experiences: ExperienceFormData[];
  onAdd: () => void;
  onUpdate: (index: number, data: Partial<ExperienceFormData>) => void;
  onRemove: (index: number) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  onAdd,
  onUpdate,
  onRemove,
  isExpanded = true,
  onToggle,
}) => {
  const handleExperienceChange = useCallback((
    index: number,
    field: keyof ExperienceFormData,
    value: string
  ) => {
    onUpdate(index, { [field]: value });
  }, [onUpdate]);

  const renderContent = () => (
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <p className="text-gray-500">No work experience added yet.</p>
      ) : (
        experiences.map((exp, index) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative group">
            {experiences.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                title="Remove experience"
              >
                <FiTrash2 size={18} />
              </button>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div>
              <TextArea
                label="Description"
                value={exp.description}
                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                rows={3}
                className="min-h-[100px]"
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
        <FiPlus /> Add Work Experience
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
            <span>Work Experience</span>
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
