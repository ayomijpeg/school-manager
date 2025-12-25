// src/components/ui/EmptyState.tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {/* Icon */}
      {Icon && (
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-center mb-6 max-w-sm">{description}</p>
      )}

      {/* Custom Content */}
      {children}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
