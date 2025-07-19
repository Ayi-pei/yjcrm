import React from 'react';
import { ICONS } from '../../constants';
import { designSystem } from '../../styles/design-system';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

  const variantStyles = {
    primary: `${designSystem.gradients.primary} text-white hover:shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500 border-0`,
    secondary: `bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 border border-slate-200 ${designSystem.shadows.sm} hover:${designSystem.shadows.md}`,
    danger: `${designSystem.gradients.danger} text-white hover:shadow-lg hover:shadow-red-500/25 focus:ring-red-500 border-0`,
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-blue-500 shadow-none hover:shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? ICONS.spinner : leftIcon}
      <span className={`mx-2 ${isLoading || leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}`}>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
