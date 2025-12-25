// src/components/ui/Select.tsx
import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have this utility
import { ChevronDown } from 'lucide-react'; // Add icon for style

// Define the shape for the options prop
interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  className?: string; // Class for the wrapper
  selectClassName?: string; // Class for the <select> element itself
  options: SelectOption[]; // Array of { value, label } objects
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, name, className = '', selectClassName = '', options, placeholder, ...props }, ref) => {
    
    const inputId = id || name;

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2" // Dark, clear label
          >
            {label}
          </label>
        )}
        
        {/* Select Container */}
        <div className="relative">
          <select
            id={inputId}
            name={name}
            ref={ref}
            className={cn(
              'block w-full appearance-none border border-gray-300 rounded-lg shadow-sm transition-all',
              'focus:border-transparent focus:ring-2 focus:ring-[#000080]', // Use brand color
              
              // --- VISIBILITY FIXES ---
              'text-base', // 1. Use base font size (16px) for readability
              'text-gray-900', // 2. Make the selected text dark
              // 3. Style the placeholder option if 'value' is empty
              props.value === '' ? 'text-gray-500' : 'text-gray-900',
              
              'disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed',
              'pl-4 pr-10 py-3', // Padding (pr-10 for the icon)
              error ? 'border-error-500 ring-error-500' : 'border-gray-300', // Error state
              selectClassName
            )}
            {...props} // Pass down other props like 'value', 'onChange', 'required'
          >
            {/* Placeholder / Default Option */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Map over the provided options */}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown Icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
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

Select.displayName = 'Select';

export default Select;
