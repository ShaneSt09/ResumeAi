import React, { useState } from 'react';
import { FiAlertCircle, FiCheck, FiCalendar } from 'react-icons/fi';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'name'> {
  label?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  success?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  icon,
  containerClassName = '',
  success = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = name || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;
  const showSuccess = success && value && !hasError;

  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      <label 
        htmlFor={inputId}
        className={`block text-sm font-medium transition-colors duration-200 ${
          hasError ? 'text-red-600' : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {React.cloneElement(icon as React.ReactElement, {
              className: 'h-5 w-5',
            })}
          </div>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            name={name || inputId}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`block w-full rounded-lg border bg-white text-gray-900 ${
              hasError
                ? 'border-red-300 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : showSuccess
                ? 'border-green-300 focus:outline-none focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            } ${icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 text-sm transition-all duration-200 ${
              isFocused ? 'shadow-sm ring-1 ring-blue-500' : ''
            } ${!value ? 'text-gray-400' : 'text-gray-900'} ${className}`}
            required={required}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
          {!value && (props.type === 'date' || props.type === 'month') && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">
                {props.placeholder || 'Select date'}
              </span>
            </div>
          )}
          {(props.type === 'date' || props.type === 'month') && !icon && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById(inputId) as HTMLInputElement;
                input.showPicker();
              }}
              tabIndex={-1}
            >
              <FiCalendar className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {showSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiCheck className="h-5 w-5 text-green-500" />
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

// Helper function to format date for month input
export function formatDateForInput(dateString: string, type: 'date' | 'month' = 'date'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date
    
    if (type === 'month') {
      // Format as YYYY-MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    
    return dateString; // Return as is for other types
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export default Input;
