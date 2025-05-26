import React from 'react';

interface FormGroupProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  children: React.ReactNode;
  labelClassName?: string;
  inline?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  className = '',
  children,
  labelClassName = '',
  inline = false,
}) => {
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <label
        htmlFor={htmlFor}
        className={`block text-sm font-medium mb-1 ${
          error ? 'text-red-600' : 'text-gray-700'
        } ${labelClassName}`}
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    );
  };

  const renderHelpText = () => {
    if (!helpText) return null;
    
    return (
      <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
        {helpText}
      </p>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <p className="mt-1 text-sm text-red-600">
        {error}
      </p>
    );
  };

  return (
    <div className={`${inline ? 'flex items-center space-x-4' : 'space-y-1.5'} ${className}`}>
      {inline ? (
        <>
          <div className="w-1/4">
            {renderLabel()}
          </div>
          <div className="flex-1">
            {children}
            {renderHelpText()}
            {renderError()}
          </div>
        </>
      ) : (
        <>
          {renderLabel()}
          <div>
            {children}
            {renderHelpText()}
            {renderError()}
          </div>
        </>
      )}
    </div>
  );
};

export default FormGroup;
