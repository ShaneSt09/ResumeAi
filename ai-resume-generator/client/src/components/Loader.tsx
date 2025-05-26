import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'text-blue-600',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={ `flex items-center justify-center ${className}` }>
      <div
        className={ `animate-spin rounded-full border-t-2 border-b-2 border-current ${color} ${sizeClasses[size]}` }
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

// Export default for backward compatibility
export default Loader;
