import React from 'react';

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        name={ name }
        value={ value }
        onChange={ onChange }
        className={ `
          block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500
          ${className}
        ` }
      >
        {options.map((option) => (
          <option key={ option.value } value={ option.value }>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
