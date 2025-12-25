// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  className?: string; // Allow passing extra container classes
  inputClassName?: string; // Allow passing extra input classes
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, id, name, className = '', inputClassName = '', ...props }, ref) => {
    
    // Determine the ID for accessibility
    const inputId = id || name;

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2" // Darker, clear label
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Icon (if provided) */}
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
          )}
          
          <input
            id={inputId}
            name={name}
            ref={ref}
            className={cn(
              'block w-full border border-gray-300 rounded-lg shadow-sm transition-all',
              'focus:border-transparent focus:ring-2 focus:ring-[#000080]', // Use brand color for focus
              
              // --- VISIBILITY FIXES ---
              'text-base', // 1. Use base font size (16px) for readability
              'text-gray-900', // 2. Make the user's typed text dark
              'placeholder:text-gray-500', // 3. Make placeholder text darker
              'disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed', // 4. Ensure disabled state is clear
              
              Icon ? 'pl-10' : 'pl-4', // Add padding for icon
              error ? 'border-error-500 ring-error-500' : 'border-gray-300', // Error state
              'pr-4 py-3', // Standard padding
              inputClassName
            )}
            {...props}
          />
          {/* You can add a slot for a right-side icon here too (like the Eye for password) */}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-error-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
