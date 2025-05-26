import React, { useCallback } from 'react';
import { Input } from '../../../components/Input';
import { TextArea } from '../../../components/TextArea';
import { PersonalInfoFormData } from '../types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface PersonalInfoSectionProps {
  data: PersonalInfoFormData;
  onChange: (data: Partial<PersonalInfoFormData>) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ 
  data, 
  onChange, 
  isExpanded = true, 
  onToggle 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  }, [data, onChange]);

  const renderContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="name"
          value={data.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Job Title"
          name="jobTitle"
          value={data.jobTitle}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={data.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <TextArea
          label="Summary"
          name="summary"
          value={data.summary}
          onChange={handleChange}
          placeholder="A brief summary of your professional background and skills"
          rows={4}
          className="min-h-[120px]"
        />
      </div>
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
            <span>Personal Information</span>
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
