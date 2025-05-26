import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'name'> {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  containerClassName?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  className = '',
  containerClassName = '',
  showCharacterCount = false,
  maxLength,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = name || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;
  const characterCount = value?.length || 0;
  const showMaxLength = maxLength !== undefined;
  const isOverLimit = showMaxLength && characterCount > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (showMaxLength && e.target.value.length > maxLength!) {
      return;
    }
    onChange(e);
  };

  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium transition-colors duration-200 ${
            hasError ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        
        {showMaxLength && (
          <span className={`text-xs ${
            isOverLimit ? 'text-red-600' : 'text-gray-500'
          }`}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          id={inputId}
          name={name || inputId}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full rounded-lg border bg-white text-gray-900 ${
            hasError
              ? 'border-red-300 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
          } px-3 py-2.5 text-sm transition-all duration-200 ${
            isFocused ? 'shadow-sm ring-1 ring-blue-500' : ''
          } ${hasError ? 'pr-10' : ''} ${className}`}
          required={required}
          maxLength={maxLength}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {hasError && (
          <div className="absolute top-2.5 right-2.5 flex items-center pointer-events-none">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
