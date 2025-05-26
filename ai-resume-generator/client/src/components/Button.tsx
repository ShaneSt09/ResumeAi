import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | 'none';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'md',
  shadow = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    link: 'text-blue-600 hover:text-blue-800 hover:underline p-0 h-auto',
  };
  
  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-base',
  };
  
  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
    none: 'rounded-none',
  };
  
  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg',
    '2xl': 'shadow-xl',
    inner: 'shadow-inner',
    none: 'shadow-none',
  };
  
  const iconSize = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };
  
  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${roundedStyles[rounded]}
        ${shadow !== 'none' ? shadowStyles[shadow] : ''}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'link' ? '' : 'min-h-[2.25rem]'}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <FiLoader className={`animate-spin ${iconSize[size]} mr-2`} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className={`${children ? 'mr-2' : ''} ${iconSize[size]}`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`${children ? 'ml-2' : ''} ${iconSize[size]}`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
