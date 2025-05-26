import React, { useCallback } from 'react';
import { Input } from '../../../components/Input';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SkillsSectionProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  skills, 
  onChange, 
  isExpanded = true, 
  onToggle 
}) => {
  const handleSkillsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSkills = e.target.value
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);
    onChange(newSkills);
  }, [onChange]);

  const renderContent = () => (
    <div className="space-y-4">
      <Input
        label="Skills (comma separated)"
        value={skills.join(', ')}
        onChange={handleSkillsChange}
        placeholder="e.g., JavaScript, React, Node.js, Python"
      />
      <p className="text-sm text-gray-500">Separate skills with commas</p>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
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
            <span>Skills</span>
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
